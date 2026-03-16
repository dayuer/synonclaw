# 业务场景拆解 — GNB 多租户 Passcode 网络隔离策略

> **需求来源**: team/requirements.md
> **拆解日期**: 2026-03-16
> **业务经理**: BA

---

## 领域术语表

| 术语 | 定义 | 数据实体 |
|------|------|----------|
| **Passcode** | GNB 网络的共享密钥，32 位十六进制字符串（8 字符），相同 Passcode 的节点组成同一虚拟网络 | `gnb_networks.passcode` |
| **VIP** | Virtual IP，GNB 虚拟局域网内分配给每个节点的 IP 地址（如 `10.1.0.10`） | `devices.vip` |
| **Node ID** | GNB 节点唯一标识，`uint32` 范围 `2001~9999`（设备端），`1001~1099`（SaaS 端） | `devices.gnb_node_id` |
| **Tier** | 租户等级。Tier 1 = 共享网络 + iptables 隔离；Tier 2 = 独立 Passcode + 独立网段 | `tenants.tier` |
| **Index 节点** | GNB 信令服务器，帮助节点互相发现和 NAT 穿透，不转发业务数据 | 部署配置 |
| **GNB 网络** | 由相同 Passcode 组成的虚拟 L3 网络，内部节点可通过 VIP 互通 | `gnb_networks` |
| **socat 桥接** | 将 GNB VIP 上的请求透明转发到本地 `127.0.0.1`，解决 OpenClaw 只监听 loopback 的限制 | 系统服务 |
| **provision** | 设备首次通电时的自动注册和配置过程 | 脚本 `provision.sh` |
| **心跳** | 设备定期向 SaaS 上报在线状态，同时拉取积压指令 | `devices.last_seen` |

---

## 业务链路图

### 主链路 1: 设备注册 (Happy Path)

```
设备通电 → 运行 provision.sh → HTTPS POST /api/devices/register {serial_no, hw_fingerprint}
→ SaaS 查 serial_no 对应租户 → 判定 Tier
→ [Tier 1] 返回 {passcode: SHARED, vip: 10.1.0.x, node_id: 200x, index: "gnb-index-cn.synonclaw.com:9001"}
   [Tier 2] 返回 {passcode: TENANT_X, vip: 10.{tid}.0.x, node_id: 200x, index: ...}
→ 设备写入 GNB 配置 → 启动 GNB 服务 → 启动 socat 桥接 → 配置 iptables
→ GNB 向 Index 注册 → 与 SaaS 节点建立 P2P 链路
→ 心跳 GET /heartbeat 成功 → 设备标记 ONLINE
```

### 主链路 2: SaaS 远程管理设备 (Happy Path)

```
管理员在 SaaS 网页修改 Agent 配置
→ SaaS API 写入 DB (command status: PENDING) → 入队 Redis Stream
→ Dispatch Worker 消费 → 查设备 VIP → POST http://10.x.x.x:18789/v1/config.patch
→ socat 桥接 → OpenClaw Gateway → 200 OK
→ Worker 更新 DB: status = DELIVERED
```

### 主链路 3: 租户升级 Tier 1 → Tier 2 (Happy Path)

```
管理员调用 PUT /api/tenants/{id}/upgrade
→ 生成独立 Passcode + 分配网段 10.{tid}.0.0/16
→ 启动 Docker GNB 容器 (SaaS 端)
→ 遍历该租户所有设备 → 逐台下发新配置 {new_passcode, new_vip, new_node_id}
→ 设备重启 GNB → 加入新网络 → 心跳到达 → 标记迁移完成
→ 回收旧 VIP 和 Node ID → 更新租户 Tier = 2
```

### 异常链路 A: 设备离线时接收指令

```
Worker 推送 POST → 超时/连接拒绝
→ DB: status = RETRY, retry_count++ → 重新入队 (指数退避 30s→60s→120s→300s)
→ 设备恢复在线 → 心跳触发 SaaS 检查 PENDING 指令 → 入队 → Worker 重试 → 成功
→ 超过 48 次 (~24h) → status = FAILED → 告警
```

### 异常链路 B: 设备注册 — serial_no 未绑定租户

```
POST /api/devices/register {serial_no: "UNKNOWN"}
→ SaaS 查不到对应租户 → 返回 403 {error: "DEVICE_NOT_BOUND"}
→ 设备 provision.sh 写入 ERROR.log → 定时重试 (5min)
```

### 异常链路 C: VIP/Node ID 池耗尽

```
设备注册 → 分配 VIP → VIP 池 (10.1.0.10~10.1.255.254) 已满
→ 返回 503 {error: "VIP_POOL_EXHAUSTED"} → 告警运维
```

---

## 场景矩阵

### 场景 1: 设备注册与网络分配

| # | 前置条件 | 用户动作 | 预期结果 | 边界/备注 | 优先级 |
|---|----------|----------|----------|-----------|--------|
| 1.1 | serial_no 已绑定 Tier 1 租户 | POST /register | 返回共享 Passcode + VIP (10.1.0.x) + node_id | Happy Path | P0 |
| 1.2 | serial_no 已绑定 Tier 2 租户 | POST /register | 返回独立 Passcode + VIP (10.{tid}.0.x) + node_id | Happy Path | P0 |
| 1.3 | serial_no 未绑定任何租户 | POST /register | 返回 403 DEVICE_NOT_BOUND | 异常 | P0 |
| 1.4 | 同一 serial_no 重复注册（幂等） | POST /register ×2 | 返回相同配置，不重复分配 | 幂等性 | P0 |
| 1.5 | Tier 1 VIP 池已满 (65024 个 IP 已分配) | POST /register | 返回 503 VIP_POOL_EXHAUSTED | 边界 | P1 |
| 1.6 | Node ID 池已满 (2001~9999 共 7999 个) | POST /register | 返回 503 NODE_ID_EXHAUSTED | 边界 | P1 |
| 1.7 | 并发：2 台设备同时注册同一租户 | POST /register ×2 并发 | VIP 和 Node ID 不冲突 | 并发安全 | P0 |
| 1.8 | 请求缺少 serial_no 字段 | POST /register {} | 返回 400 INVALID_REQUEST | 参数校验 | P1 |

### 场景 2: Tier 分级与网络隔离

| # | 前置条件 | 用户动作 | 预期结果 | 边界/备注 | 优先级 |
|---|----------|----------|----------|-----------|--------|
| 2.1 | 2 台 Tier 1 设备分属不同租户 | 设备 A ping 设备 B VIP | iptables 丢包，连接失败 | 核心隔离验证 | P0 |
| 2.2 | Tier 1 设备 A | 设备 A ping SaaS VIP (10.1.0.1) | 成功 | 白名单通过 | P0 |
| 2.3 | Tier 2 租户 C 的设备 | SaaS 发请求到设备 VIP | 通过独立网络送达 | 独立 Passcode 隔离 | P0 |
| 2.4 | Tier 2 租户 C 和 D | 租户 C 设备尝试访问租户 D 网段 | 不可达 (不同 Passcode) | 彻底隔离 | P0 |

### 场景 3: SaaS 远程管理

| # | 前置条件 | 用户动作 | 预期结果 | 边界/备注 | 优先级 |
|---|----------|----------|----------|-----------|--------|
| 3.1 | 设备在线 | POST config.patch | 200 OK，配置生效 | Happy Path | P0 |
| 3.2 | 设备离线 | POST config.patch | 入队 PENDING → 设备上线后补发 | 最终一致性 | P0 |
| 3.3 | 设备离线超 24h | Worker 重试 48 次 | status = FAILED + 告警 | 超时处理 | P1 |
| 3.4 | 同一设备多条指令积压 | 设备上线 | 按时间顺序依次执行 | 顺序保证 | P1 |

### 场景 4: 租户 Tier 升级迁移

| # | 前置条件 | 用户动作 | 预期结果 | 边界/备注 | 优先级 |
|---|----------|----------|----------|-----------|--------|
| 4.1 | Tier 1 租户有 3 台设备 | PUT /tenants/{id}/upgrade | 生成独立网络 → 3 台设备全部迁移 | Happy Path | P0 |
| 4.2 | 迁移过程中 1 台设备离线 | 触发升级 | 在线设备立即迁移，离线设备标记 PENDING_MIGRATION，上线后自动完成 | 部分在线 | P0 |
| 4.3 | 已经是 Tier 2 的租户 | PUT /upgrade | 返回 409 ALREADY_TIER_2 | 幂等 | P1 |
| 4.4 | 迁移过程中新设备注册 | POST /register | 使用新的 Tier 2 配置 | 并发安全 | P1 |

### 场景 5: GNB 容器生命周期 (Tier 2)

| # | 前置条件 | 用户动作 | 预期结果 | 边界/备注 | 优先级 |
|---|----------|----------|----------|-----------|--------|
| 5.1 | 创建 Tier 2 租户 | 自动触发 | Docker 启动 GNB 容器 + TUN 设备正常 | Happy Path | P0 |
| 5.2 | 容器异常退出 | Docker 监控 | 自动重启 (restart: always) + 告警 | 容错 | P1 |
| 5.3 | 租户删除 | DELETE /tenants/{id} | 停止+删除容器 → 回收 Passcode + 网段 | 资源回收 | P1 |

---

## 边界条件清单

| # | 条件 | 预期行为 | 优先级 |
|---|------|----------|--------|
| B1 | **并发注册**：多台设备同时 POST /register | VIP + Node ID 分配原子性，无冲突 | P0 |
| B2 | **Passcode 冲突**：随机生成的 Passcode 与已有网络重复 | 重试生成直到唯一（概率 < 1/4.2B） | P1 |
| B3 | **Tier 1 网段耗尽**：10.1.0.10~10.1.255.254 (65024 IP 全满) | 拒绝注册 + 告警运维扩段 | P1 |
| B4 | **设备反复上下线**：1 分钟内重连 10 次 | 心跳去抖 (60s 内不重复触发补发) | P1 |
| B5 | **SaaS 端 GNB 容器启动失败**：端口/TUN 冲突 | 标记租户 DEGRADED + 告警 + 阻止设备注册 | P0 |
| B6 | **设备 provision 期间断网** | 脚本重试 3 次 → 写入 ERROR.log → cron 5min 重试 | P1 |
| B7 | **指令队列 Redis 宕机** | 降级：配置直写 DB，Worker 定时扫 DB 兜底 | P2 |
| B8 | **Tier 升级回滚**：迁移失败需要回退到 Tier 1 | 保留旧配置快照，支持回滚 | P2 |

---

## 需求覆盖映射

| AC 编号 | AC 内容 | 覆盖场景 | 状态 |
|---------|---------|----------|------|
| AC-1 | Tier 1 注册返回共享 Passcode + VIP + node_id | 1.1, 1.4, 1.7 | ✅ 已覆盖 |
| AC-2 | Tier 2 创建独立 Passcode + 网段 + 容器 | 1.2, 5.1 | ✅ 已覆盖 |
| AC-3 | Tier 1 设备间 iptables 隔离 | 2.1, 2.2 | ✅ 已覆盖 |
| AC-4 | 设备 provision 全自动注册+启动 | 1.1, 1.2 + 主链路 1 | ✅ 已覆盖 |
| AC-5 | Tier 1→2 在线迁移 | 4.1, 4.2, 4.3, 4.4 | ✅ 已覆盖 |
| AC-6 | GNB VIP 访问 OpenClaw API | 3.1 + 主链路 2 | ✅ 已覆盖 |
| AC-7 | 离线重连后指令补发 | 3.2, 3.3, 3.4 + 异常链路 A | ✅ 已覆盖 |

---

## 技术风险清单 (L 级 Spike 建议)

| # | 风险领域 | 调研范围 | 时间盒 |
|---|----------|----------|--------|
| R1 | **GNB 多实例共存** | SaaS 单服务器运行 N 个 GNB 进程（不同 Passcode），验证 TUN 设备命名冲突和路由表冲突 | 2h |
| R2 | **macOS TUN 权限** | Mac mini 边缘设备上 GNB 需 root/sudo 创建 TUN，验证无交互方式和 launchd 集成 | 1h |
| R3 | **ISP UDP 打洞** | 典型企业 NAT 环境下打洞成功率测试，验证 TCP Forward 备选方案 | 1h |

---

## Alpha TDD 建议

1. **`describe('PasscodeManager')`**: 覆盖场景 1.1-1.8 + B1-B3
   - `it('为 Tier 1 分配共享 Passcode + 唯一 VIP')` → 1.1
   - `it('为 Tier 2 生成独立 Passcode + 独立网段')` → 1.2
   - `it('未绑定设备返回 403')` → 1.3
   - `it('重复注册幂等返回相同配置')` → 1.4
   - `it('并发注册不冲突')` → 1.7, B1

2. **`describe('TierEngine')`**: 覆盖场景 2.1-2.4 + 4.1-4.4
   - `it('Tier 判定基于设备数和付费状态')` → 2.x
   - `it('Tier 升级生成独立网络并迁移设备')` → 4.1
   - `it('离线设备升级后上线自动迁移')` → 4.2

3. **`describe('GnbContainerManager')`**: 覆盖场景 5.1-5.3
   - `it('创建 Tier 2 租户时启动容器')` → 5.1
   - `it('租户删除时清理容器')` → 5.3

4. **`describe('CommandDispatcher')`**: 覆盖场景 3.1-3.4 + B4, B7
   - `it('在线设备直接推送成功')` → 3.1
   - `it('离线设备入队重试')` → 3.2
   - `it('超时标记 FAILED')` → 3.3

5. **`describe('DeviceProvisioning')`**: 覆盖场景 1.1-1.2 端到端 + B6
   - `it('provision.sh 完整流程')` → 集成测试
