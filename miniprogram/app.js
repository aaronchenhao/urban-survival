App({
  onLaunch() {
    console.log('赛博斩杀线 小程序启动');
    
    // 获取系统信息用于适配（使用新 API）
    const windowInfo = wx.getWindowInfo();
    const deviceInfo = wx.getDeviceInfo();
    
    this.globalData.statusBarHeight = windowInfo.statusBarHeight;
    this.globalData.screenHeight = windowInfo.screenHeight;
    this.globalData.safeArea = windowInfo.safeArea;
    this.globalData.platform = deviceInfo.platform;
  },

  globalData: {
    statusBarHeight: 0,
    screenHeight: 0,
    safeArea: null,
    // H5 游戏部署地址
    // 开发模式(Vite dev): http://localhost:5173 (CSS 是 JS 模块，小程序不兼容)
    // 生产模式(Vite preview): http://localhost:4173 (CSS 是纯 CSS 文件，小程序兼容)
    // 生产环境: https://你的域名.com
    h5Url: 'http://localhost:4173'
  }
});
