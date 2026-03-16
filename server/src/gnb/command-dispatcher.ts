// @alpha: 指令分发器 — 管理指令生命周期和重试策略
import { randomUUID } from 'node:crypto'
import type { Command, CommandStatus } from './types.js'
import { GNB_CONFIG } from './types.js'
import type { IStore } from './store.js'

/** HTTP 推送器接口 — 后续对接实际网络请求 */
export interface IDevicePusher {
  push(deviceVip: string, port: number, payload: string): Promise<boolean>
}

export class CommandDispatcher {
  constructor(
    private readonly store: IStore,
    private readonly pusher: IDevicePusher,
  ) {}

  /** 创建并分发指令 */
  async dispatch(deviceSerialNo: string, type: string, payload: string): Promise<Command> {
    const command = this.createCommand(deviceSerialNo, type, payload)
    this.store.saveCommand(command)

    // 立即尝试推送
    await this.attemptPush(command)
    return command
  }

  /** 重试所有 RETRY 状态的指令 */
  async retryPending(deviceSerialNo: string): Promise<void> {
    const commands = this.store.getPendingCommands(deviceSerialNo)
    for (const cmd of commands) {
      await this.attemptPush(cmd)
    }
  }

  /** 心跳触发 — 检查并补发积压指令 */
  async onHeartbeat(deviceSerialNo: string): Promise<number> {
    const device = this.store.getDevice(deviceSerialNo)
    if (!device) return 0

    // @beta: B4 心跳去抖 — 60s 内不重复触发补发
    const now = new Date()
    if (device.lastSeen && (now.getTime() - device.lastSeen.getTime()) < GNB_CONFIG.HEARTBEAT_DEBOUNCE_MS) {
      return 0
    }

    // @alpha: 更新在线状态
    device.lastSeen = now
    device.status = 'ONLINE'
    this.store.saveDevice(device)

    // 补发积压指令
    const pending = this.store.getPendingCommands(deviceSerialNo)
    let delivered = 0
    for (const cmd of pending) {
      const success = await this.attemptPush(cmd)
      if (success) delivered++
    }
    return delivered
  }

  // --- 私有方法 ---

  private createCommand(
    deviceSerialNo: string,
    type: string,
    payload: string,
  ): Command {
    return {
      id: randomUUID(),
      deviceSerialNo,
      type,
      payload,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date(),
      lastAttemptAt: null,
      deliveredAt: null,
    }
  }

  private async attemptPush(command: Command): Promise<boolean> {
    const device = this.store.getDevice(command.deviceSerialNo)
    command.lastAttemptAt = new Date()

    if (device) {
      try {
        const success = await this.pusher.push(device.vip, 18789, command.payload)
        if (success) {
          command.status = 'DELIVERED'
          command.deliveredAt = new Date()
          this.store.saveCommand(command)
          return true
        }
      } catch {
        // 推送失败 — 进入重试
      }
    }

    command.retryCount++
    command.status = command.retryCount >= GNB_CONFIG.MAX_RETRIES ? 'FAILED' : 'RETRY'
    this.store.saveCommand(command)
    return false
  }
}
