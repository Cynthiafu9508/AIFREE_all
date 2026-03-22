Page({
  data: {
    statusBarHeight: 0,
    deviceId: '',
    deviceName: '',
    wifiSSID: '',
    wifiPwd: '',
    showPwd: false,
    showWifiPicker: false,
    // 占位 WiFi 列表，后续接入真实扫描替换
    wifiList: [
      'WiFi1_adhks',
      'WiFa443s2000dfaj',
      '偷网者必毙',
      'V我50告诉你密码',
      'ziroom204',
      '毛肥的网络',
      '肥猫的个人热点'
    ]
  },

  onLoad(options) {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight,
      deviceId: options.deviceId || '',
      deviceName: decodeURIComponent(options.deviceName || '')
    })
  },

  goBack() { wx.navigateBack() },

  onSSIDInput(e) { this.setData({ wifiSSID: e.detail.value }) },
  onPwdInput(e)  { this.setData({ wifiPwd: e.detail.value }) },
  togglePwd()    { this.setData({ showPwd: !this.data.showPwd }) },

  openWifiPicker()  { this.setData({ showWifiPicker: true }) },
  closeWifiPicker() { this.setData({ showWifiPicker: false }) },

  onSelectWifi(e) {
    this.setData({ wifiSSID: e.currentTarget.dataset.name, showWifiPicker: false })
  },

  onStartConfig() {
    const { wifiSSID, wifiPwd, deviceId, deviceName } = this.data
    if (!wifiSSID) return wx.showToast({ title: '请输入 WiFi 名称', icon: 'none' })
    if (!wifiPwd)  return wx.showToast({ title: '请输入 WiFi 密码', icon: 'none' })

    // 占位：将设备绑定写入本地，后续对接真实配网接口
    const list = wx.getStorageSync('deviceList') || []
    const isFirstDevice = list.length === 0
    if (!list.find(d => d.id === deviceId)) {
      list.push({ id: deviceId, name: deviceName })
      wx.setStorageSync('deviceList', list)
    }
    wx.setStorageSync('activeDeviceId', deviceId)
    wx.setStorageSync('deviceName', deviceName)
    wx.setStorageSync('activeFeatureId', 'english')

    wx.showToast({ title: '配网成功', icon: 'success' })
    setTimeout(() => {
      // 无论是否首台设备，统一跳转到伙伴页，触发全局切换到新设备
      wx.switchTab({ url: '/pages/home/home' })
    }, 1200)
  }
})
