Page({
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  onBindDevice() {
    wx.showToast({ title: '绑定设备功能开发中', icon: 'none' })
  }
})
