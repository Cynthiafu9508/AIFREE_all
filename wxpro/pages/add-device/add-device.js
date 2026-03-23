// 设备名称前缀过滤（匹配 ESP32 蓝牙广播名）
const DEVICE_NAME_PREFIX = 'DTXZ'

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
    this._foundMap = {}

    wx.openBluetoothAdapter({
      success: () => {
        this._startDiscovery()
      },
      fail: (err) => {
        console.log('openBluetoothAdapter fail', err)
        this.setData({ state: 'notFound' })
        wx.showToast({ title: '请开启手机蓝牙', icon: 'none' })
      }
    })
  },

  _startDiscovery() {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: () => {
        wx.onBluetoothDeviceFound((res) => {
          this._onDeviceFound(res.devices)
        })
        // 扫描超时：10 秒后若无结果则显示未找到
        this._scanTimer = setTimeout(() => {
          this._stopDiscovery()
          if (this.data.devices.length === 0) {
            this.setData({ state: 'notFound' })
          }
        }, 10000)
      },
      fail: () => {
        this.setData({ state: 'notFound' })
      }
    })
  },

  _onDeviceFound(bleDevices) {
    const newDevices = []
    bleDevices.forEach(d => {
      const name = d.name || d.localName || ''
      if (!name.startsWith(DEVICE_NAME_PREFIX)) return
      if (this._foundMap[d.deviceId]) return
      this._foundMap[d.deviceId] = true
      newDevices.push({ id: d.deviceId, name: name })
    })

    if (newDevices.length > 0) {
      const list = this.data.devices.concat(newDevices)
      this.setData({ state: 'found', devices: list })
    }
  },

  _stopDiscovery() {
    wx.stopBluetoothDevicesDiscovery({ fail() {} })
    if (this._scanTimer) {
      clearTimeout(this._scanTimer)
      this._scanTimer = null
    }
  },

  onBind(e) {
    const { id, name } = e.currentTarget.dataset
    this._stopDiscovery()
    wx.navigateTo({
      url: `/pages/configure-network/configure-network?deviceId=${encodeURIComponent(id)}&deviceName=${encodeURIComponent(name)}`
    })
  },

  onUnload() {
    this._stopDiscovery()
    wx.offBluetoothDeviceFound()
    wx.closeBluetoothAdapter({ fail() {} })
  }
})
