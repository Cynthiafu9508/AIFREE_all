const app = getApp()

const AVATARS = [
  '/images/profile/hi.png',
  '/images/profile/招手.png',
  '/images/profile/点赞.png',
  '/images/profile/疑惑.png',
  '/images/profile/趴着.png',
  '/images/profile/捂嘴笑.png',
]

Page({
  data: {
    nickname: '未设置昵称',
    avatarIndex: 0,
    avatar: AVATARS[0],
    showNicknameModal: false,
    nicknameInput: ''
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    const nickname = wx.getStorageSync('nickname')
    if (nickname) this.setData({ nickname })

    const avatarIndex = wx.getStorageSync('avatarIndex') || 0
    this.setData({ avatarIndex, avatar: AVATARS[avatarIndex] })
  },

  switchAvatar() {
    const nextIndex = (this.data.avatarIndex + 1) % AVATARS.length
    this.setData({ avatarIndex: nextIndex, avatar: AVATARS[nextIndex] })
    wx.setStorageSync('avatarIndex', nextIndex)
  },

  editNickname() {
    this.setData({ showNicknameModal: true, nicknameInput: this.data.nickname })
  },

  onNicknameInput(e) {
    this.setData({ nicknameInput: e.detail.value })
  },

  cancelNickname() {
    this.setData({ showNicknameModal: false })
  },

  confirmNickname() {
    const name = this.data.nicknameInput.trim()
    if (!name) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    wx.setStorageSync('nickname', name)
    this.setData({ nickname: name, showNicknameModal: false })
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  goPasswordSetting() {
    wx.navigateTo({ url: '/pages/password-setting/password-setting' })
  },

  goDeviceManage() {
    wx.navigateTo({ url: '/pages/device/device' })
  },

  goHelp() {
    wx.navigateTo({ url: '/pages/help/help' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')
          wx.removeStorageSync('nickname')
          app.globalData.token = null
          app.globalData.userId = null
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  }
})
