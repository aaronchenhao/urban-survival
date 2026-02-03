/**
 * 分享功能模块
 * 支持浏览器原生分享和微信 JSSDK 分享
 */

import { isMiniProgram, isWeChat } from './env';

/** 分享配置 */
export interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
  success?: () => void;
  fail?: (err: any) => void;
}

/** 默认分享配置 */
const defaultShareConfig: ShareConfig = {
  title: '赛博斩杀线 - 城市生存模拟',
  desc: '北漂青年，存款5万，期限24个月。你能在这座钢筋水泥的丛林中存活多久？',
  link: window.location.href,
  imgUrl: window.location.origin + '/logo.png'
};

let wxConfigReady = false;
let pendingShareConfig: ShareConfig | null = null;

/** 初始化微信 JSSDK */
export async function initWxJSSDK(): Promise<boolean> {
  if (!isWeChat()) {
    console.log('[Share] 非微信环境，跳过 JSSDK 初始化');
    return false;
  }
  
  if (isMiniProgram()) {
    console.log('[Share] 小程序 WebView 环境，使用小程序原生分享');
    return true;
  }
  
  try {
    // 动态加载微信 JSSDK
    await loadWxJSSDK();
    
    // 从后端获取配置（需要你自己的后端接口）
    // 这里使用示例配置，实际使用时需要替换为真实接口
    const config = await fetchWxConfig();
    
    const wx = (window as any).wx;
    
    return new Promise((resolve) => {
      wx.config({
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareAppMessage', 'onMenuShareTimeline']
      });
      
      wx.ready(() => {
        console.log('[Share] 微信 JSSDK 配置成功');
        wxConfigReady = true;
        
        // 如果有待处理的分享配置，立即应用
        if (pendingShareConfig) {
          updateShareConfig(pendingShareConfig);
          pendingShareConfig = null;
        }
        
        resolve(true);
      });
      
      wx.error((err: any) => {
        console.error('[Share] 微信 JSSDK 配置失败:', err);
        resolve(false);
      });
    });
  } catch (err) {
    console.error('[Share] 初始化失败:', err);
    return false;
  }
}

/** 加载微信 JSSDK 脚本 */
function loadWxJSSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).wx) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('JSSDK 加载失败'));
    document.head.appendChild(script);
  });
}

/** 获取微信配置（需要后端接口支持） */
async function fetchWxConfig(): Promise<any> {
  // TODO: 替换为你的后端接口
  // const response = await fetch('/api/wx-config?url=' + encodeURIComponent(window.location.href));
  // return response.json();
  
  // 临时返回空配置，需要你自己实现后端签名
  console.warn('[Share] 请实现 fetchWxConfig 函数，从后端获取微信签名');
  return {
    appId: 'YOUR_APPID',
    timestamp: Math.floor(Date.now() / 1000),
    nonceStr: 'temp',
    signature: 'temp'
  };
}

/** 更新分享配置 */
export function updateShareConfig(config: Partial<ShareConfig>): void {
  const fullConfig = { ...defaultShareConfig, ...config };
  
  if (isMiniProgram()) {
    // 小程序环境：通过 postMessage 通知小程序
    const wx = (window as any).wx;
    if (wx && wx.miniProgram) {
      // 发送分享配置到小程序
      wx.miniProgram.postMessage({
        data: {
          type: 'updateShare',
          ...fullConfig
        }
      });
    }
    return;
  }
  
  if (!isWeChat() || !(window as any).wx) {
    console.log('[Share] 非微信环境，无法更新分享');
    return;
  }
  
  if (!wxConfigReady) {
    // 如果 JSSDK 还没准备好，暂存配置
    pendingShareConfig = fullConfig;
    return;
  }
  
  const wx = (window as any).wx;
  
  // 分享给朋友
  wx.updateAppMessageShareData({
    title: fullConfig.title,
    desc: fullConfig.desc,
    link: fullConfig.link,
    imgUrl: fullConfig.imgUrl,
    success: fullConfig.success,
    fail: fullConfig.fail
  });
  
  // 分享到朋友圈
  wx.updateTimelineShareData({
    title: fullConfig.title,
    link: fullConfig.link,
    imgUrl: fullConfig.imgUrl,
    success: fullConfig.success,
    fail: fullConfig.fail
  });
}

/** 触发浏览器原生分享（Web Share API） */
export async function nativeShare(config: Partial<ShareConfig>): Promise<boolean> {
  const fullConfig = { ...defaultShareConfig, ...config };
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: fullConfig.title,
        text: fullConfig.desc,
        url: fullConfig.link
      });
      return true;
    } catch (err) {
      console.log('[Share] 用户取消分享:', err);
      return false;
    }
  }
  
  // 不支持原生分享，复制链接到剪贴板
  try {
    await navigator.clipboard.writeText(fullConfig.link);
    alert('链接已复制到剪贴板');
    return true;
  } catch (err) {
    console.error('[Share] 复制失败:', err);
    return false;
  }
}

/** 初始化分享功能 */
export function initShare(): void {
  initWxJSSDK();
}
