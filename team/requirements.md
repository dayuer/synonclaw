# 需求：GNB 多租户 Passcode 网络隔离策略实现

## 背景

SynonClaw 从单机版向多租户 SaaS 转型，采用 GNB（OpenGNB）作为底层 P2P 通信通道。架构设计文档 `docs/openclaw_network_guide.md` 已定义了分级网络策略（Tier 1 共享网络 + Tier 2 独立网络）。当前需求聚焦于 **Passcode 网络隔离策略的代码落地**，即 SaaS 后台如何管理多租户的 GNB 网络生命周期。

**核心业务价值**：
- 零公网带宽成本（P2P 直连，无中心中转）
- 物理级端到端加密（ED25519 椭圆曲线）
- 租户间严格网络隔离（防止"串门"）

## 用户故事

**US-1**: 作为 SaaS 运维管理员，我希望系统能为每个新租户自动分配 GNB 网络配置（Passcode + 虚拟网段 + 节点 ID），以便设备通电即可安全接入。

**US-2**: 作为 SaaS 运维管理员，我希望 Tier 1 小租户共享一个 GNB 网络但彼此完全隔离，以便降低运维成本。

**US-3**: 作为 SaaS 运维管理员，我希望 Tier 2 大租户拥有完全独立的 GNB 网络（独立 Passcode + 独立网段），以便提供企业级安全保障。

**US-4**: 作为 SaaS 系统，当边缘设备首次通电联网时，设备能自动向 SaaS 注册并获取正确的 GNB 配置（node_id / passcode / VIP / index 地址），无需人工干预。

**US-5**: 作为 SaaS 系统，当租户从 Tier 1 升级到 Tier 2 时，系统能自动迁移该租户的所有设备到独立 GNB 网络，不中断服务。

## 验收标准

- [ ] **AC-1**: Given 新建一个 Tier 1 租户, When 调用 SaaS 设备注册 API, Then 返回共享 Passcode + `10.1.0.0/16` 网段内的唯一 VIP + 唯一 node_id
- [ ] **AC-2**: Given 新建一个 Tier 2 租户, When 创建租户, Then 系统自动生成独立 Passcode (`openssl rand -hex 4`) + 独立网段 (`10.{tid}.0.0/16`) + 启动独立 GNB 容器
- [ ] **AC-3**: Given 两台 Tier 1 设备分属不同租户, When 设备 A 尝试 ping 设备 B 的 VIP, Then 连接被 iptables 规则拒绝（仅允许 SaaS VIP `10.1.0.1`）
- [ ] **AC-4**: Given 设备首次通电, When 运行 `provision.sh`, Then 设备通过 HTTPS 向 SaaS 注册 → 获取 GNB 配置 → 自动启动 GNB + socat + iptables → 心跳上报成功
- [ ] **AC-5**: Given 租户从 Tier 1 升级到 Tier 2, When 调用升级 API, Then 系统创建独立网络 → 逐台设备下发新配置 → 设备重启 GNB 切换网络 → 旧 VIP 回收
- [ ] **AC-6**: Given SaaS 通过 GNB VIP 调用设备 OpenClaw API, When 发送 `POST http://10.x.x.x:18789/v1/agent/run`, Then 请求通过 socat 桥接到达本地 OpenClaw Gateway 并返回 200
- [ ] **AC-7**: Given 设备离线后重新上线, When GNB 链路恢复, Then 设备心跳重新到达 SaaS → 积压的 PENDING 指令自动补发

## 优先级: P0

## 复杂度: L（跨业务域架构变更 + 未知技术 GNB + 多租户隔离）

## 任务拆解

| # | 任务 | 负责角色 | 预估 | 状态 | 依赖 |
|---|------|---------|------|------|------|
| 1 | GNB Passcode 管理模块（生成/存储/分配 passcode + 网段 + node_id） | Alpha | 3h | ⬜ | - |
| 2 | 设备注册 API (`POST /api/devices/register`)  | Alpha | 2h | ⬜ | #1 |
| 3 | Tier 分级引擎（判定 + 自动路由到共享/独立网络） | Alpha | 2h | ⬜ | #1 |
| 4 | GNB 容器管理器（Tier 2 独立网络的 Docker 生命周期管理） | Alpha | 3h | ⬜ | #1 |
| 5 | 设备端 provision.sh 脚本（首次注册 + GNB 配置写入 + 服务启动） | Alpha | 2h | ⬜ | #2 |
| 6 | iptables 防火墙规则模板（Tier 1 隔离） | Beta | 1h | ⬜ | #2 |
| 7 | socat 桥接服务配置 | Beta | 1h | ⬜ | - |
| 8 | 心跳服务 + 指令队列（Redis Stream 消费者） | Beta | 3h | ⬜ | #2, #4 |
| 9 | 租户升级迁移（Tier 1 → Tier 2 在线迁移） | Beta | 2h | ⬜ | #3, #4 |
| 10 | 端到端集成测试 | Beta | 2h | ⬜ | #1~#9 |

## 技术风险

| 风险 | 影响 | 需 Spike |
|------|------|---------|
| GNB 同一节点能否同时加入多个 Passcode 网络 | SaaS 端若不支持多实例，需 Docker 隔离 | ✅ |
| macOS 设备上 GNB TUN 设备权限问题 | 影响 Mac mini 边缘设备部署 | ✅ |
| ISP 环境下 UDP 打洞成功率 | 决定是否需要 TCP 转发备选方案 | ✅ |
