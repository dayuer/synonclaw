// @alpha: DeviceRegistrar 集成测试 — 端到端注册流程
import { describe, it, expect, beforeEach } from 'vitest'
import { DeviceRegistrar, DeviceNotBoundError, InvalidRequestError } from '../device-registrar.js'
import { PasscodeManager } from '../passcode-manager.js'
import { TierEngine } from '../tier-engine.js'
import { MockContainerManager } from '../container-manager.js'
import { MemoryStore } from '../store.js'
import { GNB_CONFIG } from '../types.js'
import type { Tenant } from '../types.js'

describe('DeviceRegistrar', () => {
  let store: MemoryStore
  let registrar: DeviceRegistrar

  const setupTier1Tenant = (): Tenant => {
    const tenant: Tenant = {
      id: 'tenant-1',
      name: '小微企业',
      tier: 'TIER_1',
      networkId: 'shared',
      isPaid: false,
      createdAt: new Date(),
    }
    store.saveTenant(tenant)
    store.bindDeviceToTenant('SN-001', 'tenant-1')
    store.bindDeviceToTenant('SN-002', 'tenant-1')
    return tenant
  }

  const setupTier2Tenant = (): Tenant => {
    const pm = new PasscodeManager(store)
    const network = pm.createDedicatedNetwork('tenant-2')
    const tenant: Tenant = {
      id: 'tenant-2',
      name: '大企业',
      tier: 'TIER_2',
      networkId: network.id,
      isPaid: true,
      createdAt: new Date(),
    }
    store.saveTenant(tenant)
    store.bindDeviceToTenant('SN-T2-001', 'tenant-2')
    return tenant
  }

  beforeEach(() => {
    store = new MemoryStore()
    const pm = new PasscodeManager(store)
    pm.initSharedNetwork()
    const cm = new MockContainerManager()
    const te = new TierEngine(store, pm, cm)
    registrar = new DeviceRegistrar(store, pm, te)
  })

  describe('register — 场景 1.1 Tier 1', () => {
    it('返回共享 Passcode + VIP + nodeId', () => {
      setupTier1Tenant()

      const result = registrar.register({
        serialNo: 'SN-001',
        hwFingerprint: 'fp-001',
      })

      expect(result.passcode).toBe(GNB_CONFIG.SHARED_PASSCODE)
      expect(result.vip).toMatch(/^10\.1\./)
      expect(result.nodeId).toBeGreaterThanOrEqual(GNB_CONFIG.DEVICE_NODE_ID_MIN)
      expect(result.indexAddress).toBe(GNB_CONFIG.INDEX_ADDRESS)
      expect(result.saasVip).toBe(GNB_CONFIG.SHARED_SAAS_VIP)
    })
  })

  describe('register — 场景 1.2 Tier 2', () => {
    it('返回独立 Passcode + VIP', () => {
      setupTier2Tenant()

      const result = registrar.register({
        serialNo: 'SN-T2-001',
        hwFingerprint: 'fp-t2-001',
      })

      expect(result.passcode).not.toBe(GNB_CONFIG.SHARED_PASSCODE)
      expect(result.passcode).toHaveLength(8)
      expect(result.nodeId).toBeGreaterThanOrEqual(GNB_CONFIG.DEVICE_NODE_ID_MIN)
    })
  })

  describe('register — 场景 1.3 未绑定设备', () => {
    it('抛出 DeviceNotBoundError', () => {
      expect(() => registrar.register({
        serialNo: 'UNKNOWN',
        hwFingerprint: 'fp-unknown',
      })).toThrow(DeviceNotBoundError)
    })
  })

  describe('register — 场景 1.4 幂等性', () => {
    it('重复注册返回相同配置', () => {
      setupTier1Tenant()

      const first = registrar.register({ serialNo: 'SN-001', hwFingerprint: 'fp-001' })
      const second = registrar.register({ serialNo: 'SN-001', hwFingerprint: 'fp-001' })

      expect(first.vip).toBe(second.vip)
      expect(first.nodeId).toBe(second.nodeId)
      expect(first.passcode).toBe(second.passcode)
    })
  })

  describe('register — 场景 1.7 并发不冲突', () => {
    it('多台设备同一租户注册不冲突', () => {
      setupTier1Tenant()

      const r1 = registrar.register({ serialNo: 'SN-001', hwFingerprint: 'fp-001' })
      const r2 = registrar.register({ serialNo: 'SN-002', hwFingerprint: 'fp-002' })

      expect(r1.vip).not.toBe(r2.vip)
      expect(r1.nodeId).not.toBe(r2.nodeId)
    })
  })

  describe('register — 场景 1.8 参数校验', () => {
    it('缺少 serialNo 抛出 InvalidRequestError', () => {
      expect(() => registrar.register({
        serialNo: '',
        hwFingerprint: 'fp',
      })).toThrow(InvalidRequestError)
    })

    it('缺少 hwFingerprint 抛出 InvalidRequestError', () => {
      expect(() => registrar.register({
        serialNo: 'SN-001',
        hwFingerprint: '',
      })).toThrow(InvalidRequestError)
    })
  })
})
