Page({
  onLoad() {
    setTimeout(() => {
      const token = wx.getStorageSync('token')
      if (token) {
        wx.switchTab({ url: '/pages/home/home' })
      } else {
        wx.redirectTo({ url: '/pages/login/login' })
      }
    }, 1500)
  }
})
