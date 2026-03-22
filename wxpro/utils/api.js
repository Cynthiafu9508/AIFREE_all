/**
 * 接口层 — 对接后端 recover_ifree_server
 * 路径统一定义在此处，方便后续修改
 */

const { post } = require('./request')

const API = {
  /** 发送短信验证码 */
  sendSms(phone) {
    return post('/api/user/sms/send', { phone })
  },

  /** 账号密码登录（账号不存在时自动注册） */
  loginByPassword(account, password) {
    return post('/api/user/login/password', { account, password })
  },

  /** 手机验证码登录（手机未注册时自动注册） */
  loginBySms(phone, code) {
    return post('/api/user/login/sms', { phone, code })
  },

  /** 重置密码 */
  resetPassword(phone, code, newPassword, confirmPassword) {
    return post('/api/user/password/reset', {
      phone,
      code,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  }
}

module.exports = API
