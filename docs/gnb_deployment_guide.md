# GNB 部署配置指南 — SynonClaw 多租户 P2P 网络

## 目录

1. [架构总览](#1-架构总览)
2. [环境准备](#2-环境准备)
3. [Index 节点部署（云服务器）](#3-index-节点部署云服务器)
4. [客户端节点部署（云服务器）](#4-客户端节点部署云服务器)
5. [客户端节点部署（macOS 边缘设备）](#5-客户端节点部署macos-边缘设备)
6. [P2P 连通性验证](#6-p2p-连通性验证)
7. [OpenClaw Gateway 远程访问](#7-openclaw-gateway-远程访问)
8. [常见问题与排障](#8-常见问题与排障)
9. [生产环境清单](#9-生产环境清单)

---

## 1. 架构总览

```
                         ┌───────────────────────────┐
                         │     GNB Index 节点         │
                         │     UDP 9001               │
                         │     作用：节点发现 + NAT 穿透│
                         └─────────────┬─────────────┘
                                       │ 信令
                 ┌─────────────┬───────┴───────┬─────────────┐
                 │             │               │             │
        ┌────────┴────────┐   │    ┌──────────┴─────────┐   │
        │  中控台服务器     │   │    │  VPS-A (租户 A)     │   │
        │  Node: 1002      │   │    │  Node: 1001         │   │
        │  VIP: 10.1.0.2   │◄═╪═══►│  VIP: 10.1.0.1      │   │
        │  Port: 9002      │   │    │  OpenClaw :18789     │   │
        └──────────────────┘   │    │  Bridge :18790       │   │
               ▲ ▲             │    └──────────────────────┘   │
               ║ ║             │                               │
               ║ ║    ┌────────┴───────────┐  ┌───────────────┴────────┐
               ║ ║    │  VPS-B (租户 B)     │  │  VPS-C (租户 C)        │
               ║ ║    │  Node: 1003         │  │  Node: 1004            │
               ║ ╚═══►│  VIP: 10.1.0.3      │  │  VIP: 10.1.0.4         │
               ╚═════►│  OpenClaw :18789     │  │  OpenClaw :18789        │
                      │  Bridge :18790       │  │  Bridge :18790          │
                      └──────────────────────┘  └────────────────────────┘

         ═══  GNB P2P 隧道（ED25519 端到端加密，Safe Mode 非对称密钥认证）
```

**关键概念**：

- **Index 节点**：只做信令转发（类似 BT Tracker），不传输业务数据，极轻量
- **Safe Mode**：每个节点拥有 ED25519 密钥对，通过非对称加密交换通信密钥，安全性远高于 Lite 模式的 Passcode
- **VIP**：虚拟 IP 地址，GNB 节点间通过 VIP 互相访问
- **P2P**：节点间通过 NAT 穿透直连，Index 节点不中转数据
- **配置目录**：每个节点有独立配置目录 `conf/$nodeid/`，包含 `node.conf`、`address.conf`、`route.conf`、`security/`（本节点密钥）、`ed25519/`（对端公钥）

> [!TIP]
> **性能优化：关闭节点探测 worker**  
> GNB 默认启动节点探测 worker（`--node-detect-worker=on`），周期性向对端发送探测包以维护 NAT 映射和地址发现。
> 如果两端节点**均有公网 IP**（无需 NAT 穿透），可以通过 `--node-detect-worker=off` 关闭此 worker，减少不必要的 CPU 和带宽消耗。
> **仅在需要穿越 NAT 时才保留（默认开启）。**
>
> GNB 可配置的 worker 线程一览（来源：`gnb --help`）：
>
> | 参数 | 默认 | 说明 |
> |------|------|------|
> | `--node-detect-worker` | `on` | **节点地址探测**，NAT 穿透核心，公网直连时可关闭 |
> | `--index-worker` | `on` | 向 Index 节点注册/更新地址，保持可被发现 |
> | `--index-service-worker` | `on` | Index 服务处理（仅 `-P` 模式相关） |
> | `--pf-worker` | `0` | 数据包过滤 worker 数量，默认不额外启用 |

---

## 2. 环境准备

### 2.1 源码编译 GNB

GNB 官方仅提供源码，需自行编译。

```bash
# 所有平台通用步骤
git clone https://github.com/opengnb/opengnb.git
cd opengnb
make -f Makefile.linux install    # Linux
make -f Makefile.Darwin install   # macOS
```

> [!IMPORTANT]
> **版本选择**：使用 `1.6.0.d` 或更新版本，旧版可能不支持 `--multi-socket` 参数。

### 2.2 各节点规划

| 角色 | 节点 ID | VIP | 端口 | 所在机器 |
|------|---------|-----|------|----------|
| Index | — | — | UDP 9001 | 云服务器 |
| SaaS 客户端 | 1002 | 10.1.0.2 | UDP 9002 | 云服务器（与 Index 同机） |
| 边缘设备 | 1001 | 10.1.0.1 | UDP 默认 | Mac mini |

### 2.3 密钥管理（Safe Mode）

Safe Mode 要求每个节点拥有 ED25519 密钥对，并交换公钥。

```bash
# 使用 gnb_crypto 生成密钥对
gnb_crypto -c -p 1001.private -k 1001.public
gnb_crypto -c -p 1002.private -k 1002.public
```

**目录结构**（以节点 1002 为例）：

```
/opt/gnb/conf/1002/
├── node.conf            # 节点配置
├── address.conf         # Index 地址列表
├── route.conf           # 路由表
├── security/
│   ├── 1002.private     # 本节点私钥（不可泄露！）
│   └── 1002.public      # 本节点公钥
├── ed25519/
│   └── 1001.public      # 对端节点公钥
└── scripts/             # 启动/关闭后钩子脚本
```

**公钥交换规则**：节点 A 的 `ed25519/` 目录必须包含**所有**需要通信的对端节点的 `.public` 文件。

---

## 3. Index 节点部署（云服务器）

### 3.1 安装

```bash
# 编译安装（假设已 clone 源码）
cd opengnb
make -f Makefile.linux install

# 验证
/usr/local/sbin/gnb --version
```

### 3.2 启动

```bash
# 前台调试
/usr/local/sbin/gnb -P \
  --listen=0.0.0.0:9001 \
  --console-log-level=3 \
  --index-service-log-level=3 \
  --address-secure=on

# 参数说明：
#   -P                     纯 Index 模式（不创建 TUN 设备）
#   --listen=0.0.0.0:9001  监听所有接口的 UDP 9001
#   --address-secure=on    启用地址安全校验
```

### 3.3 systemd 持久化

```ini
# /etc/systemd/system/gnb-index.service
[Unit]
Description=GNB Index Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/sbin/gnb -P \
  --listen=0.0.0.0:9001 \
  --console-log-level=3 \
  --index-service-log-level=3 \
  --log-file-path=/var/log/opengnb/index \
  --address-secure=on
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable gnb-index --now
sudo systemctl status gnb-index
```

### 3.4 防火墙

```bash
# 放行 UDP 9001
ufw allow 9001/udp    # 或
iptables -A INPUT -p udp --dport 9001 -j ACCEPT
```

### 3.5 DNS 配置

为 Index 节点配置专用域名（方便后续切换 IP）：

```
gnb-index-cn.synonclaw.com  →  43.156.128.95
```

---

## 4. 客户端节点部署（云服务器）

> [!IMPORTANT]
> **同机部署 Index + 客户端时**，必须避免 TUN 设备名和端口冲突。

### 4.1 启动客户端（Safe Mode）

```bash
/usr/local/sbin/gnb -c /opt/gnb/conf/1002 \
  -i gnb_tun_test \
  --crypto rc4 \
  --crypto-key-update-interval hour \
  --address-secure=on \
  --console-log-level=3 \
  -d

# 参数说明：
#   -c /opt/gnb/conf/1002             配置目录（包含 node.conf + 密钥）
#   -i gnb_tun_test                   TUN 设备名（避免与 Index 冲突）
#   --crypto rc4                      数据包加密算法（rc4 | xor | none）
#   --crypto-key-update-interval hour 密钥每小时自动轮换
#   --address-secure=on               日志中隐藏部分 IP 地址
#   -d                                后台运行
```

> [!NOTE]
> `node.conf` 中已配置 `nodeid 1002`、`listen 9002`、`multi-socket on` 等参数，无需在命令行重复指定。

### 4.2 systemd 持久化

```ini
# /etc/systemd/system/gnb-client.service
[Unit]
Description=GNB P2P Client Node (Safe Mode)
After=network-online.target gnb-index.service
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/sbin/gnb -c /opt/gnb/conf/1002 \
  -i gnb_tun_test \
  --crypto rc4 \
  --crypto-key-update-interval hour \
  --address-secure=on \
  --console-log-level=3 \
  --log-file-path=/var/log/opengnb/client
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable gnb-client --now
sudo systemctl status gnb-client
```

### 4.3 验证

```bash
# 检查 TUN 设备
ip addr show gnb_tun_test
# 应显示 inet 10.1.0.2

# 检查进程
ps aux | grep gnb
```

### 4.4 同机部署注意事项

| 问题 | 原因 | 解法 |
|------|------|------|
| TUN 设备冲突 | Index 和客户端默认都用 `gnb_tun` | 客户端使用 `-i gnb_tun_test` |
| 端口冲突 | 都默认用 UDP 9001 | `node.conf` 中设定 `listen 9002` |

---

## 5. 客户端节点部署（macOS 边缘设备）

### 5.1 编译

```bash
cd ~/gnb
git clone https://github.com/opengnb/opengnb.git .
make -f Makefile.Darwin
# 产出：~/gnb/gnb
```

### 5.2 部署配置文件

```bash
# 从云服务器拉取配置包
scp root@www.synonclaw.com:/tmp/gnb-conf-1001.tar.gz ~/gnb/
cd ~/gnb && tar xzf gnb-conf-1001.tar.gz
```

### 5.3 启动（Safe Mode）

```bash
sudo ~/gnb/gnb -c ~/gnb/conf/1001 \
  --crypto rc4 \
  --crypto-key-update-interval hour \
  --address-secure=on \
  -d
```

> [!WARNING]
> **macOS 必须 sudo**：创建 TUN 设备需要 root 权限。GNB 会自动创建 `utunN` 设备（macOS 不支持自定义 TUN 名称）。

### 5.3 验证

```bash
# 检查 TUN 接口
ifconfig | grep -A5 utun
# 找到 inet 10.1.0.1 的 utun 接口

# 确认 VIP
ifconfig utun4  # 具体编号因系统而异
```

### 5.4 macOS 特有问题

| 问题 | 原因 | 解法 |
|------|------|------|
| 需要 sudo | macOS TUN 设备需要 root | 始终用 `sudo` 启动 |
| utun 编号不固定 | macOS 动态分配 utun 设备号 | 启动后用 `ifconfig` 确认 |
| QX/Surge 代理干扰 | DNS 劫持到 198.18.x.x | **必须**在代理软件中配置 Index IP 走 DIRECT |
| QX 关闭后仍不通 | pf 规则残留 | `sudo pfctl -F all`  清理所有 pf 规则 |

> [!CAUTION]
> **代理软件（QX/Surge/Clash）是 GNB 最大的障碍**。如果启用了增强模式/TUN 模式，会劫持 UDP 流量导致 GNB 完全不通。  
> **解法**：在代理软件中为 Index 节点 IP 配置 DIRECT 规则，或关闭增强模式。

---

## 6. P2P 连通性验证

### 6.1 Ping 测试

```bash
# 从服务器(10.1.0.2) ping Mac mini(10.1.0.1)
ping -c 5 10.1.0.1

# 预期结果：
# 延迟 ~60-120ms（取决于物理网络）
# 丢包率 <30% 即视为正常（首包丢失正常，打洞需要时间）
```

### 6.2 TCP 端口测试

```bash
# 从服务器测试 Mac mini 的 OpenClaw 端口
curl -sv --max-time 5 http://10.1.0.1:18789/ 2>&1 | head -5
# 能收到 HTTP 响应（即使是 HTML）即表示 TCP 连通
```

### 6.3 预期指标

| 指标 | 正常范围 | 异常处理 |
|------|----------|----------|
| 延迟 | 60-200ms | >500ms 检查网络质量 |
| 丢包 | <30% | >50% 检查防火墙/NAT 类型 |
| 首次连接 | 5-10s | 正常（打洞需要时间） |

---

## 7. OpenClaw Gateway 远程访问

### 7.1 问题：OpenClaw HTTP API 不支持远程直接调用

OpenClaw Gateway 监听 `*:18789`，但：

- **GET 请求**（`/status`、`/v1/models` 等）返回的是 SPA 前端 HTML 页面
- **POST 请求**（`/v1/chat/completions`）返回 404
- **真正的 API 是 WebSocket RPC**，只能通过 `openclaw gateway call` 命令或 WebSocket 客户端调用

### 7.2 解决方案：Python TCP 桥接 + OpenClaw CLI

#### Step 1: 在边缘设备上启动 TCP 桥接

```bash
# 在 Mac mini 上创建桥接脚本
cat > /tmp/gnb_bridge.py << 'EOF'
import socket, threading

def pipe(src, dst):
    try:
        while True:
            data = src.recv(4096)
            if not data: break
            dst.sendall(data)
    except Exception: pass
    finally: src.close(); dst.close()

srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(("10.1.0.1", 18790))  # 绑定 GNB VIP
srv.listen(5)
print("Bridge: 10.1.0.1:18790 -> 127.0.0.1:18789", flush=True)
while True:
    c, _ = srv.accept()
    r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    r.connect(("127.0.0.1", 18789))
    threading.Thread(target=pipe, args=(c, r), daemon=True).start()
    threading.Thread(target=pipe, args=(r, c), daemon=True).start()
EOF

# 后台运行
python3 /tmp/gnb_bridge.py < /dev/null > /tmp/gnb_bridge.log 2>&1 &

# 验证
lsof -nP -iTCP:18790 -sTCP:LISTEN
```

> [!NOTE]
> 桥接的作用：将 GNB VIP 上收到的请求转发到 `127.0.0.1:18789`（OpenClaw Gateway 实际监听的地址），使 OpenClaw 认为请求来自 localhost。

#### Step 2: 首次连接 — 设备配对

```bash
# 从 SaaS 服务器发起首次 RPC 调用
OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1 \
openclaw gateway call health \
  --url ws://10.1.0.1:18790 \
  --token <OPENCLAW_TOKEN> \
  --json

# 首次会报错：pairing required
```

#### Step 3: 在边缘设备上批准配对

```bash
# 在 Mac mini 上查看待审批请求
openclaw devices list --json

# 批准配对（替换为实际的 requestId）
openclaw devices approve <requestId>
```

#### Step 4: 重试 RPC 调用

```bash
# 配对完成后，重新调用
OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1 \
openclaw gateway call health \
  --url ws://10.1.0.1:18790 \
  --token <OPENCLAW_TOKEN> \
  --json

# 应返回完整的 JSON 健康状态
```

### 7.3 已验证可用的 RPC 方法

| 方法 | 用途 | 示例返回 |
|------|------|----------|
| `health` | 健康检查 + 频道状态 | WhatsApp 链接状态、Agent 配置 |
| `status` | 完整运行状态 | 模型(deepseek-chat)、会话 token 统计 |

### 7.4 安全说明

| 层 | 机制 |
|----|------|
| 传输层 | GNB P2P 使用 ED25519 端到端加密 |
| 应用层 | OpenClaw Token 认证 + 设备配对 |
| 环境变量 | `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1` — 因为 GNB 内部已加密，ws:// 安全 |

---

## 8. 常见问题与排障

### 8.1 GNB 网络层

| 问题 | 症状 | 解法 |
|------|------|------|
| 完全不通 | ping VIP 无响应 | 检查 Passcode 一致、Index 节点在线、防火墙放行 UDP |
| 首包丢失 | 第一个 ping 超时 | 正常现象，NAT 打洞需要时间 |
| 高丢包 | >50% 丢包 | 检查 NAT 类型（对称 NAT 穿透困难），考虑 TCP Forward |
| TUN 设备不存在 | `ifconfig gnb_tun` 无输出 | 检查 GNB 是否以 root 运行，检查日志 |
| DNS 解析异常 | 解析到 198.18.x.x | 代理软件干扰，配置 DIRECT 规则或用 IP |

### 8.2 OpenClaw 访问层

| 问题 | 症状 | 解法 |
|------|------|------|
| 返回 HTML | GET 请求返回 SPA 页面 | 正常行为，使用 WebSocket RPC 调用 |
| SECURITY ERROR | 拒绝非 loopback ws:// | 设置 `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1` |
| pairing required | 首次连接被拒 | 在设备上 `openclaw devices approve` |
| 连接超时 | ws:// 连接失败 | 检查桥接脚本是否运行，ping VIP 是否通 |

### 8.3 调试命令速查

```bash
# GNB 进程状态
ps aux | grep gnb

# TUN 接口（Linux）
ip addr show gnb_tun_test

# TUN 接口（macOS）
ifconfig | grep -A5 utun

# 桥接状态
lsof -nP -iTCP:18790 -sTCP:LISTEN

# OpenClaw 监听状态
lsof -nP -iTCP:18789 -sTCP:LISTEN

# OpenClaw 配置
cat ~/.openclaw/openclaw.json | python3 -m json.tool | grep -A3 'gateway\|auth\|bind'

# OpenClaw Token
cat ~/.openclaw/openclaw.json | python3 -m json.tool | grep token
```

---

## 9. 生产环境清单

### 9.1 部署前检查

- [ ] Index 节点 systemd 服务 `gnb-index.service` 已 enable
- [ ] 云防火墙 / 安全组放行 UDP 9001
- [ ] DNS 记录 `gnb-index-cn.synonclaw.com` 指向 Index IP
- [ ] 所有节点使用相同 Passcode
- [ ] Mac mini 代理软件配置 Index IP 走 DIRECT

### 9.2 每台边缘设备部署

- [ ] 编译安装 GNB 二进制
- [ ] 分配唯一 Node ID 和 VIP
- [ ] 启动 GNB 并验证 TUN 接口
- [ ] 启动 Python TCP 桥接（或 socat）
- [ ] 从 SaaS 服务器 ping VIP 确认连通
- [ ] 首次 RPC 调用 + 设备配对 approve
- [ ] RPC health 验证成功

### 9.3 后续优化

- **桥接持久化**：将 Python 桥接脚本做成 `launchd`（macOS）或 `systemd`（Linux）服务
- **自动配对**：使用 OpenClaw bootstrap token 实现设备自动授权
- **socat 替代 Python 桥接**：安装 Homebrew 后 `brew install socat`
- **监控告警**：对 GNB TUN 接口状态和 RPC 健康检查结果配置告警

---

## 附录：当前环境参数速查

| 参数 | 值 |
|------|-----|
| Index 地址 | `43.156.128.95:9001` (`gnb-index-cn.synonclaw.com`) |
| GNB 版本 | `1.6.0.d` |
| **运行模式** | **Safe Mode（ED25519 非对称加密）** |
| **加密算法** | **RC4 + 密钥每小时自动轮换** |
| 服务器配置目录 | `/opt/gnb/conf/1002/` |
| 服务器 Node ID | `1002` |
| 服务器 VIP | `10.1.0.2` |
| 服务器 TUN 名 | `gnb_tun_test` |
| Mac mini 配置目录 | `~/gnb/conf/1001/` |
| Mac mini Node ID | `1001` |
| Mac mini VIP | `10.1.0.1` |
| Mac mini TUN 名 | `utun4`（动态分配） |
| OpenClaw 端口 | `18789` |
| 桥接端口 | `18790` |
| OpenClaw Token | `d894cf434dafd6729c3af327be6e48e3cc83137113b336f5` |
