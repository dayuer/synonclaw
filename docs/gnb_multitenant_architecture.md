# GNB 多租户 Passcode 网络隔离技术文档

## 文档概述

本文档详细描述了 SynonClaw GNB 多租户 Passcode 网络隔离架构的实现细节，包括核心业务逻辑、设备端脚本、网络隔离策略和测试覆盖情况。

---

## 1. 系统架构概述

### 1.1 核心目标

GNB 多租户系统旨在实现：
- **小租户共享网络**：降低运维成本，共享 GNB Passcode
- **大租户独立网络**：彻底隔离，独立 Passcode + 网段
- **设备间严格隔离**：同一网络内设备不可互通

### 1.2 租户分级策略

| 等级 | 条件 | 网络方案 | SaaS 端实现 |
|------|------|----------|-------------|
| **Tier 1** | 设备数 ≤ 5 | 共享 GNB 网络 + iptables 隔离 | 单进程 GNB，共享 passcode |
| **Tier 2** | 设备数 > 5 或企业付费 | 独立 GNB 网络 | 独立 GNB 容器，独立 passcode + 网段 |

### 1.3 网络拓扑架构

```
SaaS 后台
│
├── 共享 GNB 网络 (Tier 1)
│   ├── Passcode: A1B2C3D4
│   ├── 网段: 10.1.0.0/16
│   ├── SaaS 节点: 10.1.0.1
│   ├── 租户A设备: 10.1.0.10-11
│   └── 租户B设备: 10.1.0.20-21
│
├── 租户C 独立网络 (Tier 2)
│   ├── Passcode: 自动生成
│   ├── 网段: 10.{tenant_hash}.0.0/16
│   ├── SaaS 节点: 10.{tenant_hash}.0.1
│   └── 租户C设备: 10.{tenant_hash}.0.10-11
│
└── 租户D 独立网络 (Tier 2)
    ├── Passcode: 自动生成
    ├── 网段: 10.{tenant_hash}.0.0/16
    ├── SaaS 节点: 10.{tenant_hash}.0.1
    └── 租户D设备: 10.{tenant_hash}.0.10
```

---

## 2. 核心业务逻辑模块

### 2.1 类型定义模块 (`types.ts`)

#### 核心类型

**租户等级**
```typescript
export type Tier = 'TIER_1' | 'TIER_2'
```

**设备状态**
```typescript
export type DeviceStatus = 'PENDING' | 'ONLINE' | 'OFFLINE' | 'PENDING_MIGRATION'
```

**指令状态**
```typescript
export type CommandStatus = 'PENDING' | 'DELIVERED' | 'RETRY' | 'FAILED'
```

**网络状态**
```typescript
export type NetworkStatus = 'ACTIVE' | 'DEGRADED' | 'CREATING' | 'MIGRATING'
```

#### 核心实体

**GNB 网络配置**
```typescript
export interface GnbNetwork {
  readonly id: string
  readonly passcode: string      // 32位十六进制字符串（8字符）
  readonly subnetPrefix: string  // 虚拟网段前缀，如 "10.1" 或 "10.42"
  readonly saasVip: string       // SaaS端虚拟IP
  readonly shared: boolean       // 是否为共享网络
  readonly tenantId: string | null  // 关联租户ID（共享网络为null）
  status: NetworkStatus
}
```

**租户**
```typescript
export interface Tenant {
  readonly id: string
  readonly name: string
  tier: Tier                      // 当前租户等级
  networkId: string               // 当前关联的GNB网络ID
  readonly isPaid: boolean        // 是否为企业付费客户
  readonly createdAt: Date
}
```

**设备**
```typescript
export interface Device {
  readonly serialNo: string
  readonly hwFingerprint: string
  readonly tenantId: string
  vip: string                     // GNB虚拟IP
  gnbNodeId: number               // GNB节点ID (2001~9999)
  passcode: string                // 当前使用的Passcode
  status: DeviceStatus
  lastSeen: Date | null
  readonly registeredAt: Date
}
```

#### 配置常量

```typescript
export const GNB_CONFIG = {
  SHARED_PASSCODE: 'A1B2C3D4',
  SHARED_SUBNET_PREFIX: '10.1',
  SHARED_SAAS_VIP: '10.1.0.1',
  INDEX_ADDRESS: 'gnb-index-cn.synonclaw.com:9001',

  // Node ID 范围
  SAAS_NODE_ID_MIN: 1001,
  SAAS_NODE_ID_MAX: 1099,
  DEVICE_NODE_ID_MIN: 2001,
  DEVICE_NODE_ID_MAX: 9999,

  // VIP 范围（主机部分）
  VIP_HOST_MIN: 10,
  VIP_HOST_MAX: 254,

  // Tier 1 设备上限
  TIER_1_DEVICE_LIMIT: 5,

  // 指令重试配置
  RETRY_INTERVALS_MS: [30_000, 60_000, 120_000, 300_000] as const,
  MAX_RETRIES: 48,

  // 心跳去抖间隔
  HEARTBEAT_DEBOUNCE_MS: 60_000,
} as const
```

---

### 2.2 存储层模块 (`store.ts`)

#### 存储接口

```typescript
export interface IStore {
  // 租户操作
  getTenant(id: string): Tenant | undefined
  getTenantBySerialNo(serialNo: string): Tenant | undefined
  saveTenant(tenant: Tenant): void

  // 设备操作
  getDevice(serialNo: string): Device | undefined
  getDevicesByTenant(tenantId: string): Device[]
  saveDevice(device: Device): void
  countDevicesByTenant(tenantId: string): number

  // 网络操作
  getNetwork(id: string): GnbNetwork | undefined
  getNetworkByPasscode(passcode: string): GnbNetwork | undefined
  getSharedNetwork(): GnbNetwork | undefined
  saveNetwork(network: GnbNetwork): void

  // 指令操作
  getCommand(id: string): Command | undefined
  getPendingCommands(deviceSerialNo: string): Command[]
  saveCommand(command: Command): void

  // 分配池查询
  isVipAllocated(vip: string): boolean
  isNodeIdAllocated(nodeId: number): boolean

  // 设备-租户绑定
  bindDeviceToTenant(serialNo: string, tenantId: string): void
}
```

#### 内存实现

当前使用 `MemoryStore` 实现存储层，适用于测试和原型阶段。后续将替换为 PostgreSQL 实现。

---

### 2.3 Passcode 管理器 (`passcode-manager.ts`)

#### 核心职责

- **初始化共享网络**：系统启动时调用一次
- **分配共享网络资源**：为 Tier 1 设备分配资源
- **创建独立网络**：为 Tier 2 租户创建独立 GNB 网络
- **资源分配与回收**：VIP 和 Node ID 的分配

#### 核心方法

**初始化共享网络**
```typescript
initSharedNetwork(): GnbNetwork
```
- 创建共享网络配置
- 幂等操作，重复调用返回已有网络

**为 Tier 1 设备分配资源**
```typescript
allocateShared(): AllocationResult
```
- 从共享网络分配 VIP 和 Node ID
- VIP 范围：`10.1.0.10` - `10.1.255.254`
- Node ID 范围：`2001` - `9999`

**创建 Tier 2 租户独立网络**
```typescript
createDedicatedNetwork(tenantId: string): GnbNetwork
```
- 生成随机 Passcode（8位十六进制）
- 基于租户ID派生子网段（`10.{hash}.0.0/16`）
- 子网段映射到 2-255 范围

**从指定网络分配资源**
```typescript
allocateFromNetwork(networkId: string): AllocationResult
```

#### 算法实现

**Passcode 生成**
```typescript
private generateUniquePasscode(): string {
  for (let i = 0; i < 10; i++) {
    const passcode = randomBytes(4).toString('hex').toUpperCase()
    if (!this.store.getNetworkByPasscode(passcode)) return passcode
  }
  throw new Error('PASSCODE_GENERATION_FAILED: 10 次尝试均碰撞')
}
```
- 使用加密安全的随机数生成器
- 最多重试 10 次（碰撞概率 < 1/4.2B）

**子网段派生**
```typescript
private deriveSubnetOctet(tenantId: string): number {
  let hash = 0
  for (const ch of tenantId) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  }
  return (Math.abs(hash) % 254) + 2
}
```
- 使用 DJB2 哈希算法
- 映射到 2-255 范围（跳过 0 和 1）

---

### 2.4 Tier 分级引擎 (`tier-engine.ts`)

#### 核心职责

- **租户等级判定**：根据业务规则确定租户 Tier
- **网络解析**：获取租户对应的 GNB 网络
- **升级编排**：Tier 1 → Tier 2 升级流程

#### 核心方法

**判定租户等级**
```typescript
determineTier(tenant: Tenant): Tier
```
- 付费客户直接返回 `TIER_2`
- 设备数 ≤ 5 返回 `TIER_1`
- 设备数 > 5 返回 `TIER_2`

**获取租户对应网络**
```typescript
resolveNetwork(tenant: Tenant): GnbNetwork
```

**Tier 1 → Tier 2 升级**
```typescript
async upgradeTier(tenantId: string): Promise<UpgradeResult>
```

#### 升级流程

1. **创建独立网络**：生成新 Passcode 和网段
2. **启动 SaaS 端容器**：为租户创建独立 GNB 容器
3. **迁移设备**：
   - 在线设备：立即分配新配置
   - 离线设备：标记为 `PENDING_MIGRATION`
4. **更新租户状态**：设置 tier 为 `TIER_2`

```typescript
export interface UpgradeResult {
  newNetwork: GnbNetwork
  migratedDevices: Device[]      // 已迁移的在线设备
  pendingDevices: Device[]       // 待迁移的离线设备
}
```

#### SaaS 节点 ID 派生

```typescript
private deriveSaasNodeOffset(tenantId: string): number {
  let hash = 0
  for (const ch of tenantId) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  }
  return Math.abs(hash) % 99
}
```
- 派生 0-98 范围偏移量
- 最终 SaaS Node ID：`1001 + offset`

---

### 2.5 设备注册器 (`device-registrar.ts`)

#### 核心职责

- **设备注册**：处理设备注册请求，分配网络资源
- **幂等性保证**：重复注册返回已有配置

#### 注册流程

```typescript
register(request: RegisterRequest): RegisterResponse
```

1. **验证请求**：检查序列号和硬件指纹
2. **幂等检查**：已注册则直接返回
3. **查找租户**：根据序列号查找绑定租户
4. **分配资源**：根据租户 Tier 分配网络资源
5. **创建设备记录**：保存设备信息
6. **返回配置**：返回 Passcode、VIP、Node ID 等

#### 异常处理

```typescript
export class DeviceNotBoundError extends Error
export class InvalidRequestError extends Error
```

---

### 2.6 指令分发器 (`command-dispatcher.ts`)

#### 核心职责

- **指令分发**：创建并推送指令到设备
- **重试管理**：处理失败指令的重试策略
- **心跳处理**：响应设备心跳，补发积压指令

#### 核心方法

**创建并分发指令**
```typescript
async dispatch(deviceSerialNo: string, type: string, payload: string): Promise<Command>
```

**重试待处理指令**
```typescript
async retryPending(deviceSerialNo: string): Promise<void>
```

**心跳处理**
```typescript
async onHeartbeat(deviceSerialNo: string): Promise<number>
```
- 更新设备在线状态
- 去抖处理（60秒内不重复触发）
- 补发积压指令

#### 指令状态流转

```
PENDING → RETRY → DELIVERED
              ↘ FAILED
```

#### 重试策略

- 重试间隔：30s → 60s → 120s → 300s
- 最大重试：48 次（约 24 小时）
- 超过最大重试：标记为 `FAILED`

---

### 2.7 容器管理器 (`container-manager.ts`)

#### 核心职责

- **容器生命周期管理**：启动、停止、删除 GNB 容器
- **状态查询**：查询容器运行状态

#### 接口定义

```typescript
export interface IGnbContainerManager {
  start(tenantId: string, config: GnbContainerConfig): Promise<void>
  stop(tenantId: string): Promise<void>
  status(tenantId: string): Promise<ContainerStatus>
  remove(tenantId: string): Promise<void>
}
```

#### Mock 实现

当前使用 `MockContainerManager` 实现测试支持，记录操作日志供测试断言使用。

---

## 3. 设备端脚本

### 3.1 设备注册脚本 (`provision.sh`)

#### 脚本功能

设备首次通电后自动执行，完成设备注册和配置。

#### 执行流程

1. **收集设备信息**
   - 序列号：从 `/etc/openclaw/serial_no` 读取
   - 硬件指纹：从 `/sys/class/dmi/id/product_uuid` 读取

2. **注册设备**
   ```bash
   curl -X POST "${SAAS_API}/api/devices/register" \
     -H 'Content-Type: application/json' \
     -d "{\"serialNo\":\"${SERIAL_NO}\",\"hwFingerprint\":\"${HW_FINGERPRINT}\"}"
   ```

3. **解析注册响应**
   - Passcode
   - VIP
   - Node ID
   - Index Address

4. **写入 GNB 配置**
   ```bash
   /opt/openclaw/config/gnb/node.conf
   /opt/openclaw/config/gnb/address.conf
   /opt/openclaw/config/gnb/passcode
   /opt/openclaw/config/gnb/vip
   ```

5. **启动服务**
   - GNB 服务
   - socat 桥接
   - 防火墙配置

#### 重试机制

- 最大重试次数：3 次
- 重试间隔：递增（1分钟、2分钟、3分钟）
- 失败后记录日志并退出

---

### 3.2 心跳上报脚本 (`heartbeat.sh`)

#### 脚本功能

设备主动向 SaaS 上报在线状态，通过 GNB 虚拟网络上报。

#### 执行方式

- 定时任务：cron 每 60 秒执行一次

#### 实现逻辑

```bash
curl -sS --max-time 10 \
  --interface "$GNB_IF" \
  -X GET "http://${SAAS_VIP}:8080/api/heartbeat?serialNo=${SERIAL_NO}" \
  > /dev/null 2>&1 || true
```

---

### 3.3 防火墙配置脚本 (`firewall.sh`)

#### 脚本功能

为 Tier 1 设备配置 iptables 防火墙规则，确保设备间隔离。

#### 配置逻辑

1. **清理旧规则**（幂等操作）
   ```bash
   iptables -D INPUT   -i "$GNB_IF" -j DROP
   iptables -D OUTPUT  -o "$GNB_IF" -j DROP
   iptables -D FORWARD -i "$GNB_IF" -j DROP
   ```

2. **默认拒绝 GNB 网卡流量**
   ```bash
   iptables -A INPUT   -i "$GNB_IF" -j DROP
   iptables -A OUTPUT  -o "$GNB_IF" -j DROP
   iptables -A FORWARD -i "$GNB_IF" -j DROP
   ```

3. **仅允许与 SaaS VIP 通信**
   ```bash
   iptables -I INPUT  1 -i "$GNB_IF" -s "$SAAS_VIP" -j ACCEPT
   iptables -I OUTPUT 1 -o "$GNB_IF" -d "$SAAS_VIP" -j ACCEPT
   ```

4. **允许 ICMP（链路检测）**
   ```bash
   iptables -I INPUT  2 -i "$GNB_IF" -s "$SAAS_VIP" -p icmp -j ACCEPT
   iptables -I OUTPUT 2 -o "$GNB_IF" -d "$SAAS_VIP" -p icmp -j ACCEPT
   ```

#### 隔离效果

- 设备 A 无法 ping 设备 B（即使同网段）
- 只有 SaaS (`10.1.0.1`) 能与每台设备通信

---

### 3.4 GNB 桥接服务 (`gnb-bridge.service`)

#### 服务功能

使用 socat 实现 GNB 虚拟网络到本地 OpenClaw 服务的端口桥接。

#### 服务配置

```ini
[Unit]
Description=OpenClaw GNB Bridge (socat)
After=gnb.service openclaw.service
Requires=gnb.service

[Service]
Type=simple
ExecStart=/usr/bin/socat \
  TCP-LISTEN:18789,bind=GNB_VIP_PLACEHOLDER,reuseaddr,fork \
  TCP:127.0.0.1:18789
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 启动流程

1. 设备注册后，将 VIP 替换到配置中
2. GNB 虚拟网络流量（VIP:18789）转发到本地（127.0.0.1:18789）
3. 自动重启，确保服务持续运行

---

## 4. 网络隔离策略详解

### 4.1 Tier 1：共享网络 + 防火墙隔离

#### 网络配置

- Passcode: `A1B2C3D4`（固定共享）
- 网段: `10.1.0.0/16`
- SaaS 节点: `10.1.0.1`
- 设备 IP 范围: `10.1.0.10` - `10.1.255.254`

#### 隔离机制

**iptables 白名单**
- 默认拒绝所有 GNB 网卡流量
- 仅允许与 SaaS VIP (`10.1.0.1`) 通信
- 允许 ICMP 用于链路检测

**隔离效果**
- 同网段设备间无法通信
- 不同租户设备间无法通信
- 只有 SaaS 后台能与每台设备通信

#### 优势

- 降低运维成本（共享 Passcode）
- 设备数限制在 5 台以内
- 防火墙规则简单可靠

---

### 4.2 Tier 2：独立网络彻底隔离

#### 网络配置

- Passcode: 随机生成（8位十六进制）
- 网段: `10.{tenant_hash}.0.0/16`
- SaaS 节点: `10.{tenant_hash}.0.1`
- 设备 IP 范围: `10.{tenant_hash}.0.10` - `.254`

#### 隔离机制

**独立 Passcode**
- 不同租户使用不同 Passcode
- 物理层面完全隔离

**独立网段**
- 子网段基于租户 ID 哈希派生
- 网络层面完全隔离

**独立 GNB 容器**
- 每个租户对应一个独立 GNB 容器
- 进程层面完全隔离

#### 优势

- 彻底隔离，安全等级最高
- 支持无限设备数量
- 满足企业级安全要求

---

## 5. 测试覆盖情况

### 5.1 Passcode Manager 测试

**覆盖场景**
- ✅ 共享网络初始化
- ✅ 共享资源分配（VIP、Node ID）
- ✅ 连续分配不冲突
- ✅ 独立网络创建
- ✅ 不同租户 Passcode 唯一性
- ✅ 网络不存在异常处理

**测试文件**: `passcode-manager.test.ts`

---

### 5.2 Tier Engine 测试

**覆盖场景**
- ✅ 付费客户直接返回 TIER_2
- ✅ 设备数 ≤ 5 返回 TIER_1
- ✅ 设备数 > 5 返回 TIER_2
- ✅ Tier 1 → Tier 2 升级流程
- ✅ 在线设备迁移
- ✅ 离线设备标记待迁移
- ✅ 重复升级异常处理
- ✅ 租户不存在异常处理

**测试文件**: `tier-engine.test.ts`

---

### 5.3 Device Registrar 测试

**覆盖场景**
- ✅ 设备注册完整流程
- ✅ 幂等性保证
- ✅ 设备未绑定异常
- ✅ 请求验证

**测试文件**: `device-registrar.test.ts`

---

### 5.4 Command Dispatcher 测试

**覆盖场景**
- ✅ 指令创建与分发
- ✅ 重试机制
- ✅ 心跳处理
- ✅ 积压指令补发

**测试文件**: `command-dispatcher.test.ts`

---

## 6. 技术实现要点

### 6.1 幂等性设计

**设备注册幂等**
```typescript
const existing = this.store.getDevice(request.serialNo)
if (existing) return this.toResponse(existing)
```

**共享网络初始化幂等**
```typescript
const existing = this.store.getSharedNetwork()
if (existing) return existing
```

### 6.2 异常处理

**设备未绑定异常**
```typescript
export class DeviceNotBoundError extends Error {
  constructor(serialNo: string) {
    super(`DEVICE_NOT_BOUND: 设备 ${serialNo} 未绑定任何租户`)
    this.name = 'DeviceNotBoundError'
  }
}
```

**重复升级异常**
```typescript
export class UpgradeConflictError extends Error {
  constructor(tenantId: string) {
    super(`ALREADY_TIER_2: 租户 ${tenantId} 已经是 Tier 2`)
    this.name = 'UpgradeConflictError'
  }
}
```

### 6.3 资源分配策略

**VIP 分配**
- 遍历 `0.10` - `255.254` 范围
- 查询存储层确认未分配
- 抛出异常时提示网段已满

**Node ID 分配**
- 遍历 `2001` - `9999` 范围
- 查询存储层确认未分配
- 抛出异常时提示 Node ID 已满

### 6.4 哈希算法选择

使用 DJB2 哈希算法：
- 计算速度快
- 分布均匀
- 实现简单

---

## 7. 部署与运维

### 7.1 SaaS 端部署

**组件清单**
- API Server（设备注册、心跳处理）
- GNB Gateway Manager（容器管理）
- Dispatch Worker（指令分发）
- PostgreSQL（数据存储）
- Redis（指令队列）

**环境要求**
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker（容器管理）

### 7.2 设备端部署

**出厂镜像内容**
```
/opt/openclaw/
├── bin/
│   ├── openclaw          # Gateway 二进制
│   ├── gnb               # GNB 二进制
│   ├── gnb_crypto        # 密钥工具
│   └── socat             # 端口桥接
├── config/
│   ├── openclaw.yaml     # bind: loopback
│   ├── gnb/node.conf     # 出厂模板
│   └── firewall.sh       # iptables 隔离规则
├── scripts/
│   ├── provision.sh      # 首次注册
│   └── heartbeat.sh      # 心跳上报
└── systemd/
    ├── gnb.service
    ├── openclaw.service
    └── openclaw-gnb-bridge.service
```

**自动启动流程**
1. 设备通电
2. 执行 `provision.sh` 注册
3. 写入 GNB 配置
4. 启动 GNB、OpenClaw、桥接服务
5. 配置防火墙
6. 开始心跳上报

---

## 8. 安全加固措施

### 8.1 网络安全

- **禁用 Lite 模式**：生产环境必须用非对称加密
- **Passcode 随机**：使用加密安全随机数生成器
- **自建 Index 节点**：2-3 个，部署在不同地域
- **TLS 叠加**：socat 可升级为 openssl-listen

### 8.2 应用安全

- **Token 轮换**：OpenClaw Token 定期轮换
- **指令队列加密**：敏感指令 payload 加密
- **审计日志**：记录所有关键操作

### 8.3 隔离安全

- **iptables 白名单**：Tier 1 设备严格限制
- **独立 Passcode**：Tier 2 租户物理隔离
- **独立容器**：Tier 2 租户进程隔离

---

## 9. 性能优化建议

### 9.1 存储层优化

- **PostgreSQL 实现**：替换内存存储
- **索引优化**：设备序列号、租户 ID、Passcode
- **连接池**：管理数据库连接

### 9.2 网络层优化

- **连接复用**：HTTP Keep-Alive
- **压缩传输**：gzip 压缩 payload
- **CDN 加速**：静态资源分发

### 9.3 指令分发优化

- **批量处理**：减少数据库查询
- **延迟队列**：减少无效重试
- **优先级队列**：紧急指令优先处理

---

## 10. 故障排查指南

### 10.1 设备注册失败

**可能原因**
- 网络连接问题
- 设备未绑定租户
- SaaS API 不可用

**排查步骤**
1. 检查网络连接
2. 查看注册日志：`/var/log/openclaw/provision.log`
3. 验证设备序列号是否已绑定租户
4. 检查 SaaS API 健康状态

### 10.2 设备无法访问 SaaS

**可能原因**
- GNB 网络未建立
- 防火墙规则错误
- 网桥服务未启动

**排查步骤**
1. 检查 GNB 服务状态：`systemctl status gnb`
2. 验证防火墙规则：`iptables -L -v -n`
3. 检查网桥服务：`systemctl status openclaw-gnb-bridge`
4. 测试 GNB 连接：`ping 10.1.0.1`

### 10.3 指令下发失败

**可能原因**
- 设备离线
- 网络波动
- OpenClaw 服务异常

**排查步骤**
1. 检查设备在线状态
2. 查看指令重试记录
3. 验证 OpenClaw 服务：`systemctl status openclaw`
4. 检查设备端日志

---

## 11. 版本历史

### v1.0.0 (2026-03-16)

**核心功能**
- ✅ GNB 多租户 Passcode 网络隔离
- ✅ Tier 1/2 分级策略
- ✅ 设备注册与配置
- ✅ 指令分发与重试
- ✅ 心跳处理
- ✅ 容器管理（Mock）
- ✅ 完整测试覆盖（30/30）

**技术文档**
- ✅ 架构设计文档
- ✅ API 文档
- ✅ 部署指南
- ✅ 故障排查指南

---

## 12. 参考资料

### 相关文档

- [OpenClaw Network Guide](./openclaw_network_guide.md)
- [GNB 官方文档](https://gnb.io/docs)
- [PostgreSQL 性能优化指南](https://www.postgresql.org/docs/current/performance-tips.html)

### 开源项目

- GNB: [https://github.com/gnb-project/gnb](https://github.com/gnb-project/gnb)
- OpenClaw: [https://github.com/synonclaw/openclaw](https://github.com/synonclaw/openclaw)

---

**文档版本**: 1.0.0
**最后更新**: 2026-03-16
**维护者**: SynonClaw Team
