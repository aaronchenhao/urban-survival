/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameStage, Choice, ChoiceEffect, MonthlySummary, Achievement } from './types';
import { INITIAL_STATS, GAME_NODES, determineRescueScenario, BASE_SALARY, LIVING_COST, ACHIEVEMENTS } from './constants';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import SummaryScreen from './components/SummaryScreen';
import EndingScreen from './components/EndingScreen';
import AmbientSound from './components/AmbientSound';
import AchievementToast from './components/AchievementToast';

// Helper to ensure stats stay within 0-100 (except cash/investments)
const clampStat = (stat: string, value: number): number => {
  if (['body', 'mind', 'moral', 'performance'].includes(stat)) {
    return Math.max(0, Math.min(100, value));
  }
  return value; // Cash and Investments can go negative (debt) or unbounded positive
};

const App: React.FC = () => {
  // Initialize playCount from localStorage to persist across reloads
  const [playCount, setPlayCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('csl_play_count');
      return saved ? parseInt(saved, 10) : 1;
    } catch (e) {
      return 1;
    }
  });

  // Achievement State
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('csl_achievements');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null);
  const toastQueue = useRef<Achievement[]>([]);

  // Added lastRoundEffects to track immediate changes
  // Added summaryPending to handle phase transition pause
  const [gameState, setGameState] = useState<GameState & { lastRoundEffects?: ChoiceEffect[]; summaryPending?: boolean }>({
    stage: GameStage.INTRO,
    currentNodeIndex: 0,
    stats: { ...INITIAL_STATS },
    history: [],
    flags: [],
    rngSeed: Math.random(),
    lastRoundEffects: undefined,
    summaryPending: false,
    isLegacyRun: false, 
    lastRescueNodeIndex: -10, // Initialize far back so first turn doesn't block
  });

  // --- ACHIEVEMENT LOGIC ---
  const unlockAchievement = (id: string) => {
      if (!unlockedAchievements.includes(id)) {
          const newUnlocked = [...unlockedAchievements, id];
          setUnlockedAchievements(newUnlocked);
          localStorage.setItem('csl_achievements', JSON.stringify(newUnlocked));
          
          const achData = ACHIEVEMENTS.find(a => a.id === id);
          if (achData) {
              toastQueue.current.push(achData);
              processToastQueue();
          }
      }
  };

  const processToastQueue = () => {
      if (!currentToast && toastQueue.current.length > 0) {
          setCurrentToast(toastQueue.current.shift()!);
      }
  };

  const handleToastClose = () => {
      setCurrentToast(null);
      // Wait a bit before showing next one if exists
      setTimeout(() => processToastQueue(), 200); 
  };

  // Monitor Game State for Achievements
  useEffect(() => {
      // 1. Check Condition-based Achievements
      ACHIEVEMENTS.forEach(ach => {
          if (!unlockedAchievements.includes(ach.id) && ach.condition) {
              if (ach.condition(gameState.stats, gameState.flags, gameState.history)) {
                  unlockAchievement(ach.id);
              }
          }
      });

      // 2. Special Check: First Step (Start Game)
      if (gameState.stage === GameStage.PLAYING && gameState.history.length === 0 && !unlockedAchievements.includes('ach_first_step')) {
          unlockAchievement('ach_first_step');
      }

  }, [gameState, unlockedAchievements]);


  const handleStartGame = (initialEffects: ChoiceEffect[], flags: string[]) => {
    setGameState((prev) => {
      const newStats = { ...prev.stats };
      initialEffects.forEach((effect) => {
        const newVal = newStats[effect.stat] + effect.value;
        newStats[effect.stat] = clampStat(effect.stat, newVal);
      });

      return {
        ...prev,
        stats: newStats,
        flags: flags,
        stage: GameStage.PLAYING,
        currentNodeIndex: 0,
        rngSeed: Math.random(),
        lastRoundEffects: initialEffects, // Show effects of start config
        isLegacyRun: flags.includes('LEGACY_CONNECTION'), // Check if legacy flag present
        lastRescueNodeIndex: -10,
      };
    });
  };

  // UPDATED: Phase Finance Calculation (x6 multiplier for 6 months per phase)
  // Handles dual investment returns, housing appreciation, and prevents negative balance
  const calculatePeriodFinance = (currentState: GameState): { stats: typeof currentState.stats, summary: MonthlySummary, newFlag?: string } => {
    const { stats, currentNodeIndex, flags, isLegacyRun } = currentState;
    const newStats = { ...stats };
    const currentNode = GAME_NODES[currentNodeIndex];
    
    // --- NEW MECHANIC: CITY NETWORKING VS SUBURB COMMUTE ---
    let specialEventMsg = '';
    let addedFlag = undefined;

    // 1. City Renter "Fortune" (Networking)
    if (flags.includes('RENT_CITY') && !flags.includes('SALARY_BUMP')) {
        const chance = Math.random();
        if (chance < 0.15) { // 15% Chance per period
            addedFlag = 'SALARY_BUMP';
            specialEventMsg = '【福报降临】你在电梯里偶遇了大厂高管并获得内推。薪资永久提升至 ¥8500！';
        }
    }

    // 2. Suburb Renter "Fatigue" (Performance penalty)
    if (flags.includes('RENT_SUBURB')) {
        newStats.performance = clampStat('performance', newStats.performance - 5);
        // Also minor mind hit from commuting
        newStats.mind = clampStat('mind', newStats.mind - 2);
    }

    // --- INCOME ---
    let monthlySalary = BASE_SALARY; 
    
    // Apply Salary Bump
    if (flags.includes('SALARY_BUMP') || addedFlag === 'SALARY_BUMP') {
        monthlySalary = 8500;
    }

    // Adjust salary for unemployed
    if (flags.includes('UNEMPLOYED') || flags.includes('BIZ_FAIL')) {
        monthlySalary = 0;
    } else if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) {
        monthlySalary = 3500; // Founders take minimal salary
    }

    const salary = monthlySalary * 6;
    
    // --- EXPENSES ---
    // Rent Calculation: Fixed to 6 months per period.
    const rentMonths = 6;

    let monthlyRent = 0;
    let houseAppreciationValue = 0;
    let currentHouseValue = 0;

    if (flags.includes('OWN_HOUSE')) {
        monthlyRent = 5500; // Mortgage is CRUSHING
        newStats.mind = clampStat('mind', newStats.mind + 5); 
        
        const baseValue = 2500000;
        const appRate = 0.02; 
        houseAppreciationValue = baseValue * appRate;
        
        currentHouseValue = baseValue + (houseAppreciationValue * (Math.floor(currentNodeIndex / 3)));
    } else if (flags.includes('RENT_CITY')) {
        // City Rent: 4000. Salary (6000) - Living (3000) - Rent (4000) = -1000 deficit.
        monthlyRent = 4000; 
        newStats.body = clampStat('body', newStats.body + 2);
        newStats.mind = clampStat('mind', newStats.mind + 2);
    } else if (flags.includes('RENT_SUBURB')) {
        // Suburb Rent: 2500. Salary (6000) - Living (3000) - Rent (2500) = +500 surplus.
        monthlyRent = 2500; 
        newStats.body = clampStat('body', newStats.body - 5);
        newStats.mind = clampStat('mind', newStats.mind - 5);
    }
    
    let rent = monthlyRent * rentMonths;
    
    // INFLATION MECHANIC: Living cost increases over time
    // 5% increase every phase (3 nodes)
    const inflationRate = 1 + (Math.floor(currentNodeIndex / 3) * 0.05);
    const living = Math.round(LIVING_COST * 6 * inflationRate); 

    // CHECK FOR ANNUAL INSURANCE FEE
    if (GAME_NODES[currentNodeIndex].month === 12 && flags.includes('INS_YES')) {
        rent += 4000; 
    }

    // --- INVESTMENTS ---
    // Safe: Low yield
    const safeYield = 1.5; 
    const safeProfit = Math.round(newStats.safeInvest * (safeYield / 100));

    // Risky: Trend-based Logic
    // Default Base (Volatile): -20 to +20 (Mean 0)
    let minYield = -20;
    let maxYield = 20;
    
    const marketTrend = currentNode.marketTrend || 'VOLATILE';
    
    if (marketTrend === 'BULL') {
        minYield = 5; maxYield = 35;
    } else if (marketTrend === 'BEAR') {
        minYield = -35; maxYield = -5;
    } else if (marketTrend === 'FLAT') {
        minYield = -5; maxYield = 8;
    } else if (marketTrend === 'VOLATILE') {
        minYield = -40; maxYield = 40;
    }

    // Network Buff: Reduces volatility (raises the floor)
    if (flags.includes('NETWORK_UP')) {
        minYield += 10; 
        maxYield += 5; // Slight upside buff
    }
    
    // Legacy Buff
    if (isLegacyRun) {
        minYield += 5;
        maxYield += 5;
    }

    // ENTREPRENEUR OVERRIDE: Extreme Volatility
    if (flags.includes('ENTREPRENEUR')) {
        minYield = -50; maxYield = 80;
    }
    // NAKED LOAN OVERRIDE: Insane Volatility
    if (flags.includes('NAKED_LOAN')) {
        minYield = -100; maxYield = 200; 
    }

    const rand = Math.random(); 
    const riskyYield = minYield + (rand * (maxYield - minYield));
    
    let riskyProfit = Math.round(newStats.riskyInvest * (riskyYield / 100));
    
    // Safety check: Cannot lose more than principal
    if (newStats.riskyInvest + riskyProfit < 0) {
        riskyProfit = -newStats.riskyInvest;
    }
    
    // --- DEBT ---
    let interest = 0;
    let debtPrincipal = 0;

    // 1. Base Debt (Overdraft): If cash is negative, that's debt.
    if (newStats.cash < 0) {
        debtPrincipal += Math.abs(newStats.cash);
    }

    // 2. Hidden Predatory Debt: If NAKED_LOAN flag exists, add 500k to calculation base
    // Even if cash is positive, you owe this money and must pay interest on it.
    if (flags.includes('NAKED_LOAN')) {
        debtPrincipal += 500000;
    }

    if (debtPrincipal > 0) {
        // Base interest rate per month for normal debt (e.g. Credit Card ~3% mo)
        let monthlyRate = 0.03; 
        
        // PREDATORY LENDING: If DEBT_TRAP or NAKED_LOAN is active, rate is 10% rolling per month
        // Lowered from 15% to 10% to allow winning chances. 
        // 10% monthly ~= 77% per 6mo.
        if (flags.includes('DEBT_TRAP') || flags.includes('NAKED_LOAN')) {
            monthlyRate = 0.10; 
        }
        
        // Compound Interest Formula for 6 months
        // Interest = Principal * ((1 + r)^6 - 1)
        interest = Math.round(debtPrincipal * (Math.pow(1 + monthlyRate, 6) - 1));
    }

    // Apply changes
    const totalChange = salary + safeProfit + riskyProfit - rent - living - interest;
    
    newStats.cash += (salary - rent - living - interest); 
    newStats.safeInvest += safeProfit;
    newStats.riskyInvest += riskyProfit;

    return {
        stats: newStats,
        newFlag: addedFlag,
        summary: {
            month: GAME_NODES[currentNodeIndex].month, // This will be the node JUST finished
            salary,
            rent, // This now represents "Rent or Mortgage" + Insurance Fee if applicable
            livingCost: living,
            safeYield,
            riskyYield,
            safeProfit,
            riskyProfit,
            debtInterest: interest,
            totalChange,
            housingValuation: flags.includes('OWN_HOUSE') ? currentHouseValue + houseAppreciationValue : undefined,
            housingAppreciation: flags.includes('OWN_HOUSE') ? houseAppreciationValue : undefined,
            specialEvent: specialEventMsg || undefined
        }
    };
  };

  const handleChoice = (choice: Choice) => {
    setGameState((prev) => {
      let newStats = { ...prev.stats };
      let newFlags = [...prev.flags];
      
      // 1. Apply Choice Effects with Clamping
      choice.effects.forEach((effect) => {
        const newVal = newStats[effect.stat] + effect.value;
        newStats[effect.stat] = clampStat(effect.stat, newVal);
      });

      // 2. Add Flag
      if (choice.flag && !newFlags.includes(choice.flag)) {
        newFlags.push(choice.flag);
      }

      // 3. Sub-Event Logic (Stay in Node)
      if (choice.nextEventId) {
        return {
          ...prev,
          stats: newStats,
          history: [...prev.history, choice.id],
          flags: newFlags,
          currentSubEventId: choice.nextEventId,
          lastEventLog: undefined, 
          lastRoundEffects: choice.effects, // Pass effects for feedback
        };
      }

      // 4. End of Node Logic
      
      const nextIndex = prev.currentNodeIndex + 1;
      const isFinished = nextIndex >= GAME_NODES.length;

      if (isFinished) {
          return {
              ...prev,
              stats: newStats,
              history: [...prev.history, choice.id],
              flags: newFlags,
              currentNodeIndex: nextIndex,
              stage: GameStage.ENDING,
              lastRoundEffects: choice.effects,
          };
      }

      // Check if this is the end of a phase (Node Index 2, 5, 8)
      // (prev.currentNodeIndex + 1) % 3 === 0
      const isPhaseEnd = (prev.currentNodeIndex + 1) % 3 === 0;

      if (isPhaseEnd) {
          // MODIFIED: Do NOT jump to SUMMARY immediately. 
          // Pause to show feedback.
          return {
            ...prev,
            stats: newStats,
            history: [...prev.history, choice.id],
            flags: newFlags,
            // Do NOT increment currentNodeIndex yet, so we stay on the same screen context
            currentNodeIndex: prev.currentNodeIndex, 
            summaryPending: true, // Trigger the "Continue" UI
            lastRoundEffects: choice.effects,
            currentSubEventId: undefined,
          };
      } else {
          // Normal Transition
          // Pass flags to prevent re-triggering 'given up' scenarios
          const dynamicRescue = determineRescueScenario(newStats, newFlags, nextIndex, prev.lastRescueNodeIndex);
          
          let eventLog = undefined;
          let entryEffects: ChoiceEffect[] = [];
          const nextNode = GAME_NODES[nextIndex];
          let currentFlags = [...newFlags];
          
          if (nextNode && nextNode.onEnter) {
             const eventResult = nextNode.onEnter(currentFlags, prev.rngSeed, newStats); // PASSED STATS for Moral Check
             if (eventResult) {
               eventLog = eventResult.text;
               entryEffects = eventResult.effects;
               eventResult.effects.forEach(e => {
                   const newVal = newStats[e.stat] + e.value;
                   newStats[e.stat] = clampStat(e.stat, newVal);
               });
               if (eventResult.flags) {
                   eventResult.flags.forEach(f => {
                       if (!currentFlags.includes(f)) currentFlags.push(f);
                   });
               }
             }
          }

          const combinedEffects = [...choice.effects, ...entryEffects];

          if (dynamicRescue) {
             return {
                ...prev,
                stats: newStats,
                history: [...prev.history, choice.id],
                flags: currentFlags,
                currentNodeIndex: nextIndex,
                stage: GameStage.PLAYING,
                activeRescue: dynamicRescue,
                lastEventLog: undefined,
                currentSubEventId: undefined,
                lastRoundEffects: combinedEffects,
                lastRescueNodeIndex: nextIndex, // Mark this node as having a rescue
             };
          }

          return {
              ...prev,
              stats: newStats,
              history: [...prev.history, choice.id],
              flags: currentFlags,
              currentNodeIndex: nextIndex,
              stage: GameStage.PLAYING,
              activeRescue: undefined,
              currentSubEventId: undefined,
              lastEventLog: eventLog,
              lastRoundEffects: combinedEffects,
          };
      }
    });
  };

  // NEW: Called when player clicks "Check Finance Report" after the pause
  const handleProceedToSummary = () => {
    setGameState((prev) => {
        const financeResult = calculatePeriodFinance(prev);
        
        let updatedFlags = [...prev.flags];
        if (financeResult.newFlag && !updatedFlags.includes(financeResult.newFlag)) {
            updatedFlags.push(financeResult.newFlag);
        }

        return {
            ...prev,
            stats: financeResult.stats,
            flags: updatedFlags,
            stage: GameStage.SUMMARY,
            activeRescue: undefined,
            currentSubEventId: undefined,
            lastSummary: financeResult.summary,
            lastRoundEffects: undefined, // Clear effects
            summaryPending: false, // Reset flag
        };
    });
  };

  const handleSummaryContinue = (newSafe: number, newRisky: number, newCash: number) => {
      setGameState(prev => {
          const newStats = { ...prev.stats, safeInvest: newSafe, riskyInvest: newRisky, cash: newCash };
          
          // Increment Node Index HERE for the next phase start
          const nextIndex = prev.currentNodeIndex + 1;
          
          // Check Rescue (using new stats after adjustment)
          // Also pass flags here
          const dynamicRescue = determineRescueScenario(newStats, prev.flags, nextIndex, prev.lastRescueNodeIndex);
          
          let eventLog = undefined;
          let entryEffects: ChoiceEffect[] = [];
          
          if (nextIndex >= GAME_NODES.length) {
              return {
                  ...prev,
                  stats: newStats,
                  stage: GameStage.ENDING
              };
          }

          const nextNode = GAME_NODES[nextIndex];
          let currentFlags = [...prev.flags];
          
          if (nextNode && nextNode.onEnter) {
            const eventResult = nextNode.onEnter(currentFlags, prev.rngSeed, newStats); // PASSED STATS
            if (eventResult) {
              eventLog = eventResult.text;
              entryEffects = eventResult.effects;
              eventResult.effects.forEach(e => {
                const newVal = newStats[e.stat] + e.value;
                newStats[e.stat] = clampStat(e.stat, newVal);
              });
              if (eventResult.flags) {
                 eventResult.flags.forEach(f => {
                   if (!currentFlags.includes(f)) currentFlags.push(f);
                 });
              }
            }
          }

          if (dynamicRescue) {
            return {
              ...prev,
              stats: newStats,
              flags: currentFlags,
              currentNodeIndex: nextIndex,
              stage: GameStage.PLAYING,
              activeRescue: dynamicRescue,
              lastEventLog: undefined,
              lastRoundEffects: entryEffects,
              lastRescueNodeIndex: nextIndex, // Mark this node as having a rescue
            };
          }

          return {
              ...prev,
              stats: newStats,
              flags: currentFlags,
              currentNodeIndex: nextIndex,
              stage: GameStage.PLAYING,
              lastEventLog: eventLog,
              lastRoundEffects: entryEffects,
          };
      });
  };

  const handleRestart = () => {
    const newCount = playCount + 1;
    setPlayCount(newCount);
    localStorage.setItem('csl_play_count', newCount.toString());

    setGameState({
      stage: GameStage.INTRO,
      currentNodeIndex: 0,
      stats: { ...INITIAL_STATS },
      history: [],
      flags: [],
      rngSeed: Math.random(),
      lastRoundEffects: undefined,
      summaryPending: false,
      isLegacyRun: false,
      lastRescueNodeIndex: -10,
    });
  };

  return (
    <div className="h-dvh bg-zinc-950 text-zinc-100 selection:bg-cyan-900 selection:text-white transition-all duration-1000 overflow-hidden">
      {/* MOUNT AMBIENT SOUND GLOBALLY */}
      <AmbientSound />

      {/* ACHIEVEMENT NOTIFICATION */}
      {currentToast && <AchievementToast achievement={currentToast} onClose={handleToastClose} />}

      {gameState.stage === GameStage.INTRO && (
        <div className="h-full flex items-center justify-center bg-[url('/assets/background.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="relative z-10 w-full h-full">
                 <StartScreen 
                    onStart={handleStartGame} 
                    unlockedAchievements={unlockedAchievements} // Pass unlocked achievement IDs
                 />
            </div>
        </div>
      )}

      {gameState.stage === GameStage.PLAYING && (
        <GameScreen
          node={GAME_NODES[gameState.currentNodeIndex]}
          subEventId={gameState.currentSubEventId}
          stats={gameState.stats}
          flags={gameState.flags}
          lastEventLog={gameState.lastEventLog}
          onChoice={handleChoice}
          activeRescue={gameState.activeRescue}
          lastRoundEffects={gameState.lastRoundEffects}
          // NEW PROPS FOR TRANSITION
          isSummaryPending={gameState.summaryPending}
          onProceedToSummary={handleProceedToSummary}
        />
      )}

      {gameState.stage === GameStage.SUMMARY && gameState.lastSummary && (
          <SummaryScreen 
            summary={gameState.lastSummary}
            stats={gameState.stats}
            onContinue={handleSummaryContinue}
          />
      )}

      {gameState.stage === GameStage.ENDING && (
        <EndingScreen
          stats={gameState.stats}
          history={gameState.history}
          flags={gameState.flags} // Pass flags for personality calc
          playCount={playCount}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;