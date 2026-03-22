---
name: recover_ifree_server API 接口文档
description: 小程序后端 recover_ifree_server 的所有 HTTP REST 接口、WebSocket 协议和认证机制，供前端开发参考
type: project
---

# recover_ifree_server 后端 API 接口文档

**技术栈：** Python + aiohttp（HTTP）+ websockets（WS）+ asyncio

**服务端口：**
- WebSocket 服务：`ws://<server_ip>:8000/xiaozhi/v1/`
- HTTP 服务：`http://<server_ip>:8003`

---

## 一、HTTP REST 接口

### GET `/xiaozhi/ota/`
健康检查，返回 WebSocket 地址信息（纯文本）。无认证要求。

### POST `/xiaozhi/ota/`
设备启动时调用，获取 WebSocket 地址和认证 Token。

**请求 Headers：**
- `device-id`（必须）：设备 MAC 地址，如 `AA:BB:CC:DD:EE:FF`
- `client-id`（必须）：客户端唯一 ID

**请求 Body（JSON）：**
```json
{
  "application": { "version": "1.0.0" },
  "device": { "model": "esp32-s3" }
}
```

**响应 Body（JSON）：**
```json
{
  "server_time": {
    "timestamp": 1742000000000,
    "timezone_offset": 480
  },
  "firmware": {
    "version": "1.0.0",
    "url": ""
  },
  "websocket": {
    "url": "ws://192.168.1.100:8000/xiaozhi/v1/",
    "token": "xxxxxx.xxxxxxxxx"
  }
}
```
> `websocket.token` 用于后续 WS 连接认证（仅开启认证时有值）

**错误响应：**
```json
{ "success": false, "message": "request error." }
```

---

### GET `/mcp/vision/explain`
健康检查，返回视觉分析接口信息（纯文本）。

### POST `/mcp/vision/explain`
图片分析接口，调用视觉语言模型分析图片。

**认证：** `Authorization: Bearer <JWT_Token>`（设备通过 MCP 初始化消息获得 Token）

**请求 Headers：**
- `Authorization`（必须）：`Bearer <JWT_Token>`
- `Device-Id`（必须）：设备 MAC 地址（须与 Token 匹配）

**请求 Body（multipart/form-data）：**
- `question`（text，必须）：问题文本
- `image`（file，必须）：图片文件，支持 JPEG/PNG/GIF/BMP/TIFF/WEBP，最大 5MB

**响应 Body（JSON）：**
```json
// 成功
{ "success": true, "action": "RESPONSE", "response": "图片分析结果文本" }

// 失败（HTTP 401）
{ "success": false, "message": "无效的认证token或token已过期" }

// 其他错误
{ "success": false, "message": "错误描述" }
```

**CORS：** 所有接口均支持，`Access-Control-Allow-Origin: *`

---

## 二、WebSocket 接口

### 连接地址
```
ws://<server_ip>:8000/xiaozhi/v1/
```

### 连接认证 Headers
| Header | 必须 | 说明 |
|--------|------|------|
| `device-id` | 是 | 设备 MAC，如 `AA:BB:CC:DD:EE:FF` |
| `client-id` | 否 | 客户端 ID |
| `authorization` | 条件必须 | `Bearer <token>`（开启认证时必须，token 来自 OTA 接口） |

也可通过 URL Query 参数传递（兼容不支持自定义 Header 的客户端）：
```
ws://x.x.x.x:8000/xiaozhi/v1/?device-id=AA:BB:CC:DD:EE:FF&client-id=xxx&authorization=Bearer_xxx
```

---

### 客户端 → 服务端消息

#### `hello` — 握手初始化
```json
{
  "type": "hello",
  "audio_params": {
    "format": "opus",
    "sample_rate": 16000,
    "channels": 1,
    "frame_duration": 60
  },
  "features": { "mcp": true }
}
```
> `features.mcp=true` 时服务端会推送 MCP 初始化消息

#### `abort` — 打断 TTS 播放
```json
{ "type": "abort" }
```

#### `listen` — 语音监听控制
```json
{
  "type": "listen",
  "state": "start | stop | detect",
  "mode": "auto | manual",
  "text": "识别文本（仅 state=detect 时）"
}
```
| state | 含义 |
|-------|------|
| `start` | 用户开始说话，开始接收音频 |
| `stop` | 用户停止说话，触发 ASR 识别 |
| `detect` | 直接提交文本（客户端自带 ASR），跳过服务端 ASR |

| mode | 含义 |
|------|------|
| `auto` | 用户说话时自动打断 TTS |
| `manual` | 不自动打断 |

#### `iot` — IoT 设备能力注册/状态上报
```json
// 能力注册
{
  "type": "iot",
  "descriptors": [{
    "name": "Speaker",
    "description": "设备扬声器",
    "properties": { "volume": { "description": "音量0-100", "type": "number", "value": 70 } },
    "methods": { "SetVolume": { "description": "设置音量", "parameters": { "volume": { "description": "目标音量", "type": "number" } } } }
  }]
}

// 状态上报
{
  "type": "iot",
  "states": [{ "name": "Speaker", "state": { "volume": 85 } }]
}
```

#### `mcp` — MCP 协议（JSON-RPC 2.0）
```json
{
  "type": "mcp",
  "payload": {
    "jsonrpc": "2.0",
    "id": 1,
    "result": { "tools": [...] }
  }
}
```

#### `server` — 管理控制（需要 secret 验证）
```json
{
  "type": "server",
  "action": "update_config | restart | call_device_tool | set_temp_prompt | restore_prompt | start_video_chat",
  "content": {
    "secret": "your_secret",
    "device_id": "AA:BB:CC:DD:EE:FF",
    ...
  }
}
```

**`call_device_tool`：**
```json
{ "content": { "secret": "...", "device_id": "...", "tool_name": "SetVolume", "arguments": {"volume": 80}, "timeout": 30 } }
```

**`set_temp_prompt`：**
```json
{ "content": { "secret": "...", "device_id": "...", "prompt": "系统提示词", "max_rounds": 5 } }
```

**`start_video_chat`：**
```json
{ "content": { "secret": "...", "device_id": "...", "prompt": "提示词", "greeting": "招呼语", "max_rounds": 10 } }
```

#### 二进制音频数据
原始 Opus 编码音频流（16kHz，单声道，60ms 帧）。

---

### 服务端 → 客户端消息

#### `hello` — 握手成功（连接后立即推送）
```json
{
  "type": "hello",
  "version": 1,
  "transport": "websocket",
  "session_id": "uuid-xxxx",
  "audio_params": { "format": "opus", "sample_rate": 16000, "channels": 1, "frame_duration": 60 }
}
```

#### `stt` — 语音识别结果
```json
{ "type": "stt", "text": "用户说的内容", "session_id": "uuid-xxxx" }
```

#### `tts` — TTS 状态
```json
{
  "type": "tts",
  "state": "start | sentence_start | stop",
  "session_id": "uuid-xxxx",
  "text": "当前播放句子（仅 sentence_start 时有）"
}
```

#### `mcp` — MCP 初始化（当客户端声明支持 MCP 时）
```json
{
  "type": "mcp",
  "payload": {
    "jsonrpc": "2.0", "id": 1, "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "vision": {
        "url": "http://x.x.x.x:8003/mcp/vision/explain",
        "token": "<JWT_token>"
      }
    }
  }
}
```

#### `server` — 服务端控制响应
```json
{
  "type": "server",
  "status": "success | error",
  "message": "操作结果",
  "content": { "action": "...", "device_id": "...", "result": {} }
}
```

#### 二进制 Opus 音频包（TTS 合成结果）

---

## 三、完整连接流程

```
1. 设备上电 → POST /xiaozhi/ota/ → 获取 WS 地址和 token
2. 建立 WebSocket 连接（携带 device-id, authorization 等）
3. 服务端推送 hello（含 session_id）
4. 设备发送 hello（含 audio_params、features）
5. 若 features.mcp=true，服务端推送 MCP initialize（含 vision.token）
6. 设备回复 MCP 工具列表
7. 设备发送 iot descriptors（注册 IoT 能力）
8. 进入语音对话：设备发送 Opus 音频 → 服务端 ASR/LLM/TTS → 服务端推送 stt/tts/Opus 音频
```

---

## 四、认证机制

### WebSocket Token（HMAC-SHA256）
- 由 OTA POST 接口返回的 `websocket.token` 字段
- 格式：`{base64url(HMAC-SHA256(client_id|device_id|timestamp))}.{timestamp}`
- 使用：WebSocket 连接请求 Header `Authorization: Bearer <token>`

### Vision API Token（JWT+AES-GCM）
- 由 MCP 初始化消息的 `vision.token` 字段下发给设备
- 有效期 1 小时
- 使用：POST `/mcp/vision/explain` 请求 Header `Authorization: Bearer <token>`

**Why:** 前端小程序开发需了解后端接口格式，避免重复翻阅源码。
**How to apply:** 开发前端时直接参考此文档构造请求格式和处理响应。
