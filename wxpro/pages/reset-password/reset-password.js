const API = require('../../utils/api')

const PHONE_RE = /^1[3-9]\d{9}$/

Page({
  data: {
    step: 1,             // 1=验证手机, 2=设置新密码
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
    showPwd: false,
    showConfirmPwd: false,
    loading: false,
    countdown: 0,
    toast: { field: '', msg: '' }
  },

  onPhoneInput(e)      { this.setData({ phone: e.detail.value }) },
  onCodeInput(e)       { this.setData({ code: e.detail.value }) },
  onNewPwdInput(e)     { this.setData({ newPassword: e.detail.value }) },
  onConfirmPwdInput(e) { this.setData({ confirmPassword: e.detail.value }) },
  togglePwd()          { this.setData({ showPwd: !this.data.showPwd }) },
  toggleConfirmPwd()   { this.setData({ showConfirmPwd: !this.data.showConfirmPwd }) },

  showToast(field, msg) {
    this.setData({ toast: { field, msg } })
    setTimeout(() => this.setData({ toast: { field: '', msg: '' } }), 3000)
  },

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

  async onSubmit() {
    if (this.data.loading) return

    if (this.data.step === 1) {
      // Step1：校验手机号和验证码，进入 Step2
      const { phone, code } = this.data
      if (!PHONE_RE.test(phone.trim())) {
        this.showToast('phone', '请输入正确手机号')
        return
      }
      if (!code.trim()) {
        this.showToast('code', '请输入验证码')
        return
      }
      // 进入第二步，不请求接口（验证在最终提交时一并校验）
      this.setData({ step: 2 })
      return
    }

    // Step2：提交重置
    const { phone, code, newPassword, confirmPassword } = this.data
    if (!newPassword.trim()) {
      this.showToast('newPassword', '请输入新密码')
      return
    }
    if (newPassword !== confirmPassword) {
      this.showToast('confirmPassword', '两次密码不一致')
      return
    }

    this.setData({ loading: true })
    try {
      const res = await API.resetPassword(phone.trim(), code.trim(), newPassword, confirmPassword)
      if (res && res.success) {
        wx.showToast({ title: '密码重置成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    } catch (err) {
      const msg = err.message || '重置失败'
      if (msg.includes('两次密码')) {
        this.showToast('confirmPassword', msg)
      } else if (msg.includes('验证码')) {
        this.showToast('code', msg)
      } else if (msg.includes('密码可使用')) {
        this.showToast('newPassword', msg)
      } else {
        wx.showToast({ title: msg, icon: 'none' })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
