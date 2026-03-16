// @alpha: Tier 分级引擎 — 判定租户等级 + 编排升级迁移
import type { Tier, Tenant, Device, GnbNetwork } from './types.js'
import { GNB_CONFIG } from './types.js'
import type { IStore } from './store.js'
import type { PasscodeManager } from './passcode-manager.js'
import type { IGnbContainerManager, GnbContainerConfig } from './types.js'

export interface UpgradeResult {
  newNetwork: GnbNetwork
  migratedDevices: Device[]
  pendingDevices: Device[]
}

export class TierEngine {
  constructor(
    private readonly store: IStore,
    private readonly passcodeManager: PasscodeManager,
    private readonly containerManager: IGnbContainerManager,
  ) {}

  /** 判定租户应属于哪个 Tier */
  determineTier(tenant: Tenant): Tier {
    if (tenant.isPaid) return 'TIER_2'
    const deviceCount = this.store.countDevicesByTenant(tenant.id)
    return deviceCount > GNB_CONFIG.TIER_1_DEVICE_LIMIT ? 'TIER_2' : 'TIER_1'
  }

  /** 获取租户对应的 GNB 网络 */
  resolveNetwork(tenant: Tenant): GnbNetwork {
    const network = this.store.getNetwork(tenant.networkId)
    if (!network) throw new Error(`租户 ${tenant.id} 的网络 ${tenant.networkId} 不存在`)
    return network
  }

  /** 编排 Tier 1 → Tier 2 升级 */
  async upgradeTier(tenantId: string): Promise<UpgradeResult> {
    const tenant = this.store.getTenant(tenantId)
    if (!tenant) throw new Error(`租户 ${tenantId} 不存在`)
    if (tenant.tier === 'TIER_2') throw new UpgradeConflictError(tenantId)

    // 1. 创建独立网络
    const newNetwork = this.passcodeManager.createDedicatedNetwork(tenantId)

    // 2. 启动 SaaS 端 GNB 容器
    const containerConfig: GnbContainerConfig = {
      nodeId: GNB_CONFIG.SAAS_NODE_ID_MIN + this.deriveSaasNodeOffset(tenantId),
      passcode: newNetwork.passcode,
      indexAddress: GNB_CONFIG.INDEX_ADDRESS,
      subnetPrefix: newNetwork.subnetPrefix,
    }
    await this.containerManager.start(tenantId, containerConfig)

    // 3. 逐台迁移设备
    const devices = this.store.getDevicesByTenant(tenantId)
    const migratedDevices: Device[] = []
    const pendingDevices: Device[] = []

    for (const device of devices) {
      if (device.status === 'ONLINE') {
        // @alpha: 在线设备立即分配新配置（实际下发由 CommandDispatcher 处理）
        const allocation = this.passcodeManager.allocateFromNetwork(newNetwork.id)
        this.updateDeviceNetwork(device, allocation)
        migratedDevices.push(device)
      } else {
        // @alpha: 离线设备标记待迁移，上线后自动完成
        device.status = 'PENDING_MIGRATION'
        this.store.saveDevice(device)
        pendingDevices.push(device)
      }
    }

    // 4. 更新租户状态
    tenant.tier = 'TIER_2'
    tenant.networkId = newNetwork.id
    this.store.saveTenant(tenant)

    return { newNetwork, migratedDevices, pendingDevices }
  }

  // --- 私有方法 ---

  private updateDeviceNetwork(
    device: Device,
    allocation: { passcode: string; vip: string; nodeId: number },
  ): void {
    device.passcode = allocation.passcode
    device.vip = allocation.vip
    device.gnbNodeId = allocation.nodeId
    this.store.saveDevice(device)
  }

  /** 从 tenantId 派生 SaaS 端 Node ID 偏移 (0~98) */
  private deriveSaasNodeOffset(tenantId: string): number {
    let hash = 0
    for (const ch of tenantId) {
      hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
    }
    return Math.abs(hash) % 99
  }
}

/** 重复升级错误 */
export class UpgradeConflictError extends Error {
  constructor(tenantId: string) {
    super(`ALREADY_TIER_2: 租户 ${tenantId} 已经是 Tier 2`)
    this.name = 'UpgradeConflictError'
  }
}
