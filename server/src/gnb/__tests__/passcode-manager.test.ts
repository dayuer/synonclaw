// @alpha: PasscodeManager 单元测试 — 覆盖 BA 场景 1.1-1.8 + B1-B3
import { describe, it, expect, beforeEach } from 'vitest'
import { PasscodeManager } from '../passcode-manager.js'
import { MemoryStore } from '../store.js'
import { GNB_CONFIG } from '../types.js'

describe('PasscodeManager', () => {
  let store: MemoryStore
  let manager: PasscodeManager

  beforeEach(() => {
    store = new MemoryStore()
    manager = new PasscodeManager(store)
  })

  describe('initSharedNetwork', () => {
    it('创建共享网络并返回配置', () => {
      const network = manager.initSharedNetwork()

      expect(network.passcode).toBe(GNB_CONFIG.SHARED_PASSCODE)
      expect(network.subnetPrefix).toBe('10.1')
      expect(network.saasVip).toBe('10.1.0.1')
      expect(network.shared).toBe(true)
      expect(network.status).toBe('ACTIVE')
    })

    it('重复初始化返回已有网络（幂等）', () => {
      const first = manager.initSharedNetwork()
      const second = manager.initSharedNetwork()

      expect(first).toEqual(second)
    })
  })

  describe('allocateShared — 场景 1.1', () => {
    beforeEach(() => {
      manager.initSharedNetwork()
    })

    it('分配共享 Passcode + 唯一 VIP + 唯一 Node ID', () => {
      const result = manager.allocateShared()

      expect(result.passcode).toBe(GNB_CONFIG.SHARED_PASSCODE)
      expect(result.vip).toMatch(/^10\.1\.0\.\d+$/)
      expect(result.nodeId).toBeGreaterThanOrEqual(GNB_CONFIG.DEVICE_NODE_ID_MIN)
      expect(result.nodeId).toBeLessThanOrEqual(GNB_CONFIG.DEVICE_NODE_ID_MAX)
      expect(result.subnetPrefix).toBe('10.1')
      expect(result.saasVip).toBe('10.1.0.1')
    })

    it('连续分配不冲突 — 场景 1.7 (B1 并发安全)', () => {
      const results: ReturnType<typeof manager.allocateShared>[] = []
      for (let i = 0; i < 10; i++) {
        const alloc = manager.allocateShared()
        // 模拟 DeviceRegistrar 将分配结果写入 store
        store.saveDevice({
          serialNo: `SN-${i}`,
          hwFingerprint: `fp-${i}`,
          tenantId: 'tenant-test',
          vip: alloc.vip,
          gnbNodeId: alloc.nodeId,
          passcode: alloc.passcode,
          status: 'ONLINE',
          lastSeen: null,
          registeredAt: new Date(),
        })
        results.push(alloc)
      }
      const vips = results.map(r => r.vip)
      const nodeIds = results.map(r => r.nodeId)

      // VIP 唯一
      expect(new Set(vips).size).toBe(10)
      // Node ID 唯一
      expect(new Set(nodeIds).size).toBe(10)
    })

    it('共享网络未初始化时抛出异常', () => {
      const freshStore = new MemoryStore()
      const freshManager = new PasscodeManager(freshStore)

      expect(() => freshManager.allocateShared()).toThrow('共享网络未初始化')
    })
  })

  describe('createDedicatedNetwork — 场景 1.2', () => {
    it('生成独立 Passcode 和网段', () => {
      const network = manager.createDedicatedNetwork('tenant-42')

      expect(network.passcode).toHaveLength(8)
      expect(network.passcode).not.toBe(GNB_CONFIG.SHARED_PASSCODE)
      expect(network.subnetPrefix).toMatch(/^10\.\d+$/)
      expect(network.shared).toBe(false)
      expect(network.tenantId).toBe('tenant-42')
      expect(network.status).toBe('ACTIVE')
    })

    it('不同租户生成不同 Passcode — B2', () => {
      const net1 = manager.createDedicatedNetwork('tenant-a')
      const net2 = manager.createDedicatedNetwork('tenant-b')

      expect(net1.passcode).not.toBe(net2.passcode)
    })
  })

  describe('allocateFromNetwork', () => {
    it('从指定网络分配资源', () => {
      const network = manager.createDedicatedNetwork('tenant-x')
      const result = manager.allocateFromNetwork(network.id)

      expect(result.passcode).toBe(network.passcode)
      expect(result.vip).toContain(network.subnetPrefix)
      expect(result.subnetPrefix).toBe(network.subnetPrefix)
    })

    it('网络不存在时抛出异常', () => {
      expect(() => manager.allocateFromNetwork('nonexistent')).toThrow('不存在')
    })
  })
})
