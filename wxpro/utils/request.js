/**
 * 统一请求封装
 * 所有接口调用均通过此模块，方便统一处理 token、错误等
 */

const app = getApp()

/**
 * @param {string} path   - 接口路径，如 /api/user/login/password
 * @param {object} data   - 请求 body
 * @param {boolean} withToken - 是否携带登录 token（默认 false）
 * @returns {Promise<{success, message, ...}>}
 */
function post(path, data = {}, withToken = false) {
  const url = app.globalData.baseUrl + path
  const header = { 'content-type': 'application/json' }

  if (withToken && app.globalData.token) {
    header['Authorization'] = 'Bearer ' + app.globalData.token
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'POST',
      data,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res.data || { success: false, message: '网络请求失败' })
        }
      },
      fail(err) {
        reject({ success: false, message: '网络连接失败，请检查网络' })
      }
    })
  })
}

module.exports = { post }
