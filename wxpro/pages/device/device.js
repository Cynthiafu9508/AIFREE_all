Page({
  data: {
    deviceName: '',
    firmware: '1.9.0',
    online: false,
    showNicknameModal: false,
    nicknameInput: '',
    showSwitchSheet: false,
    showUnbindModal: false,
    showAddModal: false,
    deviceList: [],
    activeDeviceId: '',
    statusBarHeight: 0
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this._loadDevices()
    this.setData({ statusBarHeight })
  },

  _loadDevices() {
    const deviceList = wx.getStorageSync('deviceList') || []
    const activeDeviceId = wx.getStorageSync('activeDeviceId') || ''
    const active = deviceList.find(d => d.id === activeDeviceId) || deviceList[0]
    this.setData({
      deviceList,
      activeDeviceId: active ? active.id : '',
      deviceName: active ? active.name : ''
    })
  },

  goBack() { wx.navigateBack() },

  // 切换设备面板
  onSwapDevice() {
    this.setData({ showSwitchSheet: true })
  },

  closeSwitchSheet() {
    this.setData({ showSwitchSheet: false })
  },

  onSelectDevice(e) {
    const id = e.currentTarget.dataset.id
    const device = this.data.deviceList.find(d => d.id === id)
    if (!device) return
    wx.setStorageSync('activeDeviceId', id)
    this.setData({
      activeDeviceId: id,
      deviceName: device.name,
      showSwitchSheet: false
    })
  },

  onAddDevice() {
    this.setData({ showSwitchSheet: false, showAddModal: true })
  },

  closeAddModal() {
    this.setData({ showAddModal: false })
  },

  goToScan() {
    this.setData({ showAddModal: false })
    wx.navigateTo({ url: '/pages/add-device/add-device' })
  },

  // 昵称编辑
  onEditNickname() {
    this.setData({ showNicknameModal: true, nicknameInput: this.data.deviceName })
  },

  onNicknameInput(e) {
    this.setData({ nicknameInput: e.detail.value })
  },

  cancelNickname() {
    this.setData({ showNicknameModal: false })
  },

  confirmNickname() {
    const name = this.data.nicknameInput.trim()
    if (!name) return wx.showToast({ title: '昵称不能为空', icon: 'none' })
    // 同步更新列表中当前设备的名称
    const list = this.data.deviceList.map(d =>
      d.id === this.data.activeDeviceId ? { ...d, name } : d
    )
    wx.setStorageSync('deviceList', list)
    wx.setStorageSync('deviceName', name)
    this.setData({ deviceName: name, deviceList: list, showNicknameModal: false })
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  onConfigNetwork() {
    wx.showToast({ title: '配网功能开发中', icon: 'none' })
  },

  onUnbind() {
    this.setData({ showUnbindModal: true })
  },

  cancelUnbind() {
    this.setData({ showUnbindModal: false })
  },

  confirmUnbind() {
    const list = this.data.deviceList.filter(d => d.id !== this.data.activeDeviceId)
    const next = list[0] || null
    wx.setStorageSync('deviceList', list)
    wx.setStorageSync('activeDeviceId', next ? next.id : '')
    wx.setStorageSync('deviceName', next ? next.name : '')
    this.setData({
      showUnbindModal: false,
      deviceList: list,
      activeDeviceId: next ? next.id : '',
      deviceName: next ? next.name : ''
    })
    wx.showToast({ title: '已解绑', icon: 'success' })
  }
})
