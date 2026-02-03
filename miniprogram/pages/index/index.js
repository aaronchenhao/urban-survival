const app = getApp();

Page({
  data: {
    h5Url: ''
  },

  onLoad() {
    this.setData({
      h5Url: app.globalData.h5Url
    });
  },

  onShareAppMessage() {
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
  },

  // 跳转到游戏页
  goToGame() {
    wx.navigateTo({
      url: '/pages/game/game',
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护。游戏数据仅存储在本地，不会上传到服务器。如需了解更多，请访问我们的官方网站。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#06b6d4'
    });
  },

  // 显示使用条款
  showTerms() {
    wx.showModal({
      title: '使用条款',
      content: '本游戏仅供娱乐，游戏中的任何情节、数据均为虚构，不代表真实情况。请合理安排游戏时间，享受健康生活。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#06b6d4'
    });
  }
});
