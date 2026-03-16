// @alpha: 设备注册服务 — 串联 PasscodeManager + TierEngine
import type { Device, RegisterRequest, RegisterResponse } from './types.js'
import { GNB_CONFIG } from './types.js'
import type { IStore } from './store.js'
import type { PasscodeManager } from './passcode-manager.js'
import { TierEngine } from './tier-engine.js'

export class DeviceRegistrar {
  constructor(
    private readonly store: IStore,
    private readonly passcodeManager: PasscodeManager,
    private readonly tierEngine: TierEngine,
  ) {}

  /** 注册设备 — 幂等，重复注册返回已有配置 */
  register(request: RegisterRequest): RegisterResponse {
    this.validateRequest(request)

    // 幂等：已注册过则直接返回
    const existing = this.store.getDevice(request.serialNo)
    if (existing) return this.toResponse(existing)

    // 查找绑定的租户
    const tenant = this.store.getTenantBySerialNo(request.serialNo)
    if (!tenant) throw new DeviceNotBoundError(request.serialNo)

    // 按 Tier 分配网络资源
    const allocation = tenant.tier === 'TIER_1'
      ? this.passcodeManager.allocateShared()
      : this.passcodeManager.allocateFromNetwork(tenant.networkId)

    // 创建设备记录
    const device: Device = {
      serialNo: request.serialNo,
      hwFingerprint: request.hwFingerprint,
      tenantId: tenant.id,
      vip: allocation.vip,
      gnbNodeId: allocation.nodeId,
      passcode: allocation.passcode,
      status: 'PENDING',
      lastSeen: null,
      registeredAt: new Date(),
    }
    this.store.saveDevice(device)

    return this.toResponse(device)
  }

  // --- 私有方法 ---

  private validateRequest(req: RegisterRequest): void {
    if (!req.serialNo?.trim()) {
      throw new InvalidRequestError('serial_no 不能为空')
    }
    if (!req.hwFingerprint?.trim()) {
      throw new InvalidRequestError('hw_fingerprint 不能为空')
    }
  }

  private toResponse(device: Device): RegisterResponse {
    const network = device.passcode === GNB_CONFIG.SHARED_PASSCODE
      ? this.store.getSharedNetwork()
      : this.store.getNetworkByPasscode(device.passcode)

    return {
      passcode: device.passcode,
      vip: device.vip,
      nodeId: device.gnbNodeId,
      indexAddress: GNB_CONFIG.INDEX_ADDRESS,
      subnetPrefix: network?.subnetPrefix ?? GNB_CONFIG.SHARED_SUBNET_PREFIX,
      saasVip: network?.saasVip ?? GNB_CONFIG.SHARED_SAAS_VIP,
    }
  }
}

export class DeviceNotBoundError extends Error {
  constructor(serialNo: string) {
    super(`DEVICE_NOT_BOUND: 设备 ${serialNo} 未绑定任何租户`)
    this.name = 'DeviceNotBoundError'
  }
}

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(`INVALID_REQUEST: ${message}`)
    this.name = 'InvalidRequestError'
  }
}
