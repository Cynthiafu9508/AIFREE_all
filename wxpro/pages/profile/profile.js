const app = getApp()

Page({
  data: {
    nickname: '未设置昵称'
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    // 读取本地存储的昵称
    const nickname = wx.getStorageSync('nickname')
    if (nickname) this.setData({ nickname })
  },

  editNickname() {
    wx.showToast({ title: '昵称编辑开发中', icon: 'none' })
  },

  goPasswordSetting() {
    wx.navigateTo({ url: '/pages/reset-password/reset-password' })
  },

  goDeviceManage() {
    wx.showToast({ title: '设备管理开发中', icon: 'none' })
  },

  goHelp() {
    wx.showToast({ title: '帮助与客服开发中', icon: 'none' })
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
