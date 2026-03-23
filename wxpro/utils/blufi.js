/**
 * BluFi 协议工具
 * ESP32 蓝牙配网协议：通过 BLE 向设备发送 WiFi 凭证
 *
 * Service UUID:  0xFFFF
 * Write  Char:   0xFF01 (Phone → ESP32)
 * Notify Char:   0xFF02 (ESP32 → Phone)
 */

let _sequence = 0

/** 重置帧序列号（每次重新连接后调用） */
function resetSequence() {
  _sequence = 0
}

/** 字符串 → Uint8Array（UTF-8 编码） */
function stringToBytes(str) {
  const arr = []
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(i + 1)
      if (lo >= 0xdc00 && lo <= 0xdfff) {
        code = ((code & 0x3ff) << 10) + (lo & 0x3ff) + 0x10000
        i++
      }
    }
    if (code < 0x80) {
      arr.push(code)
    } else if (code < 0x800) {
      arr.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code < 0x10000) {
      arr.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    } else {
      arr.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    }
  }
  return new Uint8Array(arr)
}

/** Uint8Array → 字符串（UTF-8 解码） */
function bytesToString(u8a) {
  let out = ''
  let i = 0
  while (i < u8a.length) {
    const c = u8a[i++]
    if (c < 0x80) {
      out += String.fromCharCode(c)
    } else if ((c >> 5) === 0x06) {
      out += String.fromCharCode(((c & 0x1f) << 6) | (u8a[i++] & 0x3f))
    } else if ((c >> 4) === 0x0e) {
      const c2 = u8a[i++], c3 = u8a[i++]
      out += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f))
    }
  }
  return out
}

/**
 * 构建 BluFi 帧
 * @param {number} cmd    - 类型：0x00=控制帧, 0x01=数据帧
 * @param {number} subCmd - 子类型（6 bit）
 * @param {Uint8Array|Array} data - 载荷
 * @returns {ArrayBuffer}
 */
function buildFrame(cmd, subCmd, data) {
  const payload = data || []
  const len = payload.length
  const ab = new ArrayBuffer(len + 4) // type + fc + seq + len + data
  const u8a = new Uint8Array(ab)

  u8a[0] = (subCmd << 2) | (cmd & 0x03)  // Type: subtype(6bit) | type(2bit)
  u8a[1] = 0x00                           // Frame Control: 无加密、无校验
  u8a[2] = _sequence++                    // Sequence Number
  u8a[3] = len                            // Data Length

  for (let i = 0; i < len; i++) {
    u8a[4 + i] = payload[i]
  }
  return ab
}

/** 发送 WiFi SSID（数据帧, subtype=0x02） */
function buildSsidFrame(ssid) {
  return buildFrame(0x01, 0x02, stringToBytes(ssid))
}

/** 发送 WiFi 密码（数据帧, subtype=0x03） */
function buildPasswordFrame(password) {
  return buildFrame(0x01, 0x03, stringToBytes(password))
}

/** 发送连接 AP 指令（控制帧, subtype=0x03） */
function buildConnectFrame() {
  return buildFrame(0x00, 0x03, [])
}

/** 发送查询 WiFi 状态（控制帧, subtype=0x05） */
function buildGetStatusFrame() {
  return buildFrame(0x00, 0x05, [])
}

/**
 * 解析 ESP32 回复帧
 * @param {ArrayBuffer} buffer
 * @returns {{ type, subType, frameControl, sequence, data: Uint8Array }}
 */
function parseFrame(buffer) {
  const u8a = new Uint8Array(buffer)
  const typeByte = u8a[0]
  const type = typeByte & 0x03
  const subType = (typeByte >> 2) & 0x3f
  const frameControl = u8a[1]
  const sequence = u8a[2]
  const length = u8a[3]
  const data = u8a.slice(4, 4 + length)

  return { type, subType, frameControl, sequence, data }
}

/**
 * 判断回复帧是否为 WiFi 连接状态报告
 * Data Frame subtype=0x0F: WiFi connection state report
 * data[0]: opmode, data[1]: sta conn state (0=connected)
 */
function isWifiStatusReport(parsed) {
  return parsed.type === 0x01 && parsed.subType === 0x0f
}

module.exports = {
  resetSequence,
  stringToBytes,
  bytesToString,
  buildFrame,
  buildSsidFrame,
  buildPasswordFrame,
  buildConnectFrame,
  buildGetStatusFrame,
  parseFrame,
  isWifiStatusReport
}
