Page({
  data: { showAddModal: false },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  onBindDevice() {
    this.setData({ showAddModal: true })
  },

  goToScan() {
    this.setData({ showAddModal: false })
    wx.navigateTo({ url: '/pages/add-device/add-device' })
  }
})
