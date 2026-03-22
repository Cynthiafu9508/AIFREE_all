Page({
  onLoad() {
    setTimeout(() => {
      // DEV: 跳过登录，直接进入主页
      // PROD: 改回 wx.redirectTo({ url: '/pages/login/login' })
      wx.switchTab({ url: '/pages/home/home' })
    }, 1500)
  }
})
