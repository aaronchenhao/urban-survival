/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useState, useEffect } from 'react';
import { ChoiceEffect } from '../types';
import { Shield, TrendingUp, Home, Calculator, ChevronRight, Play, Terminal, Crown, AlertCircle, Trophy, BookOpen } from 'lucide-react';
import AchievementList from './AchievementList';
import RulesModal from './RulesModal';

interface StartScreenProps {
  onStart: (effects: ChoiceEffect[], flags: string[]) => void;
  unlockedAchievements?: string[]; // New Prop
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, unlockedAchievements = [] }) => {
  const [view, setView] = useState<'LANDING' | 'CONFIG' | 'TROPHY'>('LANDING');
  const [housing, setHousing] = useState<number | null>(null);
  const [insurance, setInsurance] = useState<number | null>(null);
  const [hasLegacy, setHasLegacy] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  // New Investment State
  const [safeInvest, setSafeInvest] = useState<number>(0);
  const [riskyInvest, setRiskyInvest] = useState<number>(0);

  useEffect(() => {
      const prevTier = localStorage.getItem('csl_prev_tier');
      if (prevTier === 'ASCEND') {
          setHasLegacy(true);
      }
  }, []);

  // Calculation helpers
  const getFixedCosts = () => {
    let cost = 0;
    if (housing === 0) cost += 6000; // Deposit + First Month (Simplified)
    if (housing === 1) cost += 3500; // Deposit + First Month (Simplified)
    if (insurance === 0) cost += 4000;
    return cost;
  };

  const initialTotalCash = hasLegacy ? 55000 : 50000; // Bonus Cash for Legacy
  const fixedCosts = getFixedCosts();
  const totalAllocatable = initialTotalCash - fixedCosts; // The fixed pool for investments

  const currentRemaining = totalAllocatable - safeInvest - riskyInvest;
  const initialCash = initialTotalCash - fixedCosts - safeInvest - riskyInvest;
  const isOverBudget = currentRemaining < 0;

  const canStart = housing !== null && insurance !== null && !isOverBudget;

  // Optimized Slider Logic:
  // Sliders are perfectly independent. Both max out at totalAllocatable.
  // We strictly rely on the 'isOverBudget' check to prevent invalid starts.
  // This prevents the "jumping" sensation when sliding one affects the max of the other.
  const maxSliderValue = Math.max(0, totalAllocatable);

  const handleSafeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSafeInvest(val);
  };

  const handleRiskyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setRiskyInvest(val);
  };

  const handleStart = () => {
    if (!canStart) return;

    const effects: ChoiceEffect[] = [];
    const flags: string[] = [];

    // Housing
    if (housing === 0) {
      flags.push('RENT_CITY');
    } else {
      flags.push('RENT_SUBURB');
    }

    // Set Initial Investment
    effects.push({ stat: 'safeInvest', value: safeInvest });
    effects.push({ stat: 'riskyInvest', value: riskyInvest });
    
    // Calculate total cash change: -(FixedCosts) - (Investments)
    let cashChange = -fixedCosts - safeInvest - riskyInvest;
    
    if (hasLegacy) {
        cashChange += 5000;
        flags.push('LEGACY_CONNECTION'); 
    }
    
    effects.push({ stat: 'cash', value: cashChange });

    // Insurance
    if (insurance === 0) {
      flags.push('INS_YES');
    } else {
      flags.push('INS_NO');
    }

    onStart(effects, flags);
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="mb-6 border border-zinc-800 p-4 rounded-lg bg-zinc-900/50">
      <div className="flex items-center gap-2 mb-3 text-cyan-400">
        <Icon size={18} />
        <h3 className="font-bold text-base">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const RadioOption = ({ selected, onClick, label, diff }: any) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded border transition-all text-sm ${
        selected
          ? 'bg-cyan-900/30 border-cyan-500 text-cyan-100'
          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
      }`}
    >
      <div className="flex justify-between items-center">
        <span>{label}</span>
        <span className="text-xs font-mono opacity-70">{diff}</span>
      </div>
    </button>
  );

  // --- LANDING VIEW ---
  if (view === 'LANDING') {
    return (
      <div className="max-w-xl mx-auto p-6 md:p-12 h-full flex flex-col justify-center animate-fade-in relative overflow-hidden">
        {/* Render Rules Modal */}
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        
        {/* Main Content Container */}
        <div className="relative z-10 text-center flex flex-col items-center flex-1 justify-center pb-12">
          
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-zinc-800/50 border border-zinc-700 rounded text-[10px] font-mono text-zinc-400 mb-6 tracking-widest">
            <Terminal size={12} />
            系统版本 V3.1
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-2 text-white tracking-tighter whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            赛博斩杀线
          </h1>
          <h2 className="text-xl md:text-2xl font-mono text-cyan-500 mb-10 tracking-wide uppercase opacity-90 drop-shadow-md">
            Cyber Execution Line
          </h2>
          
          <div className="space-y-4 text-zinc-300 text-base md:text-lg leading-relaxed max-w-md mx-auto mb-10 font-medium">
            <p className="text-white font-bold">北漂青年，存款5万，期限24个月。</p>
            <p className="text-sm md:text-base text-zinc-400">在这个被黑暗丛林法则统治的城市里，<br/>你是数据，是耗材，还是幸存者？</p>
          </div>

          {/* Centered Button Container - Clean Layout */}
          <div className="flex flex-col items-center gap-6 w-full max-w-xs mx-auto">
             
             {/* Start Button */}
             <button
               onClick={() => setView('CONFIG')}
               className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black text-lg hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] rounded-full hover:scale-105 active:scale-95"
             >
               <span>开始人生模拟</span>
               <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>

             {/* Secondary Actions Row */}
             <div className="flex items-center gap-6">
                <button 
                    onClick={() => setShowRules(true)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors text-xs font-bold uppercase tracking-wider group"
                >
                    <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-full group-hover:border-cyan-500/50 group-hover:bg-cyan-950/30 transition-all">
                        <BookOpen size={16} />
                    </div>
                    <span className="border-b border-transparent group-hover:border-cyan-500/50 pb-0.5">城市生存手册</span>
                </button>

                <div className="w-px h-8 bg-zinc-800"></div>

                <button 
                    onClick={() => setView('TROPHY')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors text-xs font-bold uppercase tracking-wider group"
                >
                    <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-full group-hover:border-yellow-500/50 group-hover:bg-yellow-950/30 transition-all relative">
                        <Trophy size={16} />
                        {unlockedAchievements.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full border border-black"></div>}
                    </div>
                    <span className="border-b border-transparent group-hover:border-yellow-500/50 pb-0.5">成就图鉴</span>
                </button>
             </div>

          </div>
          
          {hasLegacy && (
             <div className="mt-8 flex items-center gap-2 text-yellow-500 font-mono text-xs animate-pulse bg-yellow-950/30 px-3 py-1 rounded-full border border-yellow-900/50">
                 <Crown size={12} />
                 <span>检测到二周目继承 (NEW GAME+)</span>
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-6 left-0 w-full text-center space-y-3 z-20 px-4 pb-safe pointer-events-none">
             <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 font-medium tracking-wide">
                <AlertCircle size={10} />
                <span>免责声明：本游戏剧情纯属虚构，无任何现实关联。</span>
             </div>
        </div>
      </div>
    );
  }

  // --- TROPHY VIEW ---
  if (view === 'TROPHY') {
      return (
          <AchievementList unlockedIds={unlockedAchievements} onClose={() => setView('LANDING')} />
      );
  }

  // --- CONFIG VIEW ---
  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 animate-fade-in h-full overflow-y-auto pb-safe">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="text-cyan-500">&gt;&gt;</span> 开局配置
        </h2>
        {hasLegacy && (
            <div className="mt-4 flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/50 p-3 rounded text-yellow-200 text-sm shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <Crown size={16} className="text-yellow-400 shrink-0" />
                <div>
                    <div className="font-bold">二周目继承已激活</div>
                    <div className="text-xs opacity-80 mt-0.5">商界人脉生效：初始资金 +5000 | 激进投资收益率 +10%</div>
                </div>
            </div>
        )}
      </div>

      <Section title="1. 住房选择" icon={Home}>
        <RadioOption label="A. 市区老破小 (4000/月)" diff="起步费 -¥6000 | 通勤效率+10" selected={housing === 0} onClick={() => setHousing(0)} />
        <RadioOption label="B. 远郊新房 (2500/月)" diff="起步费 -¥3500 | 通勤效率-8" selected={housing === 1} onClick={() => setHousing(1)} />
      </Section>

      <Section title="2. 资金分配" icon={TrendingUp}>
        <div className="space-y-6 pt-2">
            <div>
                <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-blue-300">稳健理财 (定期/债券)</span>
                    <span className="font-mono text-blue-400">¥ {safeInvest.toLocaleString()}</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max={maxSliderValue} 
                    step="1000" 
                    value={safeInvest}
                    onChange={handleSafeChange}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 touch-pan-x"
                />
                <p className="text-[10px] text-zinc-500 mt-1">低风险，收益稳定。抗通胀基石。</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2 text-sm">
                    <div className="flex items-center gap-2">
                         <span className="text-rose-300">激进投资 (股票/基金)</span>
                         {hasLegacy && <span className="text-[9px] bg-yellow-900/50 text-yellow-400 px-1 rounded border border-yellow-700/50">收益率 +10%</span>}
                    </div>
                    <span className="font-mono text-rose-400">¥ {riskyInvest.toLocaleString()}</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max={maxSliderValue} 
                    step="1000" 
                    value={riskyInvest}
                    onChange={handleRiskyChange}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500 touch-pan-x"
                />
                <p className="text-[10px] text-zinc-500 mt-1">高风险，高收益。资产增值引擎。</p>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
               <span className="text-xs text-zinc-400">剩余可分配资金</span>
               <span className={`text-sm font-mono font-bold ${currentRemaining < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                 ¥ {currentRemaining.toLocaleString()}
               </span>
            </div>
            {isOverBudget && (
                <div className="text-[10px] text-red-500 font-bold text-center animate-pulse bg-red-950/30 py-1 rounded border border-red-900/50">
                    资金分配超出上限！请减少投资额。
                </div>
            )}
        </div>
      </Section>

      <Section title="3. 保障选择" icon={Shield}>
        <RadioOption label="A. 商业补充险 (4000/年)" diff="现金-¥4000 | 身体保障+15" selected={insurance === 0} onClick={() => setInsurance(0)} />
        <RadioOption label="B. 仅基础社保" diff="现金+0 | 身体保障-15" selected={insurance === 1} onClick={() => setInsurance(1)} />
      </Section>

      {/* Preview Section */}
      <div className="mb-6 bg-zinc-900 p-4 rounded border border-zinc-700">
        <div className="flex items-center gap-2 mb-3 text-zinc-300 border-b border-zinc-700 pb-2">
          <Calculator size={16} />
          <span className="font-bold text-sm">资产预览</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
          <div>
            <span className="text-zinc-500 block text-xs">流动现金</span>
            <span className={initialCash < 0 ? 'text-red-500' : (initialCash < 5000 ? 'text-rose-400' : 'text-emerald-400')}>
              ¥ {initialCash.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-xs">总投资额</span>
            <span className="text-purple-400">
              ¥ {(safeInvest + riskyInvest).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setView('LANDING')} className="px-6 py-4 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700">返回</button>
        <button
          disabled={!canStart}
          onClick={handleStart}
          className={`flex-1 py-4 text-lg font-bold tracking-widest uppercase rounded flex items-center justify-center gap-2 transition-all
            ${canStart ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:bg-cyan-500' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
          `}
        >
          <Play size={20} fill="currentColor" />
          {isOverBudget ? '预算超支' : '开始模拟'}
        </button>
      </div>
    </div>
  );
};

export default StartScreen;