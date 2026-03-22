const app = getApp()

Page({
  onShow() {
    // 同步 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/device/device' })
  },

  showMenu() {
    // TODO: 弹出更多菜单
  },

  onRecord() {
    // TODO: 录音 / 对讲功能
  },

  onBindDevice() {
    // TODO: 跳转绑定设备页
    wx.showToast({ title: '绑定设备功能开发中', icon: 'none' })
  }
})
