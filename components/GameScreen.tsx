/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameNode, Choice, Stats as StatsType, RescueScenario, SimulationType, ChoiceEffect } from '../types';
import StatBar from './StatBar';
import FloatingFeedback from './FloatingFeedback';
import RulesModal from './RulesModal'; // Import RulesModal
import { ArrowRight, Bell, Siren, Activity, Wallet, Brain, Scale, TrendingUp, Minus, Plus, Lock, ChevronsUp, ChevronsDown, FileText, Clock, Users, Flame, CheckCircle2, HeartHandshake, AlertTriangle, Newspaper, Zap, Eye, HelpCircle } from 'lucide-react';

interface GameScreenProps {
  node: GameNode;
  subEventId?: string;
  stats: StatsType;
  flags: string[];
  lastEventLog?: string;
  onChoice: (choice: Choice) => void;
  activeRescue?: RescueScenario;
  lastRoundEffects?: ChoiceEffect[]; 
  isSummaryPending?: boolean;
  onProceedToSummary?: () => void;
}

interface SimulationResult {
  text: string;
  effects: ChoiceEffect[];
  flag?: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
    node, 
    subEventId, 
    stats, 
    flags, 
    lastEventLog, 
    onChoice, 
    activeRescue, 
    lastRoundEffects,
    isSummaryPending, 
    onProceedToSummary 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shake, setShake] = useState(false);
  const [showRules, setShowRules] = useState(false); // State for Rules Modal
  
  // --- Simulation States ---
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [simResult, setSimResult] = useState<SimulationResult | null>(null); 
  
  // Negotiation State
  const [negRound, setNegRound] = useState(0);
  const [negLog, setNegLog] = useState<string[]>([]);
  const [negMood, setNegMood] = useState(50); 
  const [negPressure, setNegPressure] = useState(0); 
  
  // Caili (Bride Price) State
  const [cailiOffer, setCailiOffer] = useState<number>(0);

  // Trigger shake ONLY ON CRITICAL STATS (Body/Mind < 10)
  useEffect(() => {
    // Only shake if we have recent effects AND stats are critically low
    if (lastRoundEffects && (stats.body < 10 || stats.mind < 10)) {
        setShake(true);
        const timer = setTimeout(() => setShake(false), 500);
        return () => clearTimeout(timer);
    }
  }, [lastRoundEffects, stats.body, stats.mind]);

  // Reset Simulation State on Node Change
  useEffect(() => {
    setSimResult(null);

    if (node.simulation) {
      if (node.simulation.type === 'ALLOCATION' || node.simulation.type === 'CRISIS_RESOURCE') {
        const initial: Record<string, number> = {};
        node.simulation.categories?.forEach(c => initial[c.id] = 0);
        setAllocations(initial);
      } else if (node.simulation.type === 'NEGOTIATION') {
        setNegRound(0);
        setNegLog([]);
        setNegMood(50);
        setNegPressure(30);
      }
    }
    // Reset Caili default
    setCailiOffer(15); 
  }, [node.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [node.id, activeRescue?.id, subEventId, simResult]);


  // --- Render Logic ---

  let currentTitle = node.title;
  let currentContext = node.context(flags, stats);
  let currentChoices: Choice[] = [];
  
  let isRescue = !!activeRescue;
  let isSubEvent = !isRescue && !!subEventId;
  
  let isSimulationNode = !isRescue && !!node.simulation;
  
  const isCailiSim = subEventId === 'n9-sub-caili-sim';

  // Determine standard choices
  if (isRescue && activeRescue) {
    currentTitle = activeRescue.title;
    currentContext = activeRescue.context;
    currentChoices = activeRescue.choices;
  } else if (isSubEvent && subEventId && node.events && node.events[subEventId]) {
    const subEvent = node.events[subEventId];
    currentTitle = subEvent.title ? subEvent.title : node.title; 
    
    // Fix: Call context function with correct number of parameters
    if (typeof subEvent.context === 'function') {
      const contextFn = subEvent.context;
      if (contextFn.length === 2) {
        currentContext = contextFn(flags, stats);
      } else if (contextFn.length === 1) {
        currentContext = contextFn(flags);
      } else {
        currentContext = contextFn();
      }
    } else {
      currentContext = subEvent.context;
    }
    
    // Fix: Call choices function with correct number of parameters or use as array
    if (Array.isArray(subEvent.choices)) {
      currentChoices = subEvent.choices;
    } else if (typeof subEvent.choices === 'function') {
      const choicesFn = subEvent.choices;
      if (choicesFn.length === 2) {
        currentChoices = choicesFn(flags, stats);
      } else if (choicesFn.length === 1) {
        currentChoices = choicesFn(flags);
      } else {
        currentChoices = choicesFn();
      }
    } else {
      currentChoices = [];
    }
  } else if (!isSimulationNode) {
    // Standard Node Choices
    currentChoices = node.choices ? (Array.isArray(node.choices) ? node.choices : node.choices(flags, stats)) : [];
  }

  // --- Simulation Logic Helpers ---
  const handleAllocationChange = (id: string, delta: number, maxPoints: number) => {
    const currentTotal = (Object.values(allocations) as number[]).reduce((a: number, b: number) => a + b, 0);
    const currentVal = allocations[id] || 0;
    if (delta > 0 && currentTotal + delta > maxPoints) return;
    if (currentVal + delta < 0) return;
    setAllocations(prev => ({ ...prev, [id]: prev[id] + delta }));
  };

  const submitAllocation = () => {
    const effects: ChoiceEffect[] = [];
    let flag = '';
    let resultText = '';

    if (node.simulation?.type === 'ALLOCATION') {
      const rest = allocations['rest'] || 0;
      // Map synonyms for Node 2 (travel/work) and Node 8 (social/hustle)
      const consumption = (allocations['travel'] || 0) + (allocations['social'] || 0);
      const production = (allocations['work'] || 0) + (allocations['hustle'] || 0);
      const totalPoints = node.simulation.totalPoints || 1;

      // FIXED: Removed rest cost (rest * 100) as living costs are covered.
      effects.push({ stat: 'body', value: (rest * 2) - (production * 3) });
      effects.push({ stat: 'mind', value: rest + (consumption * 4) - (production * 2) });
      effects.push({ stat: 'cash', value: (production * 800) - (consumption * 1500) });
      
      // Dynamic threshold: > 50% of time spent triggers flag
      if (production > totalPoints * 0.5) {
          flag = 'WORKAHOLIC';
          resultText = '你在假期里疯狂加班，钱包鼓了，但身体像被掏空一样。';
      } else if (consumption > totalPoints * 0.5) {
          flag = 'HEDONIST';
          resultText = '这趟行程/社交掏空了积蓄，但朋友圈的点赞让你觉得物有所值。';
      } else {
          resultText = '你度过了一个相对平庸的假期，一切似乎都在计划之中。';
      }
    }
    
    if (node.simulation?.type === 'CRISIS_RESOURCE') {
       const blame = allocations['blame'] || 0; 
       const overtime = allocations['overtime'] || 0;
       const ignore = allocations['ignore'] || 0;
       const safetyScore = (blame * 1.2) + (overtime * 1.0) + (ignore * 0.1); 
       
       effects.push({ stat: 'moral', value: Math.round(-(blame * 0.4)) }); 
       effects.push({ stat: 'body', value: Math.round(-(overtime * 0.3)) }); 
       effects.push({ stat: 'mind', value: Math.round(ignore * 0.1) }); 

       if (safetyScore >= 80) {
         flag = 'CRISIS_AVERTED';
         resultText = '危机解除。你的应对策略非常奏效（或者说足够圆滑），位置保住了。';
         effects.push({ stat: 'mind', value: 5 }); 
       } else if (safetyScore >= 50) {
         flag = 'CRISIS_SURVIVED';
         resultText = '勉强过关。虽然保住了工作，但你在领导心中的印象分大打折扣。';
         effects.push({ stat: 'cash', value: -2000 }); 
       } else {
         flag = 'CRISIS_FAILED';
         resultText = '处理失败。因为你的应对不够积极或策略失误，你成为了主要责任人，面临停职降薪。';
         effects.push({ stat: 'cash', value: -8000 }); 
         effects.push({ stat: 'mind', value: -15 });
       }
    }

    setSimResult({ text: resultText, effects: effects, flag: flag });
  };

  const handleNegotiation = (stance: 'HARD' | 'SOFT' | 'MEDIATE') => {
    let moodChange = 0;
    let pressureChange = 0;
    let log = '';

    if (stance === 'HARD') {
      moodChange = -20;
      pressureChange = 30;
      log = '你强硬地拒绝了不合理要求。对方脸色铁青，但显然感受到了你的底线。';
    } else if (stance === 'SOFT') {
      moodChange = 15;
      pressureChange = -10;
      log = '你温和地试图讲道理。对方态度缓和，但似乎把你当成了软柿子。';
    } else {
      moodChange = -5;
      pressureChange = 10;
      log = '你搬出了客观事实/第三方。气氛尴尬，但话题被拉回了理性层面。';
    }

    setNegMood(prev => Math.max(0, Math.min(100, prev + moodChange)));
    setNegPressure(prev => Math.max(0, Math.min(100, prev + pressureChange)));
    setNegLog(prev => [...prev, log]);
    setNegRound(prev => prev + 1);
  };

  const endNegotiation = () => {
    const effects: ChoiceEffect[] = [];
    let flag = '';
    let resultText = '';

    if (negPressure > 80) {
      effects.push({ stat: 'mind', value: -10 });
      effects.push({ stat: 'moral', value: 5 }); 
      effects.push({ stat: 'cash', value: 0 }); 
      flag = 'NEG_BREAKDOWN';
      resultText = '谈判破裂。你守住了尊严，但关系降至冰点。对方摔门而去。';
    } else if (negMood > 80) {
      effects.push({ stat: 'cash', value: -20000 }); 
      effects.push({ stat: 'moral', value: 10 }); 
      flag = 'NEG_COMPROMISE';
      resultText = '你做出了巨大让步。对方非常满意，但你看着缩水的存款，心里不是滋味。';
    } else {
      effects.push({ stat: 'cash', value: -5000 }); 
      effects.push({ stat: 'mind', value: 5 });
      flag = 'NEG_SUCCESS';
      resultText = '达成共识。虽然各退一步，但至少问题解决了，生活还得继续。';
    }

    setSimResult({ text: resultText, effects: effects, flag: flag });
  };
  
  const submitCaili = () => {
    const hasBoughtHouseWithHelp = flags.includes('OWN_HOUSE');
    const isIsolated = flags.includes('SOCIAL_ISOLATION');
    const totalAmount = cailiOffer * 10000; 
    
    // Logic update: If Isolated, parents CANNOT help.
    // If Bought House, parents CANNOT help.
    const isConflict = hasBoughtHouseWithHelp || isIsolated;
    
    let nextEvent = '';
    
    if (cailiOffer < 10) {
        nextEvent = 'n9-sub-caili-result-low';
        onChoice({ id: 'caili-submit-low', text: 'Low Offer', effects: [{stat:'mind', value: -20}, {stat: 'body', value: -10}], nextEventId: nextEvent });
    } else if (cailiOffer > 20) {
        nextEvent = 'n9-sub-caili-result-high';
        onChoice({ id: 'caili-submit-high', text: 'High Offer', effects: [{stat:'mind', value: 20}, {stat: 'moral', value: 5}], nextEventId: nextEvent });
    } else {
        if (isConflict) {
            // Must pay fully
            nextEvent = 'n9-sub-caili-result-mid-house';
            onChoice({ id: 'caili-submit-mid-house', text: 'Mid Offer (Self)', effects: [{stat:'cash', value: -totalAmount}, {stat:'mind', value: -20}], nextEventId: nextEvent });
        } else {
            // Split
            nextEvent = 'n9-sub-caili-result-mid-norm';
            const playerShare = totalAmount * 0.2;
            onChoice({ id: 'caili-submit-mid-norm', text: 'Mid Offer (Split)', effects: [{stat:'cash', value: -playerShare}, {stat:'mind', value: -25}], nextEventId: nextEvent });
        }
    }
  };

  const confirmSimulationResult = () => {
      if (!simResult) return;
      onChoice({
          id: 'sim-confirm',
          text: '确认结果',
          effects: simResult.effects,
          flag: simResult.flag
      });
  };

  const getCailiFeedback = () => {
    if (cailiOffer < 10) return { icon: '💔', text: '女友觉得你缺乏诚意，感情面临危机...', color: 'text-rose-500' };
    if (cailiOffer > 20) return { icon: '🤑', text: '岳父岳母喜笑颜开，但这笔钱让你大出血。', color: 'text-emerald-400' };
    
    // Special Warning if Isolated
    if (flags.includes('SOCIAL_ISOLATION')) {
        return { icon: '🚫', text: '【众叛亲离】因信用破产，父母拒绝资助。你必须独自承担！', color: 'text-red-500 font-bold animate-pulse' };
    }

    if (flags.includes('OWN_HOUSE') && cailiOffer >= 10 && cailiOffer <= 20) return { icon: '💸', text: '【钱包预警】因已买房，父母无力支持，此区间需全额自费！', color: 'text-orange-400 animate-pulse' };
    return { icon: '😐', text: '中规中矩，父母会承担大部分，但仍有压力。', color: 'text-blue-300' };
  };

  const SimulationResultView = () => (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mt-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <CheckCircle2 size={24} />
              <h3 className="text-lg font-bold">模拟结束：结果结算</h3>
          </div>
          <p className="text-zinc-200 mb-6 leading-relaxed">
              {simResult?.text}
          </p>
          <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 mb-6">
              <h4 className="text-xs font-mono text-zinc-500 mb-3 uppercase">核心数值变化</h4>
              <div className="grid grid-cols-2 gap-4">
                  {simResult?.effects.map((effect, idx) => {
                      const isPositive = effect.value > 0;
                      return (
                          <div key={idx} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-1">
                              <span className="text-zinc-400 capitalize">{effect.stat}</span>
                              <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isPositive ? '+' : ''}{effect.value}
                              </span>
                          </div>
                      );
                  })}
              </div>
          </div>
          <button onClick={confirmSimulationResult} className="w-full py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
             <span>进入下一阶段</span><ArrowRight size={18} />
          </button>
      </div>
  );

  const MobileStatItem = ({ icon: Icon, label, value, colorClass }: any) => (
      <div className="flex flex-col items-center justify-center p-2">
          <div className="flex items-center gap-1.5 mb-1 text-zinc-400">
             <Icon size={12} />
             <span className="text-[10px] font-bold tracking-widest">{label}</span>
          </div>
          <span className={`font-mono font-bold text-lg leading-none ${colorClass}`}>{value}</span>
      </div>
  );

  const totalInvestment = stats.safeInvest + stats.riskyInvest;
  const isIsolated = flags.includes('SOCIAL_ISOLATION');
  const isHouseOwner = flags.includes('OWN_HOUSE');
  
  // INSIDER INFO CHECK
  const hasInsider = flags.includes('NETWORK_UP');
  let insiderPrediction = '';
  if (hasInsider) {
      const trend = node.marketTrend || 'VOLATILE';
      if (trend === 'BULL') insiderPrediction = '预期上行 (Strong Buy)';
      else if (trend === 'BEAR') insiderPrediction = '预期暴跌 (Strong Sell)';
      else if (trend === 'FLAT') insiderPrediction = '横盘整理 (Hold)';
      else insiderPrediction = '高波动风险 (High Volatility)';
  }

  return (
    <div className={`fixed inset-0 h-dvh flex flex-col md:flex-row bg-zinc-950 text-zinc-100 ${isRescue ? 'ring-4 ring-inset ring-red-900/30' : ''} ${shake ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      {/* RENDER RULES MODAL IF VISIBLE */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {lastRoundEffects && (!isSimulationNode || isSummaryPending) && !simResult && <FloatingFeedback effects={lastRoundEffects} />}

      {/* MOBILE HEADER (Visible on small screens) */}
      <div className="md:hidden shrink-0 bg-zinc-950 border-b border-zinc-800 z-30 flex flex-col shadow-xl">
          <div className="flex justify-between items-center px-4 py-3 bg-zinc-900/50 pr-4">
             <div className="flex items-center gap-2">
                {!isRescue ? (
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">第 {node.month.toString().padStart(2, '0')} 月</span>
                ) : (
                    <span className="text-[10px] font-bold text-red-500 bg-red-950/30 border border-red-900 px-2 py-0.5 rounded animate-pulse">警报</span>
                )}
             </div>
             
             {/* Rules Button for Mobile */}
             <button onClick={() => setShowRules(true)} className="p-1.5 bg-zinc-800/50 rounded-full text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 border border-zinc-700/50 transition-colors">
                <HelpCircle size={16} />
             </button>

             <div className="flex items-center gap-2">
                <Wallet size={16} className={stats.cash < 5000 ? "text-red-500" : "text-emerald-400"} />
                <span className={`font-mono font-bold text-xl tracking-tight ${stats.cash < 5000 ? 'text-red-500' : 'text-emerald-400'}`}>¥{stats.cash.toLocaleString()}</span>
             </div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-zinc-800/50 border-t border-zinc-800 bg-black/20">
             <MobileStatItem icon={Activity} label="身体" value={stats.body} colorClass={stats.body < 30 ? 'text-red-500' : (stats.body >= 60 ? 'text-cyan-400' : 'text-zinc-300')} />
             <MobileStatItem icon={Brain} label="心理" value={stats.mind} colorClass={stats.mind < 30 ? 'text-red-500' : (stats.mind >= 60 ? 'text-purple-400' : 'text-zinc-300')} />
             <MobileStatItem icon={Scale} label="道德" value={stats.moral} colorClass={stats.moral < 30 ? 'text-red-500' : (stats.moral >= 60 ? 'text-yellow-400' : 'text-zinc-300')} />
             <MobileStatItem icon={Zap} label="绩效" value={stats.performance} colorClass={stats.performance < 40 ? 'text-red-500 animate-pulse' : 'text-zinc-300'} />
          </div>
      </div>

      {/* DESKTOP SIDEBAR (Visible on md+) */}
      <div className="hidden md:flex w-80 bg-zinc-900 border-r border-zinc-800 p-6 flex-col gap-6 shrink-0 z-20 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="text-xs font-mono text-zinc-500 tracking-wider">状态监控 (STATUS MONITOR)</div>
          <div className={`text-xs font-mono animate-pulse ${isRescue ? 'text-red-500 font-bold' : 'text-cyan-500'}`}>{isRescue ? '严重警报' : '系统在线'}</div>
        </div>
        <div className="grid gap-6">
          <StatBar label="现金流" statKey="cash" value={stats.cash} />
          <div className="flex flex-col gap-1 text-sm w-full">
             <div className="flex justify-between items-center text-zinc-300">
                <div className="flex items-center gap-2"><TrendingUp size={16} /><span className="font-mono tracking-wider">投资账户</span></div>
                <span className="font-mono font-bold text-lg tracking-tight text-blue-400">¥ {totalInvestment.toLocaleString()}</span>
             </div>
             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1 flex">
                 <div className="h-full bg-blue-500" style={{ width: `${totalInvestment > 0 ? (stats.safeInvest / totalInvestment * 100) : 0}%` }} />
                 <div className="h-full bg-purple-500" style={{ width: `${totalInvestment > 0 ? (stats.riskyInvest / totalInvestment * 100) : 0}%` }} />
             </div>
             <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                 <span>稳健: {(totalInvestment > 0 ? (stats.safeInvest / totalInvestment * 100) : 0).toFixed(0)}%</span>
                 <span>激进: {(totalInvestment > 0 ? (stats.riskyInvest / totalInvestment * 100) : 0).toFixed(0)}%</span>
             </div>
          </div>
          <StatBar label="身体机能" statKey="body" value={stats.body} />
          <StatBar label="心理san值" statKey="mind" value={stats.mind} />
          <StatBar label="社会道德" statKey="moral" value={stats.moral} />
          <StatBar label="工作绩效" statKey="performance" value={stats.performance} />
        </div>
        
        {/* Rules Button for Desktop (Placed in sidebar bottom or near top) */}
        <button 
            onClick={() => setShowRules(true)}
            className="mt-4 w-full py-2 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700 hover:border-cyan-500/30 transition-all text-xs font-bold uppercase tracking-wider"
        >
            <HelpCircle size={14} /> 查阅生存手册
        </button>

        {flags.length > 0 && (
          <div className="mt-auto">
            <div className="text-xs font-mono text-zinc-500 mb-3 border-b border-zinc-800 pb-1">剧情标签 (NARRATIVE TAGS)</div>
            <div className="flex flex-wrap gap-2">
              {flags.map(f => (
                <span key={f} className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded font-mono hover:bg-zinc-700 transition-colors cursor-default">#{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative h-full">
        {/* NEWS TICKER */}
        {!isRescue && node.news && (
            <div className="bg-cyan-950/20 border-b border-cyan-900/30 py-1 px-4 flex items-center justify-between overflow-hidden">
                <div className="flex-1 overflow-hidden whitespace-nowrap">
                    <div className="inline-block animate-marquee text-sm md:text-base font-medium text-cyan-400/90 tracking-wide">
                        {node.news}
                    </div>
                </div>
                {/* INSIDER INFO BADGE */}
                {hasInsider && (
                    <div className="shrink-0 ml-4 flex items-center gap-1.5 px-2 py-0.5 bg-yellow-950/50 border border-yellow-700/50 rounded text-[10px] font-bold text-yellow-400 animate-pulse">
                        <Eye size={10} />
                        <span className="hidden md:inline font-mono">INSIDER: {insiderPrediction}</span>
                        <span className="md:hidden font-mono">{insiderPrediction.split(' ')[0]}</span>
                    </div>
                )}
            </div>
        )}
        <style>{`
            @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            .animate-marquee {
                animation: marquee 20s linear infinite;
            }
        `}</style>

        {/* NODE TITLE HEADER - Desktop */}
        <div className={`hidden md:block shrink-0 px-5 py-4 border-b z-20 shadow-sm ${isRescue ? 'bg-red-950/20 border-red-900/50' : 'bg-zinc-900/40 border-zinc-800'}`}>
           <div className="flex items-center gap-2 mb-1">
              {!isRescue ? (
                <div className="flex gap-2">
                   <span className="font-mono text-[10px] px-1.5 py-0.5 border border-cyan-800 bg-cyan-950/50 rounded text-cyan-500 tracking-wider">第 {node.month.toString().padStart(2, '0')} 月</span>
                   {isSimulationNode && <span className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 border border-purple-700 bg-purple-950/50 rounded text-purple-400 tracking-wider"><Users size={10} /> 互动模拟</span>}
                </div>
              ) : (
                 <span className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 border border-red-800 bg-red-950/50 rounded text-red-500 animate-pulse"><Siren size={10} /> 紧急干预</span>
              )}
           </div>
           <h2 className={`text-xl md:text-2xl font-bold leading-tight ${isRescue ? 'text-red-100' : 'text-white'}`}>{currentTitle}</h2>
        </div>

        {/* NODE TITLE HEADER - Mobile */}
        <div className="md:hidden px-4 pt-4 pb-2">
           <h2 className={`text-lg font-bold leading-tight ${isRescue ? 'text-red-100' : 'text-white'}`}>{currentTitle}</h2>
        </div>

        {/* SCROLLABLE STORY CONTENT */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 pt-0 md:p-8 scroll-smooth pb-32 md:pb-48">
          <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
            
            {lastEventLog && !isRescue && !isSubEvent && (
              <div className="p-3 md:p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg flex gap-3 animate-fade-in-up">
                <Bell size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                <div className="text-xs md:text-sm text-emerald-100/90 leading-relaxed whitespace-pre-wrap">{lastEventLog}</div>
              </div>
            )}

            <div className="prose prose-invert prose-sm md:prose-base prose-p:text-zinc-200 prose-p:leading-6 md:prose-p:leading-7 max-w-none">
              {currentContext.split('\n').map((paragraph, idx) => (
                <p key={idx} className={paragraph.trim() ? 'mb-3 md:mb-4' : 'mb-0'}>{paragraph}</p>
              ))}
            </div>

            {/* Simulation Components (Result, Allocation, Negotiation, Caili) ... */}
            
            {simResult && !isSummaryPending && <SimulationResultView />}

            {isSimulationNode && !simResult && !isSummaryPending && node.simulation?.type === 'ALLOCATION' && (
              <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 md:p-6 mt-4 md:mt-8">
                {/* Allocation UI code */}
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-cyan-400 flex items-center gap-2"><Clock size={18}/> 假期分配</h3>
                   <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded border border-zinc-700">
                     <span className="text-xs font-mono text-zinc-500">剩余天数</span>
                     <span className={`text-base font-bold font-mono ${(node.simulation.totalPoints! - (Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0)) === 0 ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                       {node.simulation.totalPoints! - (Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0)}
                     </span>
                   </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                   {node.simulation.categories?.map(cat => {
                     const currentVal = allocations[cat.id] || 0;
                     const remaining = node.simulation!.totalPoints! - (Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0);
                     return (
                       <div key={cat.id} className="bg-zinc-950/80 p-3 md:p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-3 md:gap-4 transition-colors duration-300 hover:border-zinc-600">
                          <div className="flex-1">
                             <div className="font-bold text-sm text-zinc-200 mb-0.5">{cat.label}</div>
                             <p className="text-[10px] text-zinc-500 leading-tight">{cat.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-zinc-900 p-1 rounded border border-zinc-800">
                             <button onClick={() => handleAllocationChange(cat.id, -1, node.simulation!.totalPoints!)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors" disabled={currentVal <= 0}><Minus size={16} /></button>
                             <span className="w-6 text-center font-mono font-bold text-lg text-cyan-400">{currentVal}</span>
                             <button onClick={() => handleAllocationChange(cat.id, 1, node.simulation!.totalPoints!)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors" disabled={remaining <= 0}><Plus size={16} /></button>
                          </div>
                       </div>
                     );
                   })}
                </div>
                <button onClick={submitAllocation} disabled={(Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0) !== node.simulation.totalPoints} className="w-full mt-6 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors flex items-center justify-center gap-2">
                  {(Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0) !== node.simulation.totalPoints ? `请再分配 ${(node.simulation.totalPoints! - (Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0))} 天` : '确认时间表'}
                </button>
              </div>
            )}

            {isSimulationNode && !simResult && !isSummaryPending && node.simulation?.type === 'CRISIS_RESOURCE' && (
              <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 md:p-6 mt-4 md:mt-8">
                {/* Crisis UI */}
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-rose-400 flex items-center gap-2"><Flame size={18}/> 危机公关策略</h3>
                   <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded border border-zinc-700">
                     <span className="text-xs font-mono text-zinc-500">剩余配额 %</span>
                     <span className={`text-base font-bold font-mono ${(node.simulation.totalPoints! - (Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0)) === 0 ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                       {node.simulation.totalPoints! - (Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0)}%
                     </span>
                   </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                   {node.simulation.categories?.map(cat => {
                     return (
                       <div key={cat.id} className="bg-zinc-950/50 p-3 rounded border border-zinc-800">
                          <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-sm text-zinc-200">{cat.label}</span>
                             <span className="text-xs font-mono font-bold text-cyan-400">{allocations[cat.id] || 0}%</span>
                          </div>
                          <p className="text-xs text-zinc-500 mb-3">{cat.desc}</p>
                          <input type="range" min="0" max={node.simulation!.totalPoints} step="10" value={allocations[cat.id] || 0} onChange={(e) => { const newVal = parseInt(e.target.value); const oldVal = allocations[cat.id] || 0; handleAllocationChange(cat.id, newVal - oldVal, node.simulation!.totalPoints!); }} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                       </div>
                     );
                   })}
                </div>
                <div className="h-2 w-full flex rounded-full overflow-hidden mt-4 bg-zinc-800">
                    <div className="h-full bg-purple-500 transition-all duration-300" style={{width: `${allocations['blame'] || 0}%`}}></div>
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{width: `${allocations['overtime'] || 0}%`}}></div>
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{width: `${allocations['ignore'] || 0}%`}}></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                    <span className="text-purple-400">● 甩锅</span><span className="text-blue-400">● 加班</span><span className="text-emerald-400">● 躺平</span>
                </div>
                <button onClick={submitAllocation} disabled={(Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0) !== node.simulation.totalPoints} className="w-full mt-6 py-4 bg-rose-700 hover:bg-rose-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors flex items-center justify-center gap-2">
                  {(Object.values(allocations) as number[]).reduce((a: number, b: number)=>a+b, 0) !== node.simulation.totalPoints ? `总比例需等于 100%` : '执行策略'}
                </button>
              </div>
            )}

            {isSimulationNode && !simResult && !isSummaryPending && node.simulation?.type === 'NEGOTIATION' && (
               <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 mt-4 md:mt-8">
                  {/* Negotiation UI */}
                  <div className="flex justify-between mb-4 border-b border-zinc-800 pb-2">
                     <div className="text-xs font-mono text-zinc-400">回合 {negRound + 1}/3</div>
                     <div className="flex gap-4 text-xs font-mono">
                        <span className={negMood > 60 ? 'text-emerald-400' : 'text-rose-400'}>情绪值: {negMood}%</span>
                        <span className={negPressure > 60 ? 'text-orange-400' : 'text-blue-400'}>施压值: {negPressure}%</span>
                     </div>
                  </div>
                  <div className="h-32 overflow-y-auto bg-black/40 p-3 rounded border border-zinc-800 mb-4 text-sm font-mono text-zinc-300 space-y-2">
                     {negLog.length === 0 && <span className="opacity-50">谈判开始... 请选择回应策略。</span>}
                     {negLog.map((l, i) => (<div key={i} className="border-l-2 border-cyan-500 pl-2">{l}</div>))}
                  </div>
                  {negRound < 3 ? (
                    <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => handleNegotiation('HARD')} className="p-2 bg-red-900/30 border border-red-800 hover:bg-red-900/50 text-red-200 text-xs rounded">强硬拒绝<br/><span className="scale-75 opacity-50 block">施压++ 情绪--</span></button>
                       <button onClick={() => handleNegotiation('MEDIATE')} className="p-2 bg-blue-900/30 border border-blue-800 hover:bg-blue-900/50 text-blue-200 text-xs rounded">理性斡旋<br/><span className="scale-75 opacity-50 block">施压+ 情绪-</span></button>
                       <button onClick={() => handleNegotiation('SOFT')} className="p-2 bg-emerald-900/30 border border-emerald-800 hover:bg-emerald-900/50 text-emerald-200 text-xs rounded">温和示弱<br/><span className="scale-75 opacity-50 block">施压-- 情绪++</span></button>
                    </div>
                  ) : (
                    <button onClick={endNegotiation} className="w-full py-3 bg-zinc-100 text-black font-bold rounded hover:bg-white flex items-center justify-center gap-2">
                      <CheckCircle2 size={16}/> 签署协议
                    </button>
                  )}
               </div>
            )}
            
            {isCailiSim && !simResult && !isSummaryPending && (
               <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 md:p-6 mt-4 md:mt-8 animate-fade-in-up">
                  {/* Caili UI */}
                  <div className="flex items-center gap-2 mb-6 text-rose-400">
                      <HeartHandshake size={20} /><h3 className="font-bold text-base">彩礼金额博弈</h3>
                  </div>
                  <div className="mb-8">
                     <div className="flex justify-between items-end mb-4">
                        <span className="text-zinc-400 text-sm">拟定金额</span>
                        <span className="text-3xl font-mono font-bold text-white">{cailiOffer} <span className="text-base text-zinc-500">万</span></span>
                     </div>
                     <input type="range" min="0" max="35" step="5" value={cailiOffer} onChange={(e) => setCailiOffer(Number(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                     <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono"><span>0万</span><span>10万</span><span>20万</span><span>35万</span></div>
                     <div className={`mt-6 p-3 rounded border flex items-start gap-3 transition-colors duration-300 ${getCailiFeedback().color.includes('rose') ? 'bg-rose-950/20 border-rose-900/50' : getCailiFeedback().color.includes('emerald') ? 'bg-emerald-950/20 border-emerald-900/50' : getCailiFeedback().color.includes('orange') ? 'bg-orange-950/20 border-orange-900/50' : 'bg-blue-950/20 border-blue-900/50'}`}>
                        <div className="text-2xl mt-0.5 animate-bounce-short">{getCailiFeedback().icon}</div>
                        <div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">结果预测 (Outcome Prediction)</div>
                            <div className={`text-sm font-bold ${getCailiFeedback().color}`}>{getCailiFeedback().text}</div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-zinc-800/50 mb-6 space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">父母支持 ({isIsolated || isHouseOwner ? '0' : '80'}%)</span>
                          <span className={isIsolated || (isHouseOwner && cailiOffer >= 10 && cailiOffer <= 20) ? 'text-zinc-600 line-through' : 'text-emerald-400'}>{isIsolated || (isHouseOwner && cailiOffer >= 10 && cailiOffer <= 20) ? '0' : (cailiOffer * 0.8).toFixed(1)} 万</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                          <span className="text-zinc-300">你需要支付</span>
                          <span className="text-rose-400">{isIsolated || (isHouseOwner && cailiOffer >= 10 && cailiOffer <= 20) ? cailiOffer : (cailiOffer * 0.2).toFixed(1)} 万</span>
                      </div>
                  </div>
                  <button onClick={submitCaili} className="w-full py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors">确认报价</button>
               </div>
            )}
            <div className="h-4 md:h-12"></div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (FIXED) */}
        { ( (!isSimulationNode && !isCailiSim && !simResult) || isSummaryPending ) && (
           <div className={`shrink-0 z-30 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.7)] backdrop-blur-md transition-colors duration-500 pb-safe ${isRescue ? 'bg-red-950/90 border-red-900/50' : 'bg-zinc-900/80 border-zinc-800'}`}>
              {isSummaryPending ? (
                  <div className="p-4 md:p-8 animate-fade-in-up">
                      <div className="max-w-2xl mx-auto text-center">
                          <p className="text-zinc-400 mb-4 font-mono text-xs md:text-sm">阶段周期完成。正在生成财务报表...</p>
                          <button onClick={onProceedToSummary} className="w-full md:w-auto px-8 py-3 md:py-4 bg-white text-black font-bold text-base md:text-lg rounded-full hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 mx-auto">
                             <FileText size={20} /><span>查看阶段财务报表</span><ArrowRight size={20} />
                          </button>
                      </div>
                  </div>
              ) : (
                 currentChoices.length > 0 && (
                  // FIXED SCROLL CONTAINER with Increased Padding
                  <div className="max-h-[60dvh] overflow-y-auto overscroll-contain p-2 md:p-6 custom-scrollbar pb-32">
                    <div className="max-w-2xl mx-auto flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${isRescue ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{isRescue ? '紧急协议' : '等待指令'}</span>
                      </div>
                      {currentChoices.map((choice) => (
                        <button key={choice.id} onClick={() => !choice.disabled && onChoice(choice)} disabled={choice.disabled} className={`group relative w-full text-left p-3 md:p-4 rounded-lg border transition-all duration-200 ${choice.disabled ? 'bg-zinc-900/50 border-zinc-800/50 opacity-60 cursor-not-allowed grayscale' : isRescue ? 'bg-red-900/20 border-red-800/50 hover:bg-red-900/40 hover:border-red-500 active:bg-red-900/60' : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] active:bg-zinc-700'}`}>
                          <div className="flex justify-between items-start gap-2 md:gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 md:mb-1 flex-wrap">
                                {/* Whitespace-normal and break-words ensure text wraps and doesn't get cut off */}
                                <span className={`font-bold text-sm md:text-base whitespace-normal break-words ${choice.disabled ? 'text-zinc-500' : (isRescue ? 'text-red-100' : 'text-zinc-100 group-hover:text-cyan-400')} transition-colors`}>{choice.text}</span>
                                {choice.riskLabel === 'High Risk' && !choice.disabled && <span className="shrink-0 text-[9px] px-1 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase tracking-wider font-bold">高风险</span>}
                                {choice.riskLabel === 'Rescue' && !choice.disabled && <span className="shrink-0 text-[9px] px-1 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase tracking-wider font-bold animate-pulse">生死攸关</span>}
                                {choice.disabled && <span className="flex items-center gap-1 shrink-0 text-[9px] px-1 py-0.5 bg-zinc-800 text-zinc-500 border border-zinc-600 rounded uppercase tracking-wider font-bold"><Lock size={8} /> {choice.disabledReason || '锁定'}</span>}
                                {choice.nextEventId && !choice.disabled && <span className="shrink-0 text-[9px] px-1 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded uppercase tracking-wider font-bold">&gt;&gt;&gt;</span>}
                              </div>
                              <div className="text-[10px] md:text-xs text-zinc-500 group-hover:text-zinc-400 leading-snug whitespace-normal break-words">{choice.description}</div>
                            </div>
                            {!choice.disabled && <ArrowRight size={16} className={`mt-1 transform transition-transform group-hover:translate-x-1 shrink-0 ${isRescue ? 'text-red-500' : 'text-zinc-600 group-hover:text-cyan-500'}`} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                 )
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;