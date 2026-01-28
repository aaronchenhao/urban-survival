/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useState } from 'react';
import { MonthlySummary, Stats } from '../types';
import { ArrowRight, TrendingUp, AlertTriangle, ArrowLeftRight, Wallet, Shield, PieChart, Home, Droplets, ChevronDown, Zap } from 'lucide-react';
import StatBar from './StatBar';

interface SummaryScreenProps {
  summary: MonthlySummary;
  stats: Stats;
  onContinue: (newSafeInvest: number, newRiskyInvest: number, newCash: number) => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ summary, stats, onContinue }) => {
  const [safeAdj, setSafeAdj] = useState(0);
  const [riskyAdj, setRiskyAdj] = useState(0);

  // Proposed totals
  const proposedSafe = stats.safeInvest + safeAdj;
  const proposedRisky = stats.riskyInvest + riskyAdj;
  const proposedCash = stats.cash - safeAdj - riskyAdj;

  const handleContinue = () => {
    onContinue(proposedSafe, proposedRisky, proposedCash);
  };

  const formatMoney = (val: number) => `¥ ${val.toLocaleString()}`;

  const hasLoss = summary.riskyProfit < -500;
  const hasHighDebt = summary.debtInterest > 2000;

  // Calculate Previous Balance for Visualization
  // Current stats.cash has ALREADY been updated with totalChange.
  // So Previous = Current - Change
  const previousCash = stats.cash - summary.totalChange;

  // Handler to ensure independent slider movement while respecting total cash constraint
  const handleSafeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    // Logic: Always allow selling (val <= 0). Only check cash if buying (val > 0).
    if (val <= 0 || stats.cash - val - riskyAdj >= 0) {
      setSafeAdj(val);
    }
  };

  const handleRiskyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    // Logic: Always allow selling (val <= 0). Only check cash if buying (val > 0).
    if (val <= 0 || stats.cash - safeAdj - val >= 0) {
      setRiskyAdj(val);
    }
  };

  // Pie Chart Calculation (Optimized for Debt)
  // If cash is negative, we treat it as 0 for the PIE CHART visualization (Asset Allocation),
  // because you cannot have a "negative slice" of a pie.
  const chartCash = Math.max(0, proposedCash);
  const chartSafe = Math.max(0, proposedSafe);
  const chartRisky = Math.max(0, proposedRisky);
  
  const chartTotal = chartCash + chartSafe + chartRisky;
  
  const safeDeg = chartTotal > 0 ? (chartSafe / chartTotal) * 360 : 0;
  const riskyDeg = chartTotal > 0 ? (chartRisky / chartTotal) * 360 : 0;
  // Cash fills the rest automatically in conic gradient

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-zinc-950 p-5 border-b border-zinc-800 shrink-0">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-cyan-400" size={20} />
              阶段性财务结算
            </h2>
            <span className="text-[10px] font-mono px-2 py-1 bg-zinc-800 rounded text-zinc-400">
              阶段报告 (6个月)
            </span>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* SPECIAL EVENT NOTIFICATION (NEW) */}
          {summary.specialEvent && (
              <div className="p-3 rounded-lg border bg-yellow-950/30 border-yellow-700/50 flex gap-3 items-start animate-pulse">
                  <Zap size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-100 font-bold">{summary.specialEvent}</div>
              </div>
          )}

          {/* 1. VISUAL EQUATION (New Feature) */}
          <div className="flex flex-col items-center bg-black/40 p-3 rounded-lg border border-zinc-800/50">
              <div className="flex w-full justify-between items-center px-2 mb-2">
                  <div className="text-center">
                      <div className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wide">上期余额</div>
                      <div className="text-sm font-mono text-zinc-400">{formatMoney(previousCash)}</div>
                  </div>
                  <div className={`font-mono font-bold ${summary.totalChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {summary.totalChange >= 0 ? '+' : ''}{formatMoney(summary.totalChange)}
                  </div>
                  <div className="text-center">
                      <div className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wide">当前余额</div>
                      <div className="text-lg font-mono font-bold text-white">{formatMoney(stats.cash)}</div>
                  </div>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded flex overflow-hidden">
                  <div className={`h-full ${summary.totalChange >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: '100%'}}></div>
              </div>
          </div>

          {/* 2. Income/Expense Summary */}
          <div className="space-y-2 text-sm bg-zinc-900/50 rounded-lg">
            <div className="flex justify-between text-zinc-400">
              <span>基础薪资 (半年)</span>
              <span className="text-emerald-400">+{formatMoney(summary.salary)}</span>
            </div>
            
            <div className="flex justify-between text-zinc-400">
              <span>房租与生活成本</span>
              <span className="text-rose-400">-{formatMoney(summary.rent + summary.livingCost)}</span>
            </div>

            {/* Dual Investment Returns */}
            <div className="border-t border-zinc-800/50 pt-2 mt-2">
                <div className="flex justify-between text-zinc-400 text-xs mb-1">
                    <span>稳健收益 ({summary.safeYield.toFixed(1)}%)</span>
                    <span className="text-emerald-400">+{formatMoney(summary.safeProfit)}</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-xs">
                    <span>激进损益 ({summary.riskyYield > 0 ? '+' : ''}{summary.riskyYield.toFixed(1)}%)</span>
                    <span className={summary.riskyProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {summary.riskyProfit >= 0 ? '+' : ''}{formatMoney(summary.riskyProfit)}
                    </span>
                </div>
            </div>

            {summary.debtInterest > 0 && (
              <div className={`flex justify-between font-bold px-2 py-1.5 rounded mt-2 border ${hasHighDebt ? 'bg-red-950/40 border-red-900 text-red-500 animate-pulse' : 'bg-red-950/20 border-red-900/50 text-red-400'}`}>
                <span className="flex items-center gap-1">
                    {hasHighDebt ? <Droplets size={14} className="fill-current" /> : <AlertTriangle size={12}/>} 
                    {hasHighDebt ? '高利贷利息吞噬' : '债务利息'}
                </span>
                <span className="font-mono">-{formatMoney(summary.debtInterest)}</span>
              </div>
            )}
            
            {/* Housing Appreciation (Visual Only) */}
            {summary.housingValuation !== undefined && (
                <div className="flex justify-between items-center text-xs bg-cyan-950/20 px-2 py-1.5 rounded mt-2 border border-cyan-900/30">
                    <div className="flex items-center gap-1 text-cyan-300">
                        <Home size={12} />
                        <span>房产估值浮动</span>
                    </div>
                    <div className="text-right">
                        <div className="text-cyan-400 font-bold">+{formatMoney(summary.housingAppreciation || 0)}</div>
                        <div className="text-[10px] text-zinc-500">当前估值: {formatMoney(summary.housingValuation)}</div>
                    </div>
                </div>
            )}
          </div>

          {/* 3. Reconfiguration (The Core Interaction) */}
          <div className="pt-2">
             <div className="flex items-center gap-2 mb-4 text-cyan-400 text-sm font-bold uppercase tracking-wider">
                <ArrowLeftRight size={16} />
                <span>下阶段资产配置</span>
             </div>

             {/* DYNAMIC PIE CHART VISUALIZATION */}
             <div className="flex items-center gap-6 mb-6 bg-black/20 p-4 rounded-xl border border-zinc-800/50">
                <div 
                  className="w-24 h-24 rounded-full shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-4 border-zinc-900/50 relative"
                  style={{
                    background: `conic-gradient(
                      #3b82f6 0deg ${safeDeg}deg, 
                      #f43f5e ${safeDeg}deg ${safeDeg + riskyDeg}deg, 
                      #10b981 ${safeDeg + riskyDeg}deg 360deg
                    )`
                  }}
                >
                   {/* Center Hole for Donut Effect */}
                   <div className="absolute inset-0 m-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
                      <PieChart size={20} className="text-zinc-600" />
                   </div>
                </div>

                <div className="flex flex-col gap-2 text-xs font-mono w-full">
                    <div className="flex justify-between items-center">
                       <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 现金 (Cash)</span>
                       <span className="text-emerald-400 font-bold">{chartTotal > 0 ? ((chartCash/chartTotal)*100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 稳健 (Safe)</span>
                       <span className="text-blue-400 font-bold">{chartTotal > 0 ? ((chartSafe/chartTotal)*100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 激进 (Risk)</span>
                       <span className="text-rose-400 font-bold">{chartTotal > 0 ? ((chartRisky/chartTotal)*100).toFixed(0) : 0}%</span>
                    </div>
                </div>
             </div>

             {hasLoss && (
               <div className="mb-4 text-[11px] leading-tight text-orange-300 bg-orange-950/30 border border-orange-900/50 p-3 rounded flex gap-2">
                 <AlertTriangle size={16} className="shrink-0" />
                 本期激进投资出现亏损。您可以选择追加投资以平摊成本，或赎回资金止损。
               </div>
             )}
             
             <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800 space-y-6">
                {/* Safe Adjustment */}
                <div>
                    <div className="flex justify-between mb-2 text-xs font-mono">
                        <span className="text-zinc-500">赎回 (变现)</span>
                        <span className="text-blue-400 font-bold">稳健池调整</span>
                        <span className="text-zinc-300">追加 (存入)</span>
                    </div>
                    <input 
                      type="range" 
                      min={-stats.safeInvest} 
                      max={Math.max(0, stats.cash)} 
                      step="1000"
                      value={safeAdj}
                      onChange={handleSafeChange}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
                    />
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded text-xs font-mono">
                        <span className="text-zinc-500">当前: {formatMoney(stats.safeInvest)}</span>
                        <div className="flex items-center gap-1">
                           <span className="text-zinc-400">调整后:</span>
                           <span className="text-blue-400 font-bold text-sm">{formatMoney(proposedSafe)}</span>
                        </div>
                    </div>
                </div>

                {/* Risky Adjustment */}
                <div>
                    <div className="flex justify-between mb-2 text-xs font-mono">
                        <span className="text-zinc-500">赎回 (变现)</span>
                        <span className="text-rose-400 font-bold">激进池调整</span>
                        <span className="text-zinc-300">追加 (存入)</span>
                    </div>
                    <input 
                      type="range" 
                      min={-stats.riskyInvest} 
                      max={Math.max(0, stats.cash)} 
                      step="1000"
                      value={riskyAdj}
                      onChange={handleRiskyChange}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500 mb-2"
                    />
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded text-xs font-mono">
                        <span className="text-zinc-500">当前: {formatMoney(stats.riskyInvest)}</span>
                        <div className="flex items-center gap-1">
                           <span className="text-zinc-400">调整后:</span>
                           <span className="text-rose-400 font-bold text-sm">{formatMoney(proposedRisky)}</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-0 shrink-0 bg-zinc-900 border-t border-zinc-800 mt-auto">
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-bold text-lg hover:bg-cyan-400 transition-colors rounded shadow-lg"
          >
            <span>进入下个周期</span>
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SummaryScreen;