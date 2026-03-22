Page({
  data: { statusBarHeight: 0 },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({ statusBarHeight })
  },

  goBack() { wx.navigateBack() },

  copyWechat() {
    wx.setClipboardData({
      data: 'ifree8868',
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  }
})
