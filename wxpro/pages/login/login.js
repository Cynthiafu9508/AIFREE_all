const API = require('../../utils/api')
const app = getApp()

const PHONE_RE = /^1[3-9]\d{9}$/

Page({
  data: {
    mode: 'sms',        // 'password' | 'sms'
    account: '',
    password: '',
    phone: '',
    code: '',
    showPwd: false,
    agreed: false,
    loading: false,
    countdown: 0,       // 验证码倒计时秒数
    toast: { field: '', msg: '' }   // 错误提示
  },

  // ------------------------------------------------------------------ 输入事件
  onAccountInput(e) { this.setData({ account: e.detail.value }) },
  onPasswordInput(e) { this.setData({ password: e.detail.value }) },
  onPhoneInput(e)   { this.setData({ phone: e.detail.value }) },
  onCodeInput(e)    { this.setData({ code: e.detail.value }) },

  togglePwd() { this.setData({ showPwd: !this.data.showPwd }) },
  toggleAgree() { this.setData({ agreed: !this.data.agreed }) },
  switchMode() {
    this.setData({
      mode: this.data.mode === 'password' ? 'sms' : 'password',
      toast: { field: '', msg: '' }
    })
  },

  // ------------------------------------------------------------------ 错误提示
  showToast(field, msg) {
    this.setData({ toast: { field, msg } })
    // 3 秒后自动清除
    setTimeout(() => this.setData({ toast: { field: '', msg: '' } }), 3000)
  },

  // ------------------------------------------------------------------ 发送短信
  async sendSms() {
    if (this.data.countdown > 0) return
    const phone = this.data.phone.trim()
    if (!PHONE_RE.test(phone)) {
      this.showToast('phone', '请输入正确手机号')
      return
    }
    try {
      await API.sendSms(phone)
      wx.showToast({ title: '验证码已发送', icon: 'none' })
      this._startCountdown(60)
    } catch (err) {
      this.showToast('phone', err.message || '发送失败')
    }
  },

  _startCountdown(sec) {
    this.setData({ countdown: sec })
    const timer = setInterval(() => {
      const next = this.data.countdown - 1
      if (next <= 0) {
        clearInterval(timer)
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown: next })
      }
    }, 1000)
  },

  // ------------------------------------------------------------------ 登录
  async onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意相关协议', icon: 'none' })
      return
    }
    if (this.data.loading) return
    this.setData({ loading: true, toast: { field: '', msg: '' } })

    try {
      let res
      if (this.data.mode === 'password') {
        res = await this._loginByPassword()
      } else {
        res = await this._loginBySms()
      }

      if (res && res.success) {
        // 保存登录态
        app.globalData.token = res.token
        app.globalData.userId = res.user_id
        wx.setStorageSync('token', res.token)
        wx.setStorageSync('userId', res.user_id)
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/home/home' })
        }, 800)
      }
    } catch (err) {
      // 根据错误内容定位到对应字段
      const msg = err.message || '登录失败'
      if (msg.includes('账号不存在')) {
        this.showToast('account', '账号不存在')
      } else if (msg.includes('密码错误')) {
        this.showToast('password', '密码错误')
      } else if (msg.includes('手机号')) {
        this.showToast('phone', msg)
      } else if (msg.includes('验证码')) {
        this.showToast('code', msg)
      } else if (msg.includes('密码可使用')) {
        this.showToast('password', msg)
      } else {
        wx.showToast({ title: msg, icon: 'none' })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  async _loginByPassword() {
    const { account, password } = this.data
    if (!account.trim()) { this.showToast('account', '请输入账号'); return null }
    if (!password.trim()) { this.showToast('password', '请输入密码'); return null }
    return API.loginByPassword(account.trim(), password)
  },

  async _loginBySms() {
    const { phone, code } = this.data
    if (!PHONE_RE.test(phone.trim())) { this.showToast('phone', '请输入正确手机号'); return null }
    if (!code.trim()) { this.showToast('code', '请输入验证码'); return null }
    return API.loginBySms(phone.trim(), code.trim())
  },

  // ------------------------------------------------------------------ 跳转重置密码
  goResetPassword() {
    wx.navigateTo({ url: '/pages/reset-password/reset-password' })
  },

  openService() {
    wx.navigateTo({ url: '/pages/doc/service' })
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/doc/privacy' })
  }
})
