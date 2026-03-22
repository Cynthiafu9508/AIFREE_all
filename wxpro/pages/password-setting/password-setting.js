const API = require('../../utils/api')
const app = getApp()

Page({
  data: {
    pwd1: '', pwd2: '',
    showPwd1: false, showPwd2: false,
    statusBarHeight: 0
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({ statusBarHeight })
  },

  goBack() { wx.navigateBack() },
  onPwd1Input(e) { this.setData({ pwd1: e.detail.value }) },
  onPwd2Input(e) { this.setData({ pwd2: e.detail.value }) },
  togglePwd1() { this.setData({ showPwd1: !this.data.showPwd1 }) },
  togglePwd2() { this.setData({ showPwd2: !this.data.showPwd2 }) },

  async onConfirm() {
    const { pwd1, pwd2 } = this.data
    if (!pwd1) return wx.showToast({ title: '请输入新密码', icon: 'none' })
    if (pwd1.length < 6) return wx.showToast({ title: '密码至少6位', icon: 'none' })
    if (pwd1 !== pwd2) return wx.showToast({ title: '两次密码不一致', icon: 'none' })

    try {
      const phone = wx.getStorageSync('userId') || ''
      // 获取验证码后重置——已登录用户直接调用重置接口
      await API.request('/api/user/password/reset', 'POST', {
        phone, new_password: pwd1, confirm_password: pwd2, code: 'SKIP'
      })
      wx.showToast({ title: '密码设置成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1000)
    } catch (e) {
      wx.showToast({ title: e.message || '设置失败', icon: 'none' })
    }
  }
})
