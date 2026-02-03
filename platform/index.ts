/**
 * Platform 适配层入口
 * 统一导出所有平台相关功能
 */

// 环境检测
export {
  isMiniProgram,
  isIOS,
  isAndroid,
  isWeChat,
  getEnvironment,
  getEnvInfo,
  initEnvDetection
} from './env';

// 分享功能
export {
  initWxJSSDK,
  updateShareConfig,
  nativeShare,
  initShare,
  type ShareConfig
} from './share';

// 返回按钮
export {
  showBackButton,
  hideBackButton,
  updateBackButton,
  navigateBack,
  initBackButton,
  destroyBackButton,
  isBackButtonVisible,
  type BackButtonConfig
} from './backButton';

// 小程序通信
export {
  sendMessageToMiniProgram,
  saveProgress,
  clearProgress,
  type MiniProgramMessage
} from './message';

/** 初始化所有平台功能 */
export function initPlatform(): void {
  initEnvDetection();
  initShare();
  initBackButton();
}
