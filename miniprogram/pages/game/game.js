const app = getApp();

Page({
  data: {
    h5Url: ''
  },

  onLoad(options) {
    // 构建 H5 URL，可以携带参数
    let url = app.globalData.h5Url;
    
    // 从 storage 读取是否有游戏进度，传递给 H5
    const hasProgress = wx.getStorageSync('csl_has_progress') || false;
    
    // 手动拼接 URL 参数（小程序不支持 URLSearchParams）
    const params = [];
    params.push('from=miniprogram');
    params.push('hasProgress=' + (hasProgress ? '1' : '0'));
    
    // 如果有其他参数也一并传递
    if (options.scene) {
      params.push('scene=' + encodeURIComponent(options.scene));
    }
    
    url = url + (url.includes('?') ? '&' : '?') + params.join('&');
    
    this.setData({ h5Url: url });
    
    console.log('加载 H5 地址:', url);
  },

  onShow() {
    // 页面显示时，可以在这里处理返回逻辑
  },

  // WebView 加载成功
  onLoadSuccess() {
    console.log('H5 加载成功');
  },

  // WebView 加载失败
  onLoadError(e) {
    console.error('H5 加载失败:', e);
    wx.showModal({
      title: '加载失败',
      content: '游戏加载失败，请检查网络后重试',
      showCancel: false,
      confirmText: '返回',
      success: () => {
        wx.navigateBack();
      }
    });
  },

  // 接收 H5 发来的消息
  onMessage(e) {
    const { data } = e.detail;
    console.log('收到 H5 消息:', data);
    
    if (!data || !Array.isArray(data)) return;
    
    data.forEach(msg => {
      this.handleMessage(msg);
    });
  },

  // 处理不同类型的消息
  handleMessage(msg) {
    switch (msg.type) {
      case 'saveProgress':
        // 保存游戏进度标记
        wx.setStorageSync('csl_has_progress', true);
        break;
        
      case 'clearProgress':
        // 清除游戏进度
        wx.setStorageSync('csl_has_progress', false);
        break;
        
      case 'share':
        // 触发分享（需要用户主动触发，这里只是提示）
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        });
        break;
        
      case 'navigateBack':
        // 返回小程序上一页
        wx.navigateBack({
          fail: () => {
            // 如果返回失败，说明是在首页，重定向到入口页
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }
        });
        break;
        
      default:
        console.log('未知消息类型:', msg.type);
    }
  },

  // 用户分享
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: res.target.dataset.title || '赛博斩杀线 - 城市生存模拟',
        path: '/pages/index/index',
        imageUrl: '/images/share-cover.jpg'
      };
    }
    
    return {
      title: '赛博斩杀线 - 城市生存模拟',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '赛博斩杀线 - 你能在这座城市存活多久？',
      query: ''
    };
  }
});
