Page({
  data: {
    deviceName: '',
    firmware: '1.9.0',
    online: false,
    showNicknameModal: false,
    nicknameInput: '',
    statusBarHeight: 0
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    const deviceName = wx.getStorageSync('deviceName') || ''
    this.setData({ statusBarHeight, deviceName })
  },

  goBack() { wx.navigateBack() },

  onSwapDevice() {
    wx.showToast({ title: '切换设备功能开发中', icon: 'none' })
  },

  onAddDevice() {
    wx.showToast({ title: '添加设备功能开发中', icon: 'none' })
  },

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
    wx.setStorageSync('deviceName', name)
    this.setData({ deviceName: name, showNicknameModal: false })
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  onConfigNetwork() {
    wx.showToast({ title: '配网功能开发中', icon: 'none' })
  },

  onUnbind() {
    wx.showModal({
      title: '解绑设备',
      content: '确定要解绑当前设备吗？',
      confirmText: '解绑',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('deviceName')
          this.setData({ deviceName: '' })
          wx.showToast({ title: '已解绑', icon: 'success' })
        }
      }
    })
  }
})
