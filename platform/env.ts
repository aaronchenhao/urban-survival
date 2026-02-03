/**
 * 环境检测模块
 * 用于检测当前运行环境（浏览器、微信小程序 WebView 等）
 */

/** 环境类型 */
export type Environment = 'browser' | 'miniprogram' | 'unknown';

/** 检测是否在小程序 WebView 中运行 */
export function isMiniProgram(): boolean {
  // 方法1: 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from') === 'miniprogram') {
    return true;
  }
  
  // 方法2: 检查 userAgent (微信小程序 WebView 特征)
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('micromessenger')) {
    // 在微信内置浏览器中，可能是小程序 WebView
    // 进一步检查是否有小程序注入的 JSBridge
    if (typeof (window as any).wx !== 'undefined') {
      return true;
    }
  }
  
  // 方法3: 检查是否有小程序特定的全局对象
  if (typeof (window as any).__wxjs_environment === 'miniprogram') {
    return true;
  }
  
  return false;
}

/** 检测是否在 iOS 环境 */
export function isIOS(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

/** 检测是否在 Android 环境 */
export function isAndroid(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return /android/.test(ua);
}

/** 检测是否在微信环境中 */
export function isWeChat(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

/** 获取当前环境 */
export function getEnvironment(): Environment {
  if (isMiniProgram()) {
    return 'miniprogram';
  }
  return 'browser';
}

/** 获取环境信息对象 */
export function getEnvInfo() {
  return {
    environment: getEnvironment(),
    isMiniProgram: isMiniProgram(),
    isWeChat: isWeChat(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    userAgent: navigator.userAgent
  };
}

/** 初始化环境检测 */
export function initEnvDetection(): void {
  const env = getEnvInfo();
  console.log('[Platform] 环境信息:', env);
  
  // 将环境信息挂载到全局，方便调试
  (window as any).__ENV_INFO__ = env;
}
