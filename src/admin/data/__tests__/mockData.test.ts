// @alpha: TDD 测试 — 多租户数据模型 + Mock CRUD + RPC 翻译
import { describe, it, expect } from 'vitest'
import {
  PLAN_LIMITS, DEFAULT_RPC_CONFIG, PLAN_LABELS,
  MEMBER_ROLE_LABELS, MODEL_PROVIDER_LABELS, DEVICE_STATUS_LABELS,
  GNB_NODE_TYPE_LABELS, GNB_CRYPTO_TYPE_LABELS, GNB_KEY_UPDATE_LABELS,
  NAT_TYPE_LABELS, TUNNEL_STATUS_LABELS,
} from '../types'
import {
  getTenant,
  getDevices, getDeviceById, canAddDevice,
  addDevice, removeDevice,
  getMembers, getMemberById, addMember, removeMember,
  getDigitalWorkers, getDigitalWorkerById, getWorkersByMemberId,
  addDigitalWorker, assignWorkerToMember, removeDigitalWorker,
  getActivityLogs,
  getConversations, createConversation, addMessageToConversation,
  getStatCards, maskApiKey,
  getGnbTunnels, getGnbNetworkHealth, checkGnbCompliance, maskPasscode,
  getSystemInfo,
  registerGnbNode, updateGnbPasscode,
  getSubnets, addSubnet, removeSubnet, getSubnetMembers,
} from '../mockData'
import {
  translateConfigToCommands, validateRpcConfig,
} from '../rpcClient'

// ============================================
// 多租户数据模型
// ============================================

describe('多租户数据模型', () => {
  it('租户实体包含计划和配额', () => {
    const tenant = getTenant()
    expect(tenant.id).toBe('t1')
    expect(tenant.plan).toBe('pro')
    expect(tenant.maxDevices).toBe(PLAN_LIMITS.pro)
  })

  it('常量映射完整', () => {
    expect(PLAN_LABELS.basic).toBe('基础版')
    expect(PLAN_LABELS.enterprise).toBe('企业版')
    expect(MEMBER_ROLE_LABELS.admin).toBe('管理员')
    expect(MODEL_PROVIDER_LABELS.openai).toBe('OpenAI')
    expect(DEVICE_STATUS_LABELS.online).toBe('在线')
  })

  it('默认 RPC 配置包含 5 个插件', () => {
    expect(DEFAULT_RPC_CONFIG.plugins).toHaveLength(5)
    expect(DEFAULT_RPC_CONFIG.temperature).toBe(0.7)
    expect(DEFAULT_RPC_CONFIG.modelProvider).toBe('openai')
  })

  it('设备按 tenantId 过滤', () => {
    const tenantDevices = getDevices('t1')
    expect(tenantDevices.length).toBeGreaterThan(0)

    const otherDevices = getDevices('t999')
    expect(otherDevices).toHaveLength(0)
  })

  it('成员按 tenantId 过滤', () => {
    const tenantMembers = getMembers('t1')
    expect(tenantMembers.length).toBeGreaterThan(0)

    const otherMembers = getMembers('t999')
    expect(otherMembers).toHaveLength(0)
  })
})

// ============================================
// 设备托管
// ============================================

describe('设备托管', () => {
  it('查询设备列表', () => {
    const devices = getDevices()
    expect(devices.length).toBeGreaterThan(0)
    expect(devices[0]).toHaveProperty('tenantId')
    expect(devices[0]).toHaveProperty('rpcConfig')
  })

  it('按 ID 查询设备', () => {
    const device = getDeviceById('dev1')
    expect(device).toBeDefined()
    expect(device!.name).toBe('TF-RACK-01')
  })

  it('配额检查 — 未超限', () => {
    const result = canAddDevice()
    expect(result.current).toBeGreaterThan(0)
    expect(result.max).toBe(10) // pro 计划
  })

  it('设备移除后关联数字员工标记不可用', () => {
    // 创建临时设备和数字员工
    const device = addDevice({
      tenantId: 't1', name: 'TEST-DEV', customerId: 'c1',
      customerName: 'Test', productName: 'Test', token: 'test****test', endpoint: 'ws://test:3002',
    }) as unknown as { id: string; [key: string]: unknown }

    const worker = addDigitalWorker({
      tenantId: 't1', name: 'Test Worker', description: 'test',
      deviceId: device.id, deviceName: 'TEST-DEV',
      systemPrompt: 'test', plugins: [],
    })

    expect(getDigitalWorkerById(worker.id)?.status).toBe('active')

    removeDevice(device.id)

    // 验证关联的数字员工被标记为 inactive
    const updatedWorker = getDigitalWorkerById(worker.id)
    expect(updatedWorker?.status).toBe('inactive')

    // 清理
    removeDigitalWorker(worker.id)
  })
})

// ============================================
// RPC 配置
// ============================================

describe('RPC 配置', () => {
  it('GUI 操作翻译为正确的 RPC 指令', () => {
    const oldConfig = { ...DEFAULT_RPC_CONFIG, apiKey: 'old-key', plugins: DEFAULT_RPC_CONFIG.plugins.map(p => ({ ...p })) }
    const newConfig = {
      ...DEFAULT_RPC_CONFIG,
      modelProvider: 'anthropic' as const,
      apiKey: 'new-key',
      temperature: 0.9,
      plugins: DEFAULT_RPC_CONFIG.plugins.map(p => ({ ...p })),
    }

    const commands = translateConfigToCommands('dev1', oldConfig, newConfig)

    expect(commands.length).toBe(3) // provider + apiKey + temperature
    expect(commands[0].method).toBe('SET_MODEL_PROVIDER')
    expect(commands[1].method).toBe('SET_API_KEY')
    expect(commands[2].method).toBe('SET_TEMPERATURE')
  })

  it('无变更不生成 RPC 指令', () => {
    const config = { ...DEFAULT_RPC_CONFIG, apiKey: 'key', plugins: DEFAULT_RPC_CONFIG.plugins.map(p => ({ ...p })) }
    const commands = translateConfigToCommands('dev1', config, config)
    expect(commands).toHaveLength(0)
  })

  it('插件切换生成 TOGGLE_PLUGIN 指令', () => {
    const oldConfig = { ...DEFAULT_RPC_CONFIG, apiKey: 'key', plugins: DEFAULT_RPC_CONFIG.plugins.map(p => ({ ...p })) }
    const newConfig = {
      ...oldConfig,
      plugins: oldConfig.plugins.map((p, i) => i === 0 ? { ...p, enabled: true } : { ...p }),
    }

    const commands = translateConfigToCommands('dev1', oldConfig, newConfig)
    expect(commands).toHaveLength(1)
    expect(commands[0].method).toBe('TOGGLE_PLUGIN')
    expect(commands[0].params.pluginId).toBe('web_search')
  })

  it('温度范围校验 0.0~2.0', () => {
    const invalidConfig = { ...DEFAULT_RPC_CONFIG, apiKey: 'key', temperature: 3.0 }
    const errors = validateRpcConfig(invalidConfig)
    expect(errors.temperature).toBeDefined()
  })

  it('API Key 为空校验失败', () => {
    const errors = validateRpcConfig({ ...DEFAULT_RPC_CONFIG })
    expect(errors.apiKey).toBeDefined()
  })

  it('Max Tokens 范围校验', () => {
    const errors = validateRpcConfig({ ...DEFAULT_RPC_CONFIG, apiKey: 'key', maxTokens: 999999 })
    expect(errors.maxTokens).toBeDefined()
  })

  it('合法配置无错误', () => {
    const validConfig = { ...DEFAULT_RPC_CONFIG, apiKey: 'sk-valid-key', temperature: 0.7, maxTokens: 4096 }
    const errors = validateRpcConfig(validConfig)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('API Key 脱敏', () => {
    expect(maskApiKey('sk-proj-abcdefghijklmnop')).toBe('sk-pro****mnop')
    expect(maskApiKey('short')).toBe('****')
  })
})

// ============================================
// 数字员工管理
// ============================================

describe('数字员工管理', () => {
  it('查询数字员工列表', () => {
    const workers = getDigitalWorkers()
    expect(workers.length).toBeGreaterThan(0)
    expect(workers[0]).toHaveProperty('deviceId')
    expect(workers[0]).toHaveProperty('assignedMemberIds')
  })

  it('按成员 ID 查询已分配的数字员工', () => {
    const workers = getWorkersByMemberId('m2')
    expect(workers.length).toBeGreaterThan(0)
    // m2 被分配了 w1 和 w2
    const ids = workers.map(w => w.id)
    expect(ids).toContain('w1')
  })

  it('分配/取消分配成员', () => {
    // 创建临时员工
    const worker = addDigitalWorker({
      tenantId: 't1', name: 'Assign Test', description: 'test',
      deviceId: 'dev1', deviceName: 'TF-RACK-01',
      systemPrompt: 'test', plugins: [],
    })

    // 分配给 m2
    assignWorkerToMember(worker.id, ['m2'])
    const memberAfter = getMemberById('m2')
    expect(memberAfter?.assignedWorkerIds).toContain(worker.id)

    // 取消分配
    assignWorkerToMember(worker.id, [])
    const memberAfterCancel = getMemberById('m2')
    expect(memberAfterCancel?.assignedWorkerIds).not.toContain(worker.id)

    // 清理
    removeDigitalWorker(worker.id)
  })
})

// ============================================
// 成员使用界面
// ============================================

describe('成员使用界面', () => {
  it('成员仅看到已分配的数字员工', () => {
    const workers = getWorkersByMemberId('m3')
    // m3 仅分配了 w3（财务助手）
    expect(workers).toHaveLength(1)
    expect(workers[0].name).toBe('财务助手')
  })

  it('无分配的成员返回空列表', () => {
    const workers = getWorkersByMemberId('m1')
    // m1 是 admin，未分配数字员工
    expect(workers).toHaveLength(0)
  })

  it('创建对话和添加消息', () => {
    const conv = createConversation('m2', 'w1')
    expect(conv.memberId).toBe('m2')
    expect(conv.messages).toHaveLength(0)

    addMessageToConversation(conv.id, { role: 'user', content: '你好' })
    const updated = getConversations('m2').find(c => c.id === conv.id)
    expect(updated?.messages).toHaveLength(1)
    expect(updated?.messages[0].role).toBe('user')
  })
})

// ============================================
// RBAC 权限
// ============================================

describe('RBAC 权限', () => {
  it('成员有 admin 或 member 角色', () => {
    const adminMember = getMemberById('m1')
    expect(adminMember?.role).toBe('admin')

    const normalMember = getMemberById('m2')
    expect(normalMember?.role).toBe('member')
  })

  it('跨租户请求返回空', () => {
    const devices = getDevices('t999')
    expect(devices).toHaveLength(0)

    const workers = getDigitalWorkers('t999')
    expect(workers).toHaveLength(0)

    const members = getMembers('t999')
    expect(members).toHaveLength(0)
  })
})

// ============================================
// Dashboard
// ============================================

describe('Dashboard', () => {
  it('统计卡片正确计数（含活跃隧道）', () => {
    const cards = getStatCards()
    expect(cards).toHaveLength(5)
    expect(cards[0].label).toBe('托管设备')
    expect(cards[1].label).toBe('在线设备')
    expect(cards[2].label).toBe('活跃隧道')
    expect(cards[3].label).toBe('团队成员')
    expect(cards[4].label).toBe('数字员工')
  })

  it('活动日志按时间倒序', () => {
    const logs = getActivityLogs()
    expect(logs.length).toBeGreaterThan(0)
    // 检查排序
    for (let i = 1; i < logs.length; i++) {
      expect(logs[i - 1].timestamp >= logs[i].timestamp).toBe(true)
    }
  })
})

// ============================================
// 成员管理
// ============================================

describe('成员管理', () => {
  it('添加成员', () => {
    const before = getMembers().length
    const member = addMember({
      tenantId: 't1', name: 'Test User', email: 'test@test.com',
      department: '测试部', role: 'member',
    })
    expect(member.id).toBeDefined()
    expect(getMembers().length).toBe(before + 1)

    // 清理
    removeMember(member.id)
  })

  it('删除成员时清理分配关系', () => {
    const member = addMember({
      tenantId: 't1', name: 'Cleanup Test', email: 'cleanup@test.com',
      department: '测试', role: 'member',
    })

    // 分配一个数字员工
    assignWorkerToMember('w1', [...getDigitalWorkerById('w1')!.assignedMemberIds, member.id])

    // 删除成员
    removeMember(member.id)

    // 验证数字员工的分配关系已清理
    const worker = getDigitalWorkerById('w1')
    expect(worker?.assignedMemberIds).not.toContain(member.id)
  })
})

// ============================================
// GNB 网络数据
// ============================================

describe('GNB 网络数据', () => {
  it('设备包含 gnbConfig', () => {
    const devices = getDevices()
    for (const d of devices) {
      expect(d.gnbConfig).toBeDefined()
      expect(d.gnbConfig.uuid).toBeTruthy()
      expect(d.gnbConfig.virtualIp).toBeTruthy()
    }
  })

  it('隧道查询返回至少 3 条', () => {
    const tunnels = getGnbTunnels()
    expect(tunnels.length).toBeGreaterThanOrEqual(3)
  })

  it('隧道包含 active 和 degraded 状态', () => {
    const tunnels = getGnbTunnels()
    const statuses = tunnels.map(t => t.status)
    expect(statuses).toContain('active')
    expect(statuses).toContain('degraded')
  })

  it('GNB 常量映射完整', () => {
    expect(GNB_NODE_TYPE_LABELS.normal).toBe('普通节点')
    expect(GNB_NODE_TYPE_LABELS.index).toBe('Index 信令')
    expect(GNB_CRYPTO_TYPE_LABELS.arc4).toBe('ARC4')
    expect(GNB_KEY_UPDATE_LABELS.minute).toBe('每分钟')
    expect(NAT_TYPE_LABELS.full_cone).toBe('Full Cone')
    expect(TUNNEL_STATUS_LABELS.active).toBe('正常')
  })
})

// ============================================
// GNB 隧道健康
// ============================================

describe('GNB 隧道健康', () => {
  it('健康度计算正确', () => {
    const health = getGnbNetworkHealth()
    expect(health.totalTunnels).toBeGreaterThan(0)
    expect(health.activeTunnels).toBeLessThanOrEqual(health.totalTunnels)
    expect(health.avgLatency).toBeGreaterThanOrEqual(0)
  })

  it('平均延迟排除 down 隧道', () => {
    const health = getGnbNetworkHealth()
    // down 隧道 latency=0 不应拉低平均值
    expect(health.avgLatency).toBeGreaterThan(0)
  })
})

// ============================================
// GNB 安全校验
// ============================================

describe('GNB 安全校验', () => {
  it('Passcode 脱敏', () => {
    expect(maskPasscode('0xA7B3C9D1')).toBe('0xA7****D1')
    expect(maskPasscode('0x12')).toBe('****')
  })

  it('合规检查发现不合规设备', () => {
    const result = checkGnbCompliance()
    // dev5 keyUpdateInterval=none, dev6 cryptoType=none + keyUpdateInterval=none
    expect(result.compliant).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('系统信息含 GNB 健康指标', () => {
    const info = getSystemInfo()
    expect(info.gnbHealth).toBeGreaterThanOrEqual(0)
    expect(info.gnbHealth).toBeLessThanOrEqual(100)
    expect(info.avgLatency).toBeGreaterThanOrEqual(0)
  })
})

// ============================================
// GNB 节点注册
// ============================================

describe('GNB 节点注册', () => {
  it('注册成功返回新设备', () => {
    const before = getDevices().length
    const result = registerGnbNode({
      name: 'TEST-NODE-01',
      uuid: '00009001',
      virtualIp: '10.1.99.1',
      nodeType: 'normal',
      cryptoType: 'arc4',
      passcode: '0xTEST0001',
    })

    expect('error' in result).toBe(false)
    const device = result as ReturnType<typeof getDeviceById> & { id: string }
    expect(device.name).toBe('TEST-NODE-01')
    expect(device.gnbConfig.uuid).toBe('00009001')
    expect(device.status).toBe('online')
    expect(getDevices().length).toBe(before + 1)

    // 清理
    removeDevice(device.id)
  })

  it('UUID 重复返回错误', () => {
    const result = registerGnbNode({
      name: 'DUP-UUID',
      uuid: '00001001', // dev1 已用
      virtualIp: '10.1.99.2',
      nodeType: 'normal',
      cryptoType: 'arc4',
      passcode: '0xDUPTEST1',
    })

    expect('error' in result).toBe(true)
    expect((result as { error: string }).error).toContain('UUID')
  })

  it('虚拟 IP 重复返回错误', () => {
    const result = registerGnbNode({
      name: 'DUP-IP',
      uuid: '00009002',
      virtualIp: '10.1.0.1', // dev1 已用
      nodeType: 'normal',
      cryptoType: 'arc4',
      passcode: '0xDUPTEST2',
    })

    expect('error' in result).toBe(true)
    expect((result as { error: string }).error).toContain('IP')
  })
})

// ============================================
// GNB Passcode 更新
// ============================================

describe('GNB Passcode 更新', () => {
  it('更新成功', () => {
    const result = updateGnbPasscode('dev1', '0xNEWPASS1')
    expect('error' in result).toBe(false)
    const device = result as ReturnType<typeof getDeviceById> & { gnbConfig: { passcode: string } }
    expect(device.gnbConfig.passcode).toBe('0xNEWPASS1')

    // 还原
    updateGnbPasscode('dev1', '0xA7B3C9D1')
  })

  it('设备不存在返回错误', () => {
    const result = updateGnbPasscode('dev_nonexist', '0x12345678')
    expect('error' in result).toBe(true)
    expect((result as { error: string }).error).toContain('不存在')
  })
})

// ============================================
// 私域子网管理
// ============================================

describe('私域子网管理', () => {
  it('查询私域列表', () => {
    const subs = getSubnets()
    expect(subs.length).toBeGreaterThanOrEqual(2) // 2 条预置
  })

  it('创建私域', () => {
    const before = getSubnets().length
    const sub = addSubnet({
      name: '测试私域',
      cidr: '10.1.99.0/24',
      passcode: '0xTESTSUB1',
    })
    expect(sub.name).toBe('测试私域')
    expect(sub.cidr).toBe('10.1.99.0/24')
    expect(getSubnets().length).toBe(before + 1)

    // 清理
    removeSubnet(sub.id)
  })

  it('CIDR 匹配正确返回成员节点', () => {
    // sub1 CIDR 10.1.0.0/24，dev1~dev6 虚拟 IP 都在 10.1.0.x
    const members = getSubnetMembers('sub1')
    expect(members.length).toBeGreaterThan(0)
    for (const m of members) {
      expect(m.gnbConfig.virtualIp.startsWith('10.1.0.')).toBe(true)
    }
  })

  it('删除空私域成功', () => {
    const sub = addSubnet({
      name: '空私域',
      cidr: '10.99.99.0/24', // 无节点匹配
      passcode: '0xEMPTYSUB',
    })

    const result = removeSubnet(sub.id)
    expect(result).toBe(true)
  })

  it('删除非空私域拒绝', () => {
    // sub1 有成员节点
    const result = removeSubnet('sub1')
    expect(typeof result).toBe('object')
    expect((result as { error: string }).error).toContain('节点')
  })
})

