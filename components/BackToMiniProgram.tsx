/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * 返回小程序按钮组件 - 仅在小程序 WebView 环境中显示
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { isMiniProgram, navigateBack } from '../platform';

/**
 * BackToMiniProgram Component
 * 
 * 在小程序 WebView 中显示一个返回按钮，点击后返回小程序上一页。
 * 在浏览器环境中不显示。
 */
const BackToMiniProgram: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [isInMiniProgram, setIsInMiniProgram] = useState(false);

  useEffect(() => {
    // 检测是否在小程序环境中
    const checkEnv = () => {
      const inMiniProgram = isMiniProgram();
      setIsInMiniProgram(inMiniProgram);
      setVisible(inMiniProgram);
    };

    // 立即检测
    checkEnv();

    // 延迟再次检测（等待微信 JSBridge 就绪）
    const timer = setTimeout(checkEnv, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    navigateBack();
  };

  // 不在小程序环境时不渲染
  if (!visible) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-3 left-3 z-[9999] flex items-center gap-1 px-3 py-2 
                 bg-zinc-900/90 backdrop-blur-sm border border-cyan-500/30 
                 rounded-full text-cyan-400 text-sm font-bold
                 shadow-lg shadow-cyan-500/10
                 hover:bg-cyan-950/50 hover:border-cyan-500/50
                 active:scale-95 transition-all duration-200"
      style={{ 
        top: 'max(12px, env(safe-area-inset-top))',
      }}
      aria-label="返回"
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
      <span>返回</span>
    </button>
  );
};

export default BackToMiniProgram;
