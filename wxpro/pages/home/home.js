const app = getApp()

Page({
  data: {
    isBound: false,
    online: false,
    statusBarHeight: 0,
    showAddModal: false
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({ statusBarHeight })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    // 检测设备绑定状态
    const activeDeviceId = wx.getStorageSync('activeDeviceId') || ''
    this.setData({ isBound: !!activeDeviceId })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/device/device' })
  },

  onBindDevice() {
    this.setData({ showAddModal: true })
  },

  goToScan() {
    this.setData({ showAddModal: false })
    wx.navigateTo({ url: '/pages/add-device/add-device' })
  },

  onChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  }
})
