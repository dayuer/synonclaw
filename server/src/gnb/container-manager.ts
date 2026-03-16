// @alpha: GNB 容器管理器 — 接口抽象 + Mock 实现
import type { IGnbContainerManager, GnbContainerConfig, ContainerStatus } from './types.js'

/** Mock 容器管理器 — 测试和原型阶段使用 */
export class MockContainerManager implements IGnbContainerManager {
  // @alpha: 记录操作日志供测试断言
  readonly operations: ContainerOperation[] = []
  private containers = new Map<string, ContainerStatus>()

  /** 模拟失败的租户 ID 集合 — 测试用 */
  failOnStart = new Set<string>()

  async start(tenantId: string, config: GnbContainerConfig): Promise<void> {
    if (this.failOnStart.has(tenantId)) {
      throw new Error(`容器启动失败: gnb-tenant-${tenantId}`)
    }
    this.containers.set(tenantId, 'RUNNING')
    this.operations.push({ type: 'START', tenantId, config })
  }

  async stop(tenantId: string): Promise<void> {
    this.containers.set(tenantId, 'STOPPED')
    this.operations.push({ type: 'STOP', tenantId })
  }

  async status(tenantId: string): Promise<ContainerStatus> {
    return this.containers.get(tenantId) ?? 'NOT_FOUND'
  }

  async remove(tenantId: string): Promise<void> {
    this.containers.delete(tenantId)
    this.operations.push({ type: 'REMOVE', tenantId })
  }
}

interface ContainerOperation {
  type: 'START' | 'STOP' | 'REMOVE'
  tenantId: string
  config?: GnbContainerConfig
}
