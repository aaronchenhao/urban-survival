/**
 * 小程序通信模块
 * 用于 H5 与小程序之间传递消息
 */

import { isMiniProgram } from './env';

/** 消息类型 */
export type MessageType = 
  | 'saveProgress'      // 保存进度
  | 'clearProgress'     // 清除进度
  | 'share'             // 分享
  | 'navigateBack'      // 返回
  | 'updateShare'       // 更新分享配置
  | 'custom';           // 自定义消息

/** 小程序消息结构 */
export interface MiniProgramMessage {
  type: MessageType;
  [key: string]: any;
}

/** 向小程序发送消息 */
export function sendMessageToMiniProgram(message: MiniProgramMessage): boolean {
  if (!isMiniProgram()) {
    console.log('[Message] 非小程序环境，消息未发送:', message);
    return false;
  }
  
  const wx = (window as any).wx;
  if (!wx || !wx.miniProgram) {
    console.warn('[Message] 微信 JSBridge 未就绪');
    return false;
  }
  
  try {
    wx.miniProgram.postMessage({
      data: message
    });
    console.log('[Message] 消息已发送:', message);
    return true;
  } catch (err) {
    console.error('[Message] 发送失败:', err);
    return false;
  }
}

/** 通知小程序保存游戏进度 */
export function saveProgress(extraData?: Record<string, any>): boolean {
  return sendMessageToMiniProgram({
    type: 'saveProgress',
    timestamp: Date.now(),
    ...extraData
  });
}

/** 通知小程序清除游戏进度 */
export function clearProgress(): boolean {
  return sendMessageToMiniProgram({
    type: 'clearProgress',
    timestamp: Date.now()
  });
}

/** 通知小程序触发分享 */
export function requestShare(title?: string): boolean {
  return sendMessageToMiniProgram({
    type: 'share',
    title: title || '赛博斩杀线'
  });
}

/** 监听小程序发来的消息（需要小程序主动 postMessage 到 WebView） */
export function onMiniProgramMessage(callback: (message: any) => void): void {
  // 小程序 WebView 不支持 H5 直接监听消息
  // 如果需要双向通信，需要通过 URL hash 或轮询等方式
  console.log('[Message] 小程序 WebView 不支持 H5 监听消息，请使用其他方式通信');
}

/** 通过 URL hash 与小程序通信（替代方案） */
export function setHashData(data: Record<string, any>): void {
  const hash = btoa(JSON.stringify(data));
  window.location.hash = hash;
}

/** 读取 URL hash 数据 */
export function getHashData(): Record<string, any> | null {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    return JSON.parse(atob(hash));
  } catch {
    return null;
  }
}
