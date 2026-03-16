// @alpha: CommandDispatcher 单元测试 — 覆盖 BA 场景 3.x + B4
import { describe, it, expect, beforeEach } from 'vitest'
import { CommandDispatcher } from '../command-dispatcher.js'
import type { IDevicePusher } from '../command-dispatcher.js'
import { MemoryStore } from '../store.js'
import type { Device } from '../types.js'

/** Mock 推送器 — 控制推送成功/失败 */
class MockPusher implements IDevicePusher {
  shouldSucceed = true
  pushCount = 0

  async push(_vip: string, _port: number, _payload: string): Promise<boolean> {
    this.pushCount++
    return this.shouldSucceed
  }
}

describe('CommandDispatcher', () => {
  let store: MemoryStore
  let pusher: MockPusher
  let dispatcher: CommandDispatcher

  const device: Device = {
    serialNo: 'SN-001',
    hwFingerprint: 'fp-001',
    tenantId: 'tenant-1',
    vip: '10.1.0.10',
    gnbNodeId: 2001,
    passcode: 'A1B2C3D4',
    status: 'ONLINE',
    lastSeen: null,
    registeredAt: new Date(),
  }

  beforeEach(() => {
    store = new MemoryStore()
    pusher = new MockPusher()
    dispatcher = new CommandDispatcher(store, pusher)
    store.saveDevice(device)
  })

  describe('dispatch — 场景 3.1 设备在线', () => {
    it('推送成功，状态变为 DELIVERED', async () => {
      pusher.shouldSucceed = true

      const cmd = await dispatcher.dispatch('SN-001', 'config.patch', '{"key":"val"}')

      expect(cmd.status).toBe('DELIVERED')
      expect(cmd.deliveredAt).not.toBeNull()
      expect(pusher.pushCount).toBe(1)
    })
  })

  describe('dispatch — 场景 3.2 设备离线', () => {
    it('推送失败，状态变为 RETRY', async () => {
      pusher.shouldSucceed = false

      const cmd = await dispatcher.dispatch('SN-001', 'config.patch', '{"key":"val"}')

      expect(cmd.status).toBe('RETRY')
      expect(cmd.retryCount).toBe(1)
      expect(cmd.deliveredAt).toBeNull()
    })
  })

  describe('dispatch — 场景 3.3 超时 FAILED', () => {
    it('重试 48 次后标记 FAILED', async () => {
      pusher.shouldSucceed = false

      // 模拟 48 次失败
      const cmd = await dispatcher.dispatch('SN-001', 'config.patch', '{"key":"val"}')
      // 手动设置 retryCount 接近上限
      cmd.retryCount = 47
      cmd.status = 'RETRY'
      store.saveCommand(cmd)

      // 再尝试一次
      await dispatcher.retryPending('SN-001')

      const updated = store.getCommand(cmd.id)!
      expect(updated.status).toBe('FAILED')
      expect(updated.retryCount).toBe(48)
    })
  })

  describe('onHeartbeat — 心跳补发', () => {
    it('设备上线后补发积压指令', async () => {
      // 先让推送失败积压指令
      pusher.shouldSucceed = false
      await dispatcher.dispatch('SN-001', 'config.patch', '{"a":1}')
      await dispatcher.dispatch('SN-001', 'config.patch', '{"b":2}')

      expect(store.getPendingCommands('SN-001')).toHaveLength(2)

      // 心跳时推送成功
      pusher.shouldSucceed = true
      const delivered = await dispatcher.onHeartbeat('SN-001')

      expect(delivered).toBe(2)
      expect(store.getPendingCommands('SN-001')).toHaveLength(0)
    })

    it('更新设备 lastSeen 和 status', async () => {
      // @beta: lastSeen 设为 2 分钟前，避免被心跳去抖拦截
      device.lastSeen = new Date(Date.now() - 120_000)
      store.saveDevice(device)
      await dispatcher.onHeartbeat('SN-001')

      const updated = store.getDevice('SN-001')!
      expect(updated.status).toBe('ONLINE')
      // lastSeen 应已更新为当前时间
      expect(updated.lastSeen!.getTime()).toBeGreaterThan(Date.now() - 5000)
    })

    it('设备不存在时返回 0', async () => {
      const count = await dispatcher.onHeartbeat('NONEXISTENT')
      expect(count).toBe(0)
    })
  })

  describe('dispatch — 设备不存在', () => {
    it('推送失败但不抛异常', async () => {
      const cmd = await dispatcher.dispatch('NONEXISTENT', 'config.patch', '{}')
      expect(cmd.status).toBe('RETRY')
    })
  })
})
