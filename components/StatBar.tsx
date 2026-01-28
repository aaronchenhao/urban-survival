/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { StatKey } from '../types';
import { Coins, Heart, Brain, Scale, TrendingUp, Shield, Zap } from 'lucide-react';

interface StatBarProps {
  label: string;
  value: number;
  statKey: StatKey;
  compact?: boolean;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, statKey, compact = false }) => {
  const getIcon = () => {
    switch (statKey) {
      case 'cash': return <Coins size={16} />;
      case 'safeInvest': return <Shield size={16} />;
      case 'riskyInvest': return <TrendingUp size={16} />;
      case 'body': return <Heart size={16} />;
      case 'mind': return <Brain size={16} />;
      case 'moral': return <Scale size={16} />;
      case 'performance': return <Zap size={16} />;
      default: return <Coins size={16} />;
    }
  };

  const isFinancial = statKey === 'cash' || statKey === 'safeInvest' || statKey === 'riskyInvest';

  const formatCash = (val: number) => {
    return `¥ ${val.toLocaleString()}`;
  };

  const getColor = (val: number) => {
    if (statKey === 'cash') {
       if (val < 0) return 'text-red-600 font-black animate-pulse'; // Debt
       if (val >= 50000) return 'text-emerald-400';
       if (val >= 20000) return 'text-cyan-400';
       if (val >= 5000) return 'text-yellow-400';
       return 'text-rose-500 font-bold';
    }
    if (statKey === 'safeInvest') return 'text-blue-400';
    if (statKey === 'riskyInvest') return 'text-purple-400';

    if (val >= 80) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (val >= 60) return 'bg-cyan-500';
    if (val < 40 && statKey === 'performance') return 'bg-red-500 animate-pulse';
    return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
  };

  // Clamp value between 0 and 100 for display width (only for non-cash stats)
  const width = Math.min(100, Math.max(0, value));

  if (isFinancial) {
    return (
      <div className={`flex flex-col gap-1 ${compact ? 'text-xs' : 'text-sm'} w-full`}>
        <div className="flex justify-between items-center text-zinc-300">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-mono tracking-wider">{label}</span>
          </div>
          <span className={`font-mono font-bold text-lg tracking-tight ${getColor(value)}`}>
            {formatCash(value)}
          </span>
        </div>
        {/* Visual indicator for Cash */}
        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
           <div 
             className={`h-full transition-all duration-500 ${value < 0 ? 'bg-red-600' : (value < 5000 && statKey === 'cash' ? 'bg-rose-500' : (statKey==='safeInvest'?'bg-blue-500':(statKey==='riskyInvest'?'bg-purple-500':'bg-zinc-600')))}`} 
             style={{ width: '100%' }} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${compact ? 'text-xs' : 'text-sm'} w-full`}>
      <div className="flex justify-between items-center text-zinc-300">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-mono tracking-wider">{label}</span>
        </div>
        <span className={`font-mono font-bold ${value < 60 ? 'text-rose-400' : 'text-cyan-400'}`}>
          {value}/100
        </span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
        <div
          className={`h-full transition-all duration-500 ease-out ${getColor(value)}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default StatBar;