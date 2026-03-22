App({
  globalData: {
    token: '',
    userId: '',
    baseUrl: 'http://106.14.8.187:8003'  // TODO: 替换为正式服务器地址
  },

  onLaunch() {
    // 读取本地存储的登录态
    const token = wx.getStorageSync('token')
    const userId = wx.getStorageSync('userId')
    if (token) {
      this.globalData.token = token
      this.globalData.userId = userId
    }
  }
})
