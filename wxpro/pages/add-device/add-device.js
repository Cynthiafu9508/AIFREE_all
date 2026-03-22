Page({
  data: {
    statusBarHeight: 0,
    state: 'scanning', // 'scanning' | 'notFound' | 'found'
    devices: []
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({ statusBarHeight })
    this.startScan()
  },

  goBack() { wx.navigateBack() },

  startScan() {
    this.setData({ state: 'scanning', devices: [] })
    // 占位：模拟2秒扫描后找到设备
    this._scanTimer = setTimeout(() => {
      // 模拟数据：实际接入蓝牙后替换此处
      const existingList = wx.getStorageSync('deviceList') || []
      const nextNum = existingList.length + 1
      const mockDevices = [
        { id: `device_${nextNum}_${Date.now()}`, name: `贝贝鲨${String(nextNum).padStart(3, '0')}` },
      ]
      if (mockDevices.length > 0) {
        this.setData({ state: 'found', devices: mockDevices })
      } else {
        this.setData({ state: 'notFound' })
      }
    }, 2000)
  },

  onBind(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/configure-network/configure-network?deviceId=${id}&deviceName=${encodeURIComponent(name)}`
    })
  },

  onUnload() {
    if (this._scanTimer) clearTimeout(this._scanTimer)
  }
})
