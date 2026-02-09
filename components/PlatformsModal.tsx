/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { X, ExternalLink, Hash } from 'lucide-react';

interface PlatformsModalProps {
  onClose: () => void;
}

const PlatformsModal: React.FC<PlatformsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-2 text-white font-bold">
            <Hash size={20} className="text-rose-500" />
            <span>关注更多平台</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/30">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Xiaohongshu Card */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-6 flex flex-col items-center text-center hover:border-rose-500/30 transition-colors group">
              <div className="mb-4 relative">
                <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                    {/* Placeholder for QR Code - User needs to replace src */}
                    <img 
                        src="/assets/redbook.png" 
                        alt="小红书二维码" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            // Fallback if image not found
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="text-zinc-900 font-bold text-xs">暂无二维码<br/>(Please add image)</div>';
                        }}
                    />
                </div>
                <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-bounce">
                    推荐
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-rose-400 mb-1 flex items-center gap-2">
                小红书
                <ExternalLink size={14} className="opacity-50" />
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                关注官方账号，获取最新游戏攻略与开发日志
              </p>
              
              <div className="text-xs font-mono bg-zinc-900 px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 select-all">
                搜索 ID: 18680780807
              </div>
            </div>

            {/* Placeholder for future platforms */}
            <div className="border border-dashed border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center text-zinc-600 gap-2 min-h-[100px]">
                <span className="text-xs">更多平台即将上线...</span>
            </div>

          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 text-center">
            <p className="text-[10px] text-zinc-600">截图保存二维码，或在对应APP内扫描</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformsModal;
