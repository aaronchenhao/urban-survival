/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useState } from 'react';
import { X, TrendingUp, Skull, Activity, Scale, HelpCircle, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'CORE' | 'FINANCE' | 'CRISIS'>('CORE');

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
        tab === id 
          ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10' 
          : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-2 text-white font-bold">
            <HelpCircle size={20} className="text-cyan-500" />
            <span>关于游戏 (V3.1)</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900">
          <TabButton id="CORE" label="生存目标" icon={Activity} />
          <TabButton id="FINANCE" label="财富密码" icon={TrendingUp} />
          <TabButton id="CRISIS" label="死亡红线" icon={Skull} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-zinc-300 text-sm leading-relaxed space-y-6 custom-scrollbar bg-zinc-950/30">
          
          {tab === 'CORE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-800/30 p-4 rounded border border-zinc-700/50">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">🎯 核心目标</h3>
                <p>存活 <span className="text-cyan-400 font-mono">24</span> 个月。</p>
                <p className="mt-2 text-zinc-400 text-xs">这不是童话故事，没有必然的“胜利”。即使活下来，你也可能面临阶层跌落或精神崩溃。结局取决于你的资产、身心状态以及你在这个城市留下的痕迹（标签）。</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2">⚖️ 属性说明</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded bg-red-900/30 flex items-center justify-center text-red-400"><Activity size={16}/></div>
                    <div>
                      <div className="font-bold text-zinc-200">身体 (Body)</div>
                      <div className="text-xs text-zinc-500">归零即死亡。低值触发高额医疗账单。</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded bg-purple-900/30 flex items-center justify-center text-purple-400"><Activity size={16}/></div>
                    <div>
                      <div className="font-bold text-zinc-200">心理 (Mind)</div>
                      <div className="text-xs text-zinc-500">过低会导致抑郁、无法工作或做出极端选择。</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded bg-yellow-900/30 flex items-center justify-center text-yellow-400"><Scale size={16}/></div>
                    <div>
                      <div className="font-bold text-zinc-200">道德 (Moral)</div>
                      <div className="text-xs text-zinc-500">这是一个隐形参数。<span className="text-rose-400">恶有恶报</span>，低道德虽然短期搞钱快，但在关键时刻会导致众叛亲离（无法获得救助）。</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'FINANCE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded">
                <h3 className="text-emerald-400 font-bold mb-2">💰 结算周期</h3>
                <p>游戏每推进 <span className="font-mono text-white">3</span> 个节点（约半年），会进行一次财务结算，可重新进行配置。</p>
                <ul className="list-disc list-inside mt-2 text-xs text-emerald-200/70 space-y-1">
                  <li>收入：发放6个月薪资（受绩效影响）</li>
                  <li>支出：扣除6个月房租与生活费（随通胀增加）</li>
                  <li>投资：结算半年内的理财损益</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">📈 投资指南</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-blue-900/10 p-3 rounded border border-blue-900/30">
                    <div className="font-bold text-blue-400 text-xs uppercase mb-1">稳健理财 (Safe)</div>
                    <p className="text-xs text-zinc-400">定期存款或国债。收益极低（1.5%左右），但绝对安全，且随时可取用以应急。</p>
                  </div>
                  <div className="bg-rose-900/10 p-3 rounded border border-rose-900/30">
                    <div className="font-bold text-rose-400 text-xs uppercase mb-1">激进投资 (Risky)</div>
                    <p className="text-xs text-zinc-400">股票或基金。<span className="text-white">受市场行情影响极大</span>。牛市可能翻倍，熊市可能腰斩。关注顶部的【新闻跑马灯】来判断入场时机。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'CRISIS' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3 bg-red-950/30 p-4 rounded border border-red-900/50">
                <AlertTriangle size={24} className="text-red-500 shrink-0" />
                <div>
                  <h3 className="text-red-400 font-bold mb-1">强制干预机制 (Rescue)</h3>
                  <p className="text-xs text-red-200/70 leading-relaxed">
                    当你的身体、心理或道德低于 <span className="font-mono font-bold text-white">10</span> 点时，或者现金陷入巨额负债时，系统会强制触发“救援事件”。
                  </p>
                  <p className="text-xs text-red-200/70 mt-2">
                    这通常伴随着高昂的代价（如强制住院消耗存款、高利贷暴力催收等）。<br/>
                    <span className="font-bold text-red-400">请极力避免这种情况发生。</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-bold">☠️ 常见死因</h3>
                <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                  <li><span className="text-white">高利贷崩盘</span>：一旦染上高利贷（DEBT_TRAP），利息会呈指数级增长，最终导致人间蒸发。</li>
                  <li><span className="text-white">过劳死</span>：为了搞钱过度透支身体，导致无法支付ICU费用。</li>
                  <li><span className="text-white">社会性死亡</span>：道德败坏导致所有社会关系断裂，在危机时刻无人伸出援手。</li>
                </ul>
              </div>
            </div>
          )}

        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 text-center">
            <p className="text-[10px] text-zinc-600">祝你好运，幸存者。</p>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;