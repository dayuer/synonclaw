// @alpha: GNB Passcode 管理器 — 分配 Passcode/VIP/NodeID 的核心模块
import { randomBytes } from 'node:crypto'
import { GNB_CONFIG } from './types.js'
import type { GnbNetwork, NetworkStatus } from './types.js'
import type { IStore } from './store.js'

export interface AllocationResult {
  passcode: string
  vip: string
  nodeId: number
  subnetPrefix: string
  saasVip: string
}

export class PasscodeManager {
  constructor(private readonly store: IStore) {}

  /** 初始化共享网络（系统启动时调用一次） */
  initSharedNetwork(): GnbNetwork {
    const existing = this.store.getSharedNetwork()
    if (existing) return existing

    const network: GnbNetwork = {
      id: 'shared',
      passcode: GNB_CONFIG.SHARED_PASSCODE,
      subnetPrefix: GNB_CONFIG.SHARED_SUBNET_PREFIX,
      saasVip: GNB_CONFIG.SHARED_SAAS_VIP,
      shared: true,
      tenantId: null,
      status: 'ACTIVE',
    }
    this.store.saveNetwork(network)
    return network
  }

  /** 为 Tier 1 设备分配 — 使用共享网络 */
  allocateShared(): AllocationResult {
    const network = this.store.getSharedNetwork()
    if (!network) throw new Error('共享网络未初始化，请先调用 initSharedNetwork()')

    const vip = this.allocateVip(network.subnetPrefix)
    const nodeId = this.allocateNodeId()

    return {
      passcode: network.passcode,
      vip,
      nodeId,
      subnetPrefix: network.subnetPrefix,
      saasVip: network.saasVip,
    }
  }

  /** 为 Tier 2 租户创建独立网络 */
  createDedicatedNetwork(tenantId: string): GnbNetwork {
    const passcode = this.generateUniquePasscode()
    // @alpha: 用 tenantId 的哈希取模映射到 2~255 范围作为子网第二段
    const subnetOctet = this.deriveSubnetOctet(tenantId)
    const subnetPrefix = `10.${subnetOctet}`
    const saasVip = `${subnetPrefix}.0.1`

    const network: GnbNetwork = {
      id: `dedicated-${tenantId}`,
      passcode,
      subnetPrefix,
      saasVip,
      shared: false,
      tenantId,
      status: 'ACTIVE',
    }
    this.store.saveNetwork(network)
    return network
  }

  /** 在指定网络中分配资源 */
  allocateFromNetwork(networkId: string): AllocationResult {
    const network = this.store.getNetwork(networkId)
    if (!network) throw new Error(`网络 ${networkId} 不存在`)

    const vip = this.allocateVip(network.subnetPrefix)
    const nodeId = this.allocateNodeId()

    return {
      passcode: network.passcode,
      vip,
      nodeId,
      subnetPrefix: network.subnetPrefix,
      saasVip: network.saasVip,
    }
  }

  /** 回收设备的 VIP 和 Node ID — 资源归还池 */
  deallocate(_vip: string, _nodeId: number): void {
    // @alpha: 内存实现中无需显式回收（isAllocated 查的是 device 列表）
    // PG 实现需标记 released
  }

  // --- 私有方法 ---

  private allocateVip(subnetPrefix: string): string {
    const { VIP_HOST_MIN, VIP_HOST_MAX } = GNB_CONFIG
    // @alpha: 遍历 0.10~255.254 范围寻找空闲 VIP
    for (let third = 0; third <= 255; third++) {
      for (let fourth = VIP_HOST_MIN; fourth <= VIP_HOST_MAX; fourth++) {
        const vip = `${subnetPrefix}.${third}.${fourth}`
        if (!this.store.isVipAllocated(vip)) return vip
      }
    }
    throw new Error(`VIP_POOL_EXHAUSTED: ${subnetPrefix}.0.0/16 网段已满`)
  }

  private allocateNodeId(): number {
    const { DEVICE_NODE_ID_MIN, DEVICE_NODE_ID_MAX } = GNB_CONFIG
    for (let id = DEVICE_NODE_ID_MIN; id <= DEVICE_NODE_ID_MAX; id++) {
      if (!this.store.isNodeIdAllocated(id)) return id
    }
    throw new Error('NODE_ID_EXHAUSTED: 2001~9999 节点 ID 已满')
  }

  private generateUniquePasscode(): string {
    // @alpha: 最多重试 10 次避免碰撞（概率 < 1/4.2B，几乎不可能）
    for (let i = 0; i < 10; i++) {
      const passcode = randomBytes(4).toString('hex').toUpperCase()
      if (!this.store.getNetworkByPasscode(passcode)) return passcode
    }
    throw new Error('PASSCODE_GENERATION_FAILED: 10 次尝试均碰撞')
  }

  /** 从 tenantId 派生子网第二段 (2~255) */
  private deriveSubnetOctet(tenantId: string): number {
    let hash = 0
    for (const ch of tenantId) {
      hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
    }
    // 映射到 2~255 范围（跳过 0 和 1，0 保留，1 是共享网络）
    return (Math.abs(hash) % 254) + 2
  }
}
