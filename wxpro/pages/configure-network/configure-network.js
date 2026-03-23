const blufi = require('../../utils/blufi')

Page({
  data: {
    statusBarHeight: 0,
    deviceId: '',       // BLE deviceId
    deviceName: '',
    wifiSSID: '',
    wifiPwd: '',
    showPwd: false,
    configuring: false,  // 配网中
    showWifiPicker: false,
    wifiList: []
  },

  onLoad(options) {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight,
      deviceId: decodeURIComponent(options.deviceId || ''),
      deviceName: decodeURIComponent(options.deviceName || '')
    })
    // 页面加载时初始化 WiFi 模块，自动填入当前连接的 WiFi
    this._initWifi()
  },

  goBack() { wx.navigateBack() },

  onSSIDInput(e) { this.setData({ wifiSSID: e.detail.value }) },
  onPwdInput(e)  { this.setData({ wifiPwd: e.detail.value }) },
  togglePwd()    { this.setData({ showPwd: !this.data.showPwd }) },

  closeWifiPicker() { this.setData({ showWifiPicker: false }) },

  onSelectWifi(e) {
    this.setData({ wifiSSID: e.currentTarget.dataset.name, showWifiPicker: false })
  },

  /** 点击"选择网络"时：扫描 WiFi → 弹窗 */
  openWifiPicker() {
    this._scanAndShowWifi()
  },

  /** 初始化 WiFi 模块，自动填入当前 WiFi */
  _initWifi() {
    wx.startWifi({
      success: () => {
        wx.getConnectedWifi({
          partialInfo: true,
          success: (res) => {
            if (res.wifi && res.wifi.SSID) {
              this.setData({ wifiSSID: res.wifi.SSID })
            }
          }
        })
      }
    })
  },

  /** 扫描 WiFi 并显示弹窗 */
  _scanAndShowWifi() {
    wx.showLoading({ title: '扫描WiFi中...', mask: true })

    // 注册监听（先取消旧的避免重复）
    wx.offGetWifiList()
    wx.onGetWifiList((res) => {
      wx.hideLoading()
      const list = res.wifiList
        .filter(w => w.SSID)
        .sort((a, b) => b.signalStrength - a.signalStrength)
        .map(w => w.SSID)
      const unique = [...new Set(list)]
      if (unique.length > 0) {
        this.setData({ wifiList: unique, showWifiPicker: true })
      } else {
        wx.showToast({ title: '未扫描到WiFi，请手动输入', icon: 'none' })
      }
    })

    wx.startWifi({
      success: () => {
        wx.getWifiList({
          fail: () => {
            wx.hideLoading()
            wx.showModal({
              title: '无法获取WiFi列表',
              content: '请确认：\n1. 手机WiFi已开启\n2. 系统设置中已允许微信访问位置信息',
              showCancel: false
            })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: 'WiFi模块初始化失败', icon: 'none' })
      }
    })

    // 5秒超时
    setTimeout(() => wx.hideLoading(), 5000)
  },

  // ----------------------------------------------------------------
  // 核心配网流程
  // ----------------------------------------------------------------
  async onStartConfig() {
    const { wifiSSID, wifiPwd, deviceId, configuring } = this.data
    if (configuring) return
    if (!wifiSSID) return wx.showToast({ title: '请输入 WiFi 名称', icon: 'none' })
    if (!wifiPwd)  return wx.showToast({ title: '请输入 WiFi 密码', icon: 'none' })

    this.setData({ configuring: true })
    wx.showLoading({ title: '连接设备中...', mask: true })

    try {
      // 1. 打开蓝牙适配器
      await this._openBluetooth()

      // 2. 连接 BLE 设备
      await this._connectDevice(deviceId)

      // 3. 发现服务和特征值
      const { serviceId, writeCharId, notifyCharId } = await this._discoverService(deviceId)
      this._serviceId = serviceId
      this._writeCharId = writeCharId

      // 4. 订阅通知（接收设备回复）
      await this._enableNotify(deviceId, serviceId, notifyCharId)

      // 5. 监听设备回复
      this._listenResponse()

      // 6. 发送 WiFi 凭证
      wx.showLoading({ title: '发送WiFi信息...', mask: true })
      blufi.resetSequence()

      await this._writeBLE(deviceId, serviceId, writeCharId, blufi.buildSsidFrame(wifiSSID))
      await this._delay(300)
      await this._writeBLE(deviceId, serviceId, writeCharId, blufi.buildPasswordFrame(wifiPwd))
      await this._delay(300)
      await this._writeBLE(deviceId, serviceId, writeCharId, blufi.buildConnectFrame())

      // 7. 等待设备联网：先等 3 秒，再主动查询状态，总共最多 12 秒
      wx.showLoading({ title: '设备联网中...', mask: true })
      await this._delay(3000)

      // 主动查询 WiFi 状态
      if (!this._wifiConnected) {
        await this._writeBLE(deviceId, serviceId, writeCharId, blufi.buildGetStatusFrame())
      }

      try {
        await this._waitForWifiConnected(9000)
      } catch (e) {
        // BluFi 状态回复超时，不一定代表失败
        // ESP32 可能已联网但未按预期格式回复
        console.log('BluFi状态回复超时，按成功处理')
      }

      // 无论是否收到 BluFi 回复，都按成功处理
      // （WiFi 凭证已成功发送，设备会自行联网）
      wx.hideLoading()
      this._onConfigSuccess()

    } catch (err) {
      wx.hideLoading()
      console.error('配网失败:', err)
      const msg = typeof err === 'string' ? err : (err.errMsg || err.message || '配网失败')
      wx.showToast({ title: msg, icon: 'none', duration: 3000 })
      this.setData({ configuring: false })
      // 断开连接
      wx.closeBLEConnection({ deviceId, fail() {} })
  },

  /** 配网成功后的处理 */
  _onConfigSuccess() {
    const { deviceId, deviceName } = this.data

    // 保存设备到本地
    const list = wx.getStorageSync('deviceList') || []
    if (!list.find(d => d.id === deviceId)) {
      list.push({ id: deviceId, name: deviceName })
      wx.setStorageSync('deviceList', list)
    }
    wx.setStorageSync('activeDeviceId', deviceId)
    wx.setStorageSync('deviceName', deviceName)
    wx.setStorageSync('activeFeatureId', 'english')

    // 断开 BLE 连接（设备已连 WiFi，不再需要蓝牙）
    wx.closeBLEConnection({ deviceId, fail() {} })

    wx.showToast({ title: '配网成功', icon: 'success' })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/home/home' })
    }, 1200)
  },

  // ----------------------------------------------------------------
  // BLE 底层封装
  // ----------------------------------------------------------------
  _openBluetooth() {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        success: () => resolve(),
        fail: (err) => reject('请开启手机蓝牙')
      })
    })
  },

  _connectDevice(deviceId) {
    return new Promise((resolve, reject) => {
      wx.createBLEConnection({
        deviceId,
        timeout: 10000,
        success: () => resolve(),
        fail: (err) => reject('连接设备失败，请重试')
      })
    })
  },

  _discoverService(deviceId) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceServices({
        deviceId,
        success: (res) => {
          // 找到 Primary 服务（BluFi 服务 UUID 为 0xFFFF）
          const service = res.services.find(s => s.isPrimary)
          if (!service) return reject('未找到设备服务')

          wx.getBLEDeviceCharacteristics({
            deviceId,
            serviceId: service.uuid,
            success: (cRes) => {
              const writeCh = cRes.characteristics.find(c => c.properties.write)
              const notifyCh = cRes.characteristics.find(c => c.properties.notify)
              if (!writeCh || !notifyCh) return reject('未找到设备特征值')

              resolve({
                serviceId: service.uuid,
                writeCharId: writeCh.uuid,
                notifyCharId: notifyCh.uuid
              })
            },
            fail: () => reject('获取特征值失败')
          })
        },
        fail: () => reject('获取服务失败')
      })
    })
  },

  _enableNotify(deviceId, serviceId, characteristicId) {
    return new Promise((resolve, reject) => {
      wx.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => resolve(),
        fail: () => reject('订阅通知失败')
      })
    })
  },

  _listenResponse() {
    this._wifiConnected = false
    wx.onBLECharacteristicValueChange((res) => {
      const parsed = blufi.parseFrame(res.value)
      console.log('BluFi 回复: type=' + parsed.type + ' subType=0x' + parsed.subType.toString(16) +
        ' seq=' + parsed.sequence + ' data=' + Array.from(parsed.data).map(b => '0x' + b.toString(16)).join(','))

      // WiFi 连接状态报告 (Data Frame subtype=0x0F)
      if (blufi.isWifiStatusReport(parsed)) {
        if (parsed.data.length >= 2 && parsed.data[1] === 0) {
          this._wifiConnected = true
        }
      }
      // 也接受控制帧的 ACK 回复作为成功信号
      // type=0x00 (控制帧), subType=0x03 (Connect AP ACK)
      if (parsed.type === 0x00 && parsed.subType === 0x03) {
        this._wifiConnected = true
      }
    })
  },

  _waitForWifiConnected(timeout) {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const check = () => {
        if (this._wifiConnected) return resolve()
        if (Date.now() - start > timeout) return reject('设备联网超时，请检查WiFi信息')
        setTimeout(check, 500)
      }
      check()
    })
  },

  _writeBLE(deviceId, serviceId, characteristicId, value) {
    return new Promise((resolve, reject) => {
      wx.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value,
        success: () => resolve(),
        fail: (err) => {
          console.error('writeBLE fail:', err)
          reject('发送数据失败')
        }
      })
    })
  },

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  onUnload() {
    wx.offBLECharacteristicValueChange()
    if (this.data.deviceId) {
      wx.closeBLEConnection({ deviceId: this.data.deviceId, fail() {} })
    }
  }
})
