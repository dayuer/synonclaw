// @alpha: 内存存储 — 后续替换为 PostgreSQL
import type {
  Tenant, Device, GnbNetwork, Command,
  DeviceStatus, CommandStatus, NetworkStatus,
} from './types.js'

/** 存储层接口 — 依赖倒置，方便替换 PG */
export interface IStore {
  // 租户
  getTenant(id: string): Tenant | undefined
  getTenantBySerialNo(serialNo: string): Tenant | undefined
  saveTenant(tenant: Tenant): void
  // 设备
  getDevice(serialNo: string): Device | undefined
  getDevicesByTenant(tenantId: string): Device[]
  saveDevice(device: Device): void
  countDevicesByTenant(tenantId: string): number
  // 网络
  getNetwork(id: string): GnbNetwork | undefined
  getNetworkByPasscode(passcode: string): GnbNetwork | undefined
  getSharedNetwork(): GnbNetwork | undefined
  saveNetwork(network: GnbNetwork): void
  // 指令
  getCommand(id: string): Command | undefined
  getPendingCommands(deviceSerialNo: string): Command[]
  saveCommand(command: Command): void
  // 分配池
  isVipAllocated(vip: string): boolean
  isNodeIdAllocated(nodeId: number): boolean
  // 设备-租户绑定（出厂预绑定）
  bindDeviceToTenant(serialNo: string, tenantId: string): void
}

/** 内存实现 — 测试和原型阶段使用 */
export class MemoryStore implements IStore {
  private tenants = new Map<string, Tenant>()
  private devices = new Map<string, Device>()
  private networks = new Map<string, GnbNetwork>()
  private commands = new Map<string, Command>()
  private serialToTenant = new Map<string, string>()

  getTenant(id: string) { return this.tenants.get(id) }

  getTenantBySerialNo(serialNo: string) {
    const tenantId = this.serialToTenant.get(serialNo)
    return tenantId ? this.tenants.get(tenantId) : undefined
  }

  saveTenant(tenant: Tenant) { this.tenants.set(tenant.id, tenant) }

  getDevice(serialNo: string) { return this.devices.get(serialNo) }

  getDevicesByTenant(tenantId: string): Device[] {
    return [...this.devices.values()].filter(d => d.tenantId === tenantId)
  }

  saveDevice(device: Device) { this.devices.set(device.serialNo, device) }

  countDevicesByTenant(tenantId: string): number {
    return this.getDevicesByTenant(tenantId).length
  }

  getNetwork(id: string) { return this.networks.get(id) }

  getNetworkByPasscode(passcode: string): GnbNetwork | undefined {
    return [...this.networks.values()].find(n => n.passcode === passcode)
  }

  getSharedNetwork(): GnbNetwork | undefined {
    return [...this.networks.values()].find(n => n.shared)
  }

  saveNetwork(network: GnbNetwork) { this.networks.set(network.id, network) }

  getCommand(id: string) { return this.commands.get(id) }

  getPendingCommands(deviceSerialNo: string): Command[] {
    return [...this.commands.values()]
      .filter(c => c.deviceSerialNo === deviceSerialNo && (c.status === 'PENDING' || c.status === 'RETRY'))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  saveCommand(command: Command) { this.commands.set(command.id, command) }

  isVipAllocated(vip: string): boolean {
    return [...this.devices.values()].some(d => d.vip === vip)
  }

  isNodeIdAllocated(nodeId: number): boolean {
    return [...this.devices.values()].some(d => d.gnbNodeId === nodeId)
  }

  bindDeviceToTenant(serialNo: string, tenantId: string) {
    this.serialToTenant.set(serialNo, tenantId)
  }
}
