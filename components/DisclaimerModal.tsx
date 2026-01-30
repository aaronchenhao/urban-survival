/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { X, ShieldAlert, AlertTriangle, FileText, Scale } from 'lucide-react';

interface DisclaimerModalProps {
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldAlert size={20} className="text-rose-500" />
            <span>免责声明与用户协议</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-zinc-300 text-sm leading-relaxed space-y-6 custom-scrollbar bg-zinc-950/30">
          
          <div className="bg-rose-950/10 p-4 rounded border border-rose-900/30">
             <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div>
                    <h3 className="text-rose-400 font-bold mb-1">特别提醒</h3>
                    <p className="text-xs text-rose-200/70">
                        在开始体验《赛博斩杀线》之前，请务必仔细阅读以下条款。继续游戏即代表您已阅读并同意本声明内容。
                    </p>
                </div>
             </div>
          </div>

          <section>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-cyan-500"/> 1. 虚构叙事声明
              </h3>
              <p className="text-zinc-400 text-xs leading-5">
                  本软件《赛博斩杀线》（Cyber Execution Line）是一款以都市生存为主题的文字模拟游戏。游戏中出现的所有人物、企业名称、地名、事件、新闻报道及社会背景设定均为虚构，或为了艺术加工而进行的夸张处理。
              </p>
              <p className="text-zinc-400 text-xs leading-5 mt-2">
                  任何与现实世界中的个人、团体、商业机构或实际事件的相似之处，纯属巧合，不代表开发者的现实立场或影射。
              </p>
          </section>

          <section>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Scale size={16} className="text-cyan-500"/> 2. 非专业建议声明
              </h3>
              <p className="text-zinc-400 text-xs leading-5">
                  游戏核心机制涉及模拟理财、职场决策、房地产选择及保险购买等内容。请注意，所有数值模型、涨跌逻辑及后果判定均为服务于游戏性而设计的<span className="text-white font-bold">简化算法</span>。
              </p>
              <p className="text-rose-400 text-xs leading-5 mt-2 font-bold bg-rose-950/20 p-2 rounded">
                  本游戏内容决不构成任何现实生活中的投资建议、法律建议或职业规划指导。请勿将游戏中的策略应用于现实金融活动。市场有风险，投资需谨慎。
              </p>
          </section>

          <section>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-cyan-500"/> 3. 心理健康提醒
              </h3>
              <p className="text-zinc-400 text-xs leading-5">
                  为了营造“高压生存”的叙事体验，游戏中包含对焦虑、失业、财务危机及社会阴暗面的文字描写。如果您处于情绪敏感期，或正在经历类似的现实困境，建议酌情体验或暂停游戏。您的身心健康永远比游戏成就更重要。
              </p>
          </section>

          <section>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-cyan-500"/> 4. 知识产权声明
              </h3>
              <p className="text-zinc-400 text-xs leading-5">
                  本游戏的美术风格、文本剧情、代码逻辑及音频素材（如有）归开发者及版权方所有。未经书面授权，严禁以任何形式（包括但不限于复制、镜像、修改）进行分发或用于商业用途。
              </p>
          </section>

        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase rounded border border-zinc-600 transition-colors"
            >
                我已了解
            </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;