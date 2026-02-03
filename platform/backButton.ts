/**
 * 返回小程序功能模块
 * 在小程序 WebView 中提供返回上一页的按钮
 */

import { isMiniProgram } from './env';

/** 返回按钮配置 */
export interface BackButtonConfig {
  /** 按钮文字 */
  text: string;
  /** 按钮样式 */
  style?: Partial<CSSStyleDeclaration>;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否显示 */
  visible: boolean;
}

/** 默认配置 */
const defaultConfig: BackButtonConfig = {
  text: '‹ 返回',
  visible: true,
  style: {
    position: 'fixed',
    top: '44px',
    left: '10px',
    zIndex: '9999',
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
    color: '#06b6d4',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};

let backButton: HTMLElement | null = null;
let currentConfig: BackButtonConfig = { ...defaultConfig };

/** 创建返回按钮 */
function createBackButton(): HTMLElement {
  const btn = document.createElement('button');
  btn.id = 'miniprogram-back-btn';
  btn.textContent = currentConfig.text;
  
  // 应用样式
  Object.assign(btn.style, currentConfig.style);
  
  // 点击事件
  btn.addEventListener('click', handleBackClick);
  
  // 触摸反馈
  btn.addEventListener('touchstart', () => {
    btn.style.opacity = '0.7';
  });
  btn.addEventListener('touchend', () => {
    btn.style.opacity = '1';
  });
  
  return btn;
}

/** 处理返回点击 */
function handleBackClick(): void {
  if (currentConfig.onClick) {
    currentConfig.onClick();
    return;
  }
  
  navigateBack();
}

/** 返回小程序上一页 */
export function navigateBack(): void {
  const wx = (window as any).wx;
  
  if (isMiniProgram() && wx && wx.miniProgram) {
    // 发送消息通知小程序返回
    wx.miniProgram.postMessage({
      data: {
        type: 'navigateBack'
      }
    });
    
    // 延迟后调用小程序的返回接口
    setTimeout(() => {
      wx.miniProgram.navigateBack({
        fail: (err: any) => {
          console.error('[BackButton] 返回失败:', err);
          // 如果返回失败，可能是已经在最顶层，关闭小程序
          wx.miniProgram.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    }, 100);
  } else {
    // 非小程序环境，使用浏览器返回
    window.history.back();
  }
}

/** 显示返回按钮 */
export function showBackButton(config?: Partial<BackButtonConfig>): void {
  if (!isMiniProgram()) {
    console.log('[BackButton] 非小程序环境，不显示返回按钮');
    return;
  }
  
  // 合并配置
  currentConfig = { ...defaultConfig, ...config, visible: true };
  
  // 如果已存在，先移除
  if (backButton) {
    backButton.remove();
  }
  
  // 创建新按钮
  backButton = createBackButton();
  document.body.appendChild(backButton);
  
  console.log('[BackButton] 返回按钮已显示');
}

/** 隐藏返回按钮 */
export function hideBackButton(): void {
  if (backButton) {
    backButton.remove();
    backButton = null;
  }
  currentConfig.visible = false;
}

/** 更新返回按钮配置 */
export function updateBackButton(config: Partial<BackButtonConfig>): void {
  currentConfig = { ...currentConfig, ...config };
  
  if (backButton) {
    if (config.text !== undefined) {
      backButton.textContent = config.text;
    }
    if (config.style) {
      Object.assign(backButton.style, config.style);
    }
  }
}

/** 检查是否已显示 */
export function isBackButtonVisible(): boolean {
  return backButton !== null && backButton.parentNode !== null;
}

/** 初始化返回按钮（根据环境自动决定是否显示） */
export function initBackButton(config?: Partial<BackButtonConfig>): void {
  if (!isMiniProgram()) {
    return;
  }
  
  // 确保微信 JSBridge 已加载
  const wx = (window as any).wx;
  if (wx && wx.miniProgram) {
    showBackButton(config);
  } else {
    // 等待微信 JSBridge 就绪
    document.addEventListener('WeixinJSBridgeReady', () => {
      showBackButton(config);
    });
  }
}

/** 销毁返回按钮 */
export function destroyBackButton(): void {
  hideBackButton();
}
