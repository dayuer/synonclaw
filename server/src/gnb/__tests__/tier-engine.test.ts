// @alpha: TierEngine 单元测试 — 覆盖 BA 场景 2.x + 4.x
import { describe, it, expect, beforeEach } from 'vitest'
import { TierEngine, UpgradeConflictError } from '../tier-engine.js'
import { PasscodeManager } from '../passcode-manager.js'
import { MockContainerManager } from '../container-manager.js'
import { MemoryStore } from '../store.js'
import type { Tenant, Device } from '../types.js'

describe('TierEngine', () => {
  let store: MemoryStore
  let passcodeManager: PasscodeManager
  let containerManager: MockContainerManager
  let engine: TierEngine

  const makeTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
    id: 'tenant-1',
    name: '测试租户',
    tier: 'TIER_1',
    networkId: 'shared',
    isPaid: false,
    createdAt: new Date(),
    ...overrides,
  })

  const makeDevice = (serialNo: string, status: 'ONLINE' | 'OFFLINE' = 'ONLINE'): Device => ({
    serialNo,
    hwFingerprint: `fp-${serialNo}`,
    tenantId: 'tenant-1',
    vip: `10.1.0.${10 + parseInt(serialNo.slice(-1))}`,
    gnbNodeId: 2001 + parseInt(serialNo.slice(-1)),
    passcode: 'A1B2C3D4',
    status,
    lastSeen: status === 'ONLINE' ? new Date() : null,
    registeredAt: new Date(),
  })

  beforeEach(() => {
    store = new MemoryStore()
    passcodeManager = new PasscodeManager(store)
    containerManager = new MockContainerManager()
    engine = new TierEngine(store, passcodeManager, containerManager)

    passcodeManager.initSharedNetwork()
  })

  describe('determineTier', () => {
    it('付费客户直接返回 TIER_2', () => {
      const tenant = makeTenant({ isPaid: true })
      expect(engine.determineTier(tenant)).toBe('TIER_2')
    })

    it('设备数 ≤ 5 返回 TIER_1', () => {
      const tenant = makeTenant()
      store.saveTenant(tenant)
      // 添加 3 台设备
      for (let i = 0; i < 3; i++) {
        store.saveDevice(makeDevice(`dev-${i}`))
      }
      expect(engine.determineTier(tenant)).toBe('TIER_1')
    })

    it('设备数 > 5 返回 TIER_2', () => {
      const tenant = makeTenant()
      store.saveTenant(tenant)
      for (let i = 0; i < 6; i++) {
        store.saveDevice(makeDevice(`dev-${i}`))
      }
      expect(engine.determineTier(tenant)).toBe('TIER_2')
    })
  })

  describe('upgradeTier — 场景 4.1', () => {
    it('Tier 1 → Tier 2 升级：生成独立网络 + 迁移在线设备', async () => {
      const tenant = makeTenant()
      store.saveTenant(tenant)

      const device1 = makeDevice('dev-1', 'ONLINE')
      const device2 = makeDevice('dev-2', 'ONLINE')
      store.saveDevice(device1)
      store.saveDevice(device2)

      const result = await engine.upgradeTier('tenant-1')

      // 新网络已创建
      expect(result.newNetwork.shared).toBe(false)
      expect(result.newNetwork.tenantId).toBe('tenant-1')
      expect(result.newNetwork.passcode).not.toBe('A1B2C3D4')

      // 在线设备已迁移
      expect(result.migratedDevices).toHaveLength(2)
      expect(result.pendingDevices).toHaveLength(0)

      // 容器已启动
      expect(containerManager.operations).toHaveLength(1)
      expect(containerManager.operations[0].type).toBe('START')

      // 租户状态已更新
      const updated = store.getTenant('tenant-1')!
      expect(updated.tier).toBe('TIER_2')
      expect(updated.networkId).toBe(result.newNetwork.id)
    })
  })

  describe('upgradeTier — 场景 4.2 部分在线', () => {
    it('离线设备标记 PENDING_MIGRATION', async () => {
      const tenant = makeTenant()
      store.saveTenant(tenant)

      store.saveDevice(makeDevice('dev-1', 'ONLINE'))
      store.saveDevice(makeDevice('dev-2', 'OFFLINE'))

      const result = await engine.upgradeTier('tenant-1')

      expect(result.migratedDevices).toHaveLength(1)
      expect(result.pendingDevices).toHaveLength(1)
      expect(result.pendingDevices[0].status).toBe('PENDING_MIGRATION')
    })
  })

  describe('upgradeTier — 场景 4.3 幂等', () => {
    it('已是 Tier 2 的租户返回 UpgradeConflictError', async () => {
      const tenant = makeTenant({ tier: 'TIER_2' })
      store.saveTenant(tenant)

      await expect(engine.upgradeTier('tenant-1'))
        .rejects.toThrow(UpgradeConflictError)
    })
  })

  describe('upgradeTier — 租户不存在', () => {
    it('抛出错误', async () => {
      await expect(engine.upgradeTier('nonexistent'))
        .rejects.toThrow('不存在')
    })
  })
})
