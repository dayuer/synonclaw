# OpenClaw RPC 接口：多 Agent 调用与设置指南

OpenClaw Gateway 暴露了两套程序化接口：**WebSocket RPC** 和 **HTTP API**。所有 CLI 命令底层都是通过 WebSocket RPC 与 Gateway 通信。

---

## 一、接口总览

| 接口类型 | 地址 | 认证方式 | 适用场景 |
|----------|------|----------|----------|
| WebSocket RPC | `ws://127.0.0.1:18789` | Token (握手阶段) | 全功能控制，实时双向通信 |
| HTTP API | `http://127.0.0.1:18789/v1/*` | Bearer Token | RESTful 调用，OpenAI 兼容 |
| ACP (Agent Control Protocol) | stdio / WebSocket | Token | IDE/外部工具集成 |

---

## 二、WebSocket RPC 方法

通过 `openclaw gateway call <method>` 调用。实测可用方法：

### 系统级

```bash
# 健康检查
openclaw gateway call health --params '{}'

# Gateway 运行状态（版本、渠道、连接）
openclaw gateway call status --params '{}'

# 模型列表
openclaw gateway call models.list --params '{}'

# 渠道状态
openclaw gateway call channels.status --params '{}'
```

### 配置管理（Config RPC）

```bash
# 读取完整配置（含 hash 用于后续写入）
openclaw gateway call config.get --params '{}'

# 全量替换配置
openclaw gateway call config.apply --params '{
  "raw": "{ agents: { defaults: { workspace: \"~/.openclaw/workspace\" } } }",
  "baseHash": "<从 config.get 获取的 hash>",
  "sessionKey": "agent:main:whatsapp:direct:+85293791346"
}'

# 增量修改配置（推荐）
openclaw gateway call config.patch --params '{
  "raw": "{ channels: { telegram: { groups: { \"*\": { requireMention: false } } } } }",
  "baseHash": "<hash>"
}'
```

> **关键点**：`config.patch` 支持递归合并，`null` 可删除键，数组直接替换。修改后 Gateway 自动热重载或重启。

### 会话管理

```bash
# 列出所有会话
openclaw gateway call sessions.list --params '{}'
```

---

## 三、HTTP API 端点

| 端点 | 方法 | 用途 |
|------|------|------|
| `/status` | GET | 健康检查 |
| `/v1/agent/run` | POST | 执行一次 agent 推理 |
| `/v1/sessions/*` | GET/POST | 会话管理 |
| `/v1/channels/*` | GET/POST | 渠道管理 |
| `/v1/chat/completions` | POST | OpenAI 兼容聊天接口 |
| `/v1/models` | GET | 模型列表 |
| `/v1/browser/*` | POST | 浏览器控制 |

所有请求需在 Header 中携带 Token：

```bash
curl -H "Authorization: Bearer <gateway-token>" \
     http://127.0.0.1:18789/v1/models
```

---

## 四、多 Agent 设置（通过 RPC）

### 4.1 创建 Agent

**CLI 方式（推荐初始创建）：**

```bash
openclaw agents add home --workspace ~/.openclaw/workspace-home
openclaw agents add work --workspace ~/.openclaw/workspace-work
openclaw agents add ops  --workspace ~/.openclaw/workspace-ops
```

**RPC 方式（程序化动态创建）：通过 `config.patch` 注入 agent 定义**

```bash
# 1. 获取当前配置 hash
openclaw gateway call config.get --params '{}' --json | jq '.payload.hash'

# 2. 通过 patch 添加新 agent
openclaw gateway call config.patch --params '{
  "raw": "{
    agents: {
      list: [
        {
          id: \"research\",
          workspace: \"~/.openclaw/workspace-research\",
          agentDir: \"~/.openclaw/agents/research/agent\",
          tools: { profile: \"messaging\" }
        }
      ]
    }
  }",
  "baseHash": "<hash>"
}'
```

### 4.2 设置路由绑定

```bash
# CLI 方式
openclaw agents bind home --channel whatsapp --account personal
openclaw agents bind work --channel whatsapp --account biz

# 或通过 config.patch
openclaw gateway call config.patch --params '{
  "raw": "{
    bindings: [
      { agentId: \"home\", match: { channel: \"whatsapp\", accountId: \"personal\" } },
      { agentId: \"work\", match: { channel: \"whatsapp\", accountId: \"biz\" } }
    ]
  }",
  "baseHash": "<hash>"
}'
```

### 4.3 子 Agent 并发（subagents 配置）

```bash
openclaw gateway call config.patch --params '{
  "raw": "{
    agents: {
      defaults: {
        subagents: {
          maxSpawnDepth: 2,
          maxChildrenPerAgent: 5,
          maxConcurrent: 8,
          runTimeoutSeconds: 900,
          archiveAfterMinutes: 60
        }
      }
    }
  }",
  "baseHash": "<hash>"
}'
```

---

## 五、Agent 间通信（会话工具）

> ⚠️ `sessions_send` 和 `sessions_spawn` **不是 Gateway RPC 方法**，而是 **agent 会话内的工具（tools）**——由 LLM 在对话中调用。

| 工具 | 用途 | 调用者 |
|------|------|--------|
| `sessions_list` | 列出会话 | Agent（LLM 决策） |
| `sessions_history` | 查看会话历史 | Agent |
| `sessions_send` | 向另一个 session 发送消息，触发目标 agent 处理 | Agent |
| `sessions_spawn` | 拉起子 agent 并行任务，完成后结果通知回发起方 | Agent |

**外部程序化触发 agent 推理：**

```bash
# 方式 1：通过 CLI
openclaw agent --message "请分析今天的日志" --to +85293791346 --deliver

# 方式 2：通过 HTTP API
curl -X POST http://127.0.0.1:18789/v1/agent/run \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "请分析今天的日志",
    "sessionKey": "agent:main:whatsapp:direct:+85293791346"
  }'

# 方式 3：通过 OpenAI 兼容接口
curl -X POST http://127.0.0.1:18789/v1/chat/completions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 六、ACP（Agent Control Protocol）

ACP 是 OpenClaw 为 IDE 和外部工具提供的标准化接口：

```bash
# 启动 ACP 桥接
openclaw acp --session agent:main:main

# 交互式 ACP 客户端
openclaw acp client
```

ACP 支持指定 session、agent、provenance 模式，适合将 OpenClaw agent 能力嵌入到其他工具链中。

---

## 七、当前实例的配置快照

你的 Mac mini M1 (`fnOS@192.168.10.5`) 当前配置：

```json5
{
  agents: { defaults: { model: { primary: "custom-api-deepseek-com/deepseek-chat" } } },
  channels: { whatsapp: { enabled: true, dmPolicy: "pairing", groupPolicy: "disabled" } },
  gateway: { port: 18789, mode: "local", bind: "loopback", auth: { mode: "token" } },
  tools: { profile: "coding" },
  session: { dmScope: "per-channel-peer" }
}
```

---

## 八、实用脚本示例

### 批量创建多 agent 架构

```bash
#!/bin/bash
# 创建四角架构：router / research / builder / ops
for agent in router research builder ops; do
  openclaw agents add "$agent" \
    --workspace "~/.openclaw/workspace-$agent" \
    --non-interactive
done

# 设置 router 为默认
openclaw config set agents.defaults.defaultAgent router
```

### 通过 cURL 监控 Gateway 状态

```bash
# 持续监控（每 30 秒）
while true; do
  curl -s -H "Authorization: Bearer <token>" \
    http://127.0.0.1:18789/status | jq '.ok'
  sleep 30
done
```
