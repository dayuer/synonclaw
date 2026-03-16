// @alpha: 所有 GNB 多租户隔离的核心类型定义

/** 租户等级 */
export type Tier = 'TIER_1' | 'TIER_2'

/** 设备在线状态 */
export type DeviceStatus = 'PENDING' | 'ONLINE' | 'OFFLINE' | 'PENDING_MIGRATION'

/** 指令状态 */
export type CommandStatus = 'PENDING' | 'DELIVERED' | 'RETRY' | 'FAILED'

/** 租户网络状态 */
export type NetworkStatus = 'ACTIVE' | 'DEGRADED' | 'CREATING' | 'MIGRATING'

/** GNB 网络配置 */
export interface GnbNetwork {
  /** 网络唯一标识 */
  readonly id: string
  /** GNB Passcode — 32 位十六进制字符串（8 字符） */
  readonly passcode: string
  /** 虚拟网段前缀（如 "10.1" 或 "10.42"） */
  readonly subnetPrefix: string
  /** SaaS 端虚拟 IP */
  readonly saasVip: string
  /** 是否为共享网络 */
  readonly shared: boolean
  /** 关联的租户 ID（共享网络为 null） */
  readonly tenantId: string | null
  /** 网络状态 */
  status: NetworkStatus
}

/** 租户 */
export interface Tenant {
  readonly id: string
  readonly name: string
  tier: Tier
  /** 当前关联的 GNB 网络 ID */
  networkId: string
  /** 是否为企业付费客户 */
  readonly isPaid: boolean
  readonly createdAt: Date
}

/** 设备 */
export interface Device {
  readonly serialNo: string
  readonly hwFingerprint: string
  readonly tenantId: string
  /** GNB 虚拟 IP */
  vip: string
  /** GNB 节点 ID (2001~9999) */
  gnbNodeId: number
  /** 当前使用的 Passcode */
  passcode: string
  status: DeviceStatus
  lastSeen: Date | null
  readonly registeredAt: Date
}

/** 设备注册请求 */
export interface RegisterRequest {
  serialNo: string
  hwFingerprint: string
}

/** 设备注册响应 */
export interface RegisterResponse {
  passcode: string
  vip: string
  nodeId: number
  indexAddress: string
  subnetPrefix: string
  saasVip: string
}

/** 指令 */
export interface Command {
  readonly id: string
  readonly deviceSerialNo: string
  readonly type: string
  readonly payload: string
  status: CommandStatus
  retryCount: number
  readonly createdAt: Date
  lastAttemptAt: Date | null
  deliveredAt: Date | null
}

/** GNB 容器管理接口 — 后续对接 Docker API */
export interface IGnbContainerManager {
  start(tenantId: string, config: GnbContainerConfig): Promise<void>
  stop(tenantId: string): Promise<void>
  status(tenantId: string): Promise<ContainerStatus>
  remove(tenantId: string): Promise<void>
}

export interface GnbContainerConfig {
  nodeId: number
  passcode: string
  indexAddress: string
  subnetPrefix: string
}

export type ContainerStatus = 'RUNNING' | 'STOPPED' | 'NOT_FOUND' | 'ERROR'

/** 配置常量 */
export const GNB_CONFIG = {
  /** 共享网络 Passcode */
  SHARED_PASSCODE: 'A1B2C3D4',
  /** 共享网络子网前缀 */
  SHARED_SUBNET_PREFIX: '10.1',
  /** SaaS 共享网络 VIP */
  SHARED_SAAS_VIP: '10.1.0.1',
  /** Index 节点地址 */
  INDEX_ADDRESS: 'gnb-index-cn.synonclaw.com:9001',
  /** SaaS 端 Node ID 范围 */
  SAAS_NODE_ID_MIN: 1001,
  SAAS_NODE_ID_MAX: 1099,
  /** 设备 Node ID 范围 */
  DEVICE_NODE_ID_MIN: 2001,
  DEVICE_NODE_ID_MAX: 9999,
  /** VIP 范围（主机部分） */
  VIP_HOST_MIN: 10,
  VIP_HOST_MAX: 254,
  /** Tier 1 设备上限（超过自动建议升级 Tier 2） */
  TIER_1_DEVICE_LIMIT: 5,
  /** 指令重试配置 */
  RETRY_INTERVALS_MS: [30_000, 60_000, 120_000, 300_000] as const,
  MAX_RETRIES: 48,
  /** 心跳去抖间隔 (ms) */
  HEARTBEAT_DEBOUNCE_MS: 60_000,
} as const
