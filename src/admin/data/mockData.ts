// @alpha: Mock 数据层 — 模拟全部业务数据 + CRUD 操作函数

import type {
  Product, Customer, Order, Developer, Device,
  StatCard, SystemInfo, OrderStatus, CertLevel,
  Tenant, TenantMember, DigitalWorker, ActivityLog,
  Conversation, ChatMessage, RpcConfig,
  GnbTunnel, GnbNodeConfig, Subnet,
} from './types'
import {
  ORDER_STATUS_FLOW, PLAN_LIMITS, DEFAULT_RPC_CONFIG,
} from './types'

// ============================================
// 默认租户
// ============================================

// @alpha: 单租户 Mock — 所有数据归属此租户
const DEFAULT_TENANT_ID = 't1'

const tenant: Tenant = {
  id: DEFAULT_TENANT_ID,
  name: '深圳腾飞科技有限公司',
  plan: 'pro',
  maxDevices: PLAN_LIMITS.pro,
  createdAt: '2026-01-01',
}

export const getTenant = (): Tenant => ({ ...tenant })
export const getDefaultTenantId = (): string => DEFAULT_TENANT_ID

// ============================================
// 产品数据（保留）
// ============================================

let products: Product[] = [
  {
    id: 'p1', name: 'SynonClaw Desk Pro', type: 'desktop',
    specs: 'AMD Ryzen 9 / 64GB DDR5 / RTX 4090',
    price: 29999, status: 'active',
    description: '旗舰桌面级算力终端，搭载高品质金属外壳，适合管理层桌面部署。',
    createdAt: '2026-01-15',
  },
  {
    id: 'p2', name: 'SynonClaw Desk Lite', type: 'desktop',
    specs: 'AMD Ryzen 7 / 32GB DDR5 / RTX 4070',
    price: 15999, status: 'active',
    description: '高性价比桌面终端，适合开发者和小型工作室边缘算力需求。',
    createdAt: '2026-01-20',
  },
  {
    id: 'p3', name: 'SynonClaw Rack X1', type: 'rack',
    specs: '4U 机架 / 支持 8 块热插拔板卡 / 冗余电源',
    price: 199999, status: 'active',
    description: '企业级模块化机柜，支持热插拔扩容，插入板卡即增加数字员工。',
    createdAt: '2026-02-01',
  },
  {
    id: 'p4', name: 'SynonClaw Rack X2', type: 'rack',
    specs: '8U 机架 / 支持 16 块热插拔板卡 / 双路冗余',
    price: 389999, status: 'inactive',
    description: '大型企业级机柜，双倍扩展槽位，适合中大型企业集中部署。',
    createdAt: '2026-02-10',
  },
]

// ============================================
// 客户数据（保留）
// ============================================

let customers: Customer[] = [
  {
    id: 'c1', name: '深圳腾飞科技有限公司', contact: '张伟',
    email: 'zhang@tengfei.com', type: 'ToB', status: 'signed',
    deviceCount: 12, industry: '金融科技', createdAt: '2026-01-10',
  },
  {
    id: 'c2', name: '杭州云启信息技术公司', contact: '李娜',
    email: 'lina@yunqi.cn', type: 'ToB', status: 'signed',
    deviceCount: 8, industry: '电子商务', createdAt: '2026-01-18',
  },
  {
    id: 'c3', name: '北京智源研究院', contact: '陈明',
    email: 'chenming@zhiyuan.org', type: 'ToB', status: 'lead',
    deviceCount: 0, industry: '人工智能', createdAt: '2026-02-05',
  },
  {
    id: 'c4', name: '王小明工作室', contact: '王小明',
    email: 'xiaoming@dev.me', type: 'ToC', status: 'signed',
    deviceCount: 2, industry: '独立开发', createdAt: '2026-02-12',
  },
  {
    id: 'c5', name: '上海星辰物流集团', contact: '赵丽',
    email: 'zhaoli@starlog.com', type: 'ToB', status: 'churned',
    deviceCount: 0, industry: '物流运输', createdAt: '2025-11-20',
  },
  {
    id: 'c6', name: '广州医路通健康科技', contact: '刘洋',
    email: 'liuyang@yilutong.com', type: 'ToB', status: 'lead',
    deviceCount: 0, industry: '医疗健康', createdAt: '2026-03-01',
  },
]

// ============================================
// 订单数据（保留）
// ============================================

let orders: Order[] = [
  {
    id: 'o1', orderNo: 'ORD-2026-0001',
    customerId: 'c1', customerName: '深圳腾飞科技有限公司',
    productId: 'p3', productName: 'SynonClaw Rack X1',
    quantity: 2, amount: 399998, status: 'completed',
    statusHistory: [
      { status: 'pending', timestamp: '2026-01-12 09:00', note: '订单创建' },
      { status: 'producing', timestamp: '2026-01-13 14:00', note: '确认生产' },
      { status: 'shipped', timestamp: '2026-02-01 10:00', note: '深圳仓发货' },
      { status: 'completed', timestamp: '2026-02-03 16:00', note: '客户签收' },
    ],
    createdAt: '2026-01-12',
  },
  {
    id: 'o2', orderNo: 'ORD-2026-0002',
    customerId: 'c2', customerName: '杭州云启信息技术公司',
    productId: 'p3', productName: 'SynonClaw Rack X1',
    quantity: 1, amount: 199999, status: 'shipped',
    statusHistory: [
      { status: 'pending', timestamp: '2026-01-20 11:00', note: '订单创建' },
      { status: 'producing', timestamp: '2026-01-21 09:00', note: '确认生产' },
      { status: 'shipped', timestamp: '2026-02-15 14:00', note: '杭州仓发货' },
    ],
    createdAt: '2026-01-20',
  },
  {
    id: 'o3', orderNo: 'ORD-2026-0003',
    customerId: 'c4', customerName: '王小明工作室',
    productId: 'p1', productName: 'SynonClaw Desk Pro',
    quantity: 2, amount: 59998, status: 'producing',
    statusHistory: [
      { status: 'pending', timestamp: '2026-02-20 10:00', note: '订单创建' },
      { status: 'producing', timestamp: '2026-02-21 11:00', note: '确认生产' },
    ],
    createdAt: '2026-02-20',
  },
  {
    id: 'o4', orderNo: 'ORD-2026-0004',
    customerId: 'c1', customerName: '深圳腾飞科技有限公司',
    productId: 'p2', productName: 'SynonClaw Desk Lite',
    quantity: 10, amount: 159990, status: 'pending',
    statusHistory: [
      { status: 'pending', timestamp: '2026-03-10 09:00', note: '订单创建' },
    ],
    createdAt: '2026-03-10',
  },
  {
    id: 'o5', orderNo: 'ORD-2026-0005',
    customerId: 'c6', customerName: '广州医路通健康科技',
    productId: 'p3', productName: 'SynonClaw Rack X1',
    quantity: 1, amount: 199999, status: 'pending',
    statusHistory: [
      { status: 'pending', timestamp: '2026-03-12 15:00', note: '订单创建' },
    ],
    createdAt: '2026-03-12',
  },
]

// ============================================
// 开发者数据（保留）
// ============================================

let developers: Developer[] = [
  {
    id: 'd1', name: '林浩', school: '浙江大学',
    skills: ['React', 'TypeScript', 'Node.js', 'Python'],
    certLevel: 'senior', status: 'active', taskCount: 23,
    certHistory: [
      { level: 'junior', timestamp: '2025-09-01', note: '通过初级认证' },
      { level: 'mid', timestamp: '2025-12-15', note: '通过中级认证' },
      { level: 'senior', timestamp: '2026-02-20', note: '通过高级认证' },
    ],
    taskRecords: [
      { id: 't1', title: '腾飞科技 CRM 集成', status: 'completed', completedAt: '2026-02-28' },
      { id: 't2', title: '云启飞书机器人开发', status: 'in-progress', completedAt: '' },
    ],
    joinedAt: '2025-09-01',
  },
  {
    id: 'd2', name: '陈雨萱', school: '北京邮电大学',
    skills: ['Vue', 'Java', 'Spring Boot'],
    certLevel: 'mid', status: 'active', taskCount: 12,
    certHistory: [
      { level: 'junior', timestamp: '2025-10-10', note: '通过初级认证' },
      { level: 'mid', timestamp: '2026-01-08', note: '通过中级认证' },
    ],
    taskRecords: [
      { id: 't3', title: '智源数据清洗工具', status: 'completed', completedAt: '2026-01-30' },
    ],
    joinedAt: '2025-10-10',
  },
  {
    id: 'd3', name: '赵子龙', school: '华中科技大学',
    skills: ['Python', 'TensorFlow', 'Docker'],
    certLevel: 'junior', status: 'active', taskCount: 5,
    certHistory: [
      { level: 'junior', timestamp: '2026-01-15', note: '通过初级认证' },
    ],
    taskRecords: [],
    joinedAt: '2026-01-15',
  },
  {
    id: 'd4', name: '孙悦', school: '电子科技大学',
    skills: ['Rust', 'Go', 'Kubernetes', 'Linux'],
    certLevel: 'senior', status: 'inactive', taskCount: 18,
    certHistory: [
      { level: 'junior', timestamp: '2025-06-01', note: '通过初级认证' },
      { level: 'mid', timestamp: '2025-09-20', note: '通过中级认证' },
      { level: 'senior', timestamp: '2025-12-01', note: '通过高级认证' },
    ],
    taskRecords: [
      { id: 't4', title: '星辰物流调度引擎', status: 'completed', completedAt: '2025-11-15' },
      { id: 't5', title: 'OpenClaw 本地部署优化', status: 'cancelled', completedAt: '' },
    ],
    joinedAt: '2025-06-01',
  },
]

// ============================================
// 设备数据（扩展：增加 tenantId + rpcConfig）
// ============================================

// @alpha: 设备 RPC 配置工厂
const makeRpcConfig = (overrides: Partial<RpcConfig> = {}): RpcConfig => ({
  ...DEFAULT_RPC_CONFIG,
  plugins: DEFAULT_RPC_CONFIG.plugins.map(p => ({ ...p })),
  ...overrides,
})

// @alpha: GNB 节点配置工厂
const makeGnbConfig = (overrides: Partial<GnbNodeConfig> = {}): GnbNodeConfig => ({
  uuid: '00000000',
  virtualIp: '10.1.0.0',
  publicKey: 'a'.repeat(64),
  nodeType: 'normal',
  cryptoType: 'arc4',
  keyUpdateInterval: 'minute',
  passcode: '0xA7B3C9D1',
  ntpSynced: true,
  natType: 'full_cone',
  ...overrides,
})

let devices: Device[] = [
  {
    id: 'dev1', tenantId: DEFAULT_TENANT_ID, name: 'TF-RACK-01',
    customerId: 'c1', customerName: '深圳腾飞科技有限公司',
    productName: 'SynonClaw Rack X1', token: 'oc_tf_****a3f8',
    endpoint: 'ws://10.0.1.10:3002', status: 'online', agentCount: 6,
    uptime: '28 天 12 小时', lastSeen: '2026-03-15 22:00', registeredAt: '2026-02-05',
    rpcConfig: makeRpcConfig({ modelProvider: 'openai', apiKey: 'sk-proj-****abcd', temperature: 0.7, systemPrompt: '你是腾飞科技的 AI 助手。' }),
    gnbConfig: makeGnbConfig({ uuid: '00001001', virtualIp: '10.1.0.1', publicKey: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd', nodeType: 'normal', natType: 'full_cone' }),
  },
  {
    id: 'dev2', tenantId: DEFAULT_TENANT_ID, name: 'TF-RACK-02',
    customerId: 'c1', customerName: '深圳腾飞科技有限公司',
    productName: 'SynonClaw Rack X1', token: 'oc_tf_****b7e2',
    endpoint: 'ws://10.0.1.11:3002', status: 'online', agentCount: 4,
    uptime: '28 天 12 小时', lastSeen: '2026-03-15 22:00', registeredAt: '2026-02-05',
    rpcConfig: makeRpcConfig({ modelProvider: 'anthropic', apiKey: 'sk-ant-****efgh', temperature: 0.5 }),
    gnbConfig: makeGnbConfig({ uuid: '00001002', virtualIp: '10.1.0.2', publicKey: 'b2c3d4e5f6789012345678901234567890123456789012345678901234bcde', nodeType: 'index', natType: 'restricted_cone' }),
  },
  {
    id: 'dev3', tenantId: DEFAULT_TENANT_ID, name: 'YQ-RACK-01',
    customerId: 'c2', customerName: '杭州云启信息技术公司',
    productName: 'SynonClaw Rack X1', token: 'oc_yq_****c1d9',
    endpoint: 'ws://172.16.0.50:3002', status: 'online', agentCount: 3,
    uptime: '15 天 6 小时', lastSeen: '2026-03-15 21:55', registeredAt: '2026-02-18',
    rpcConfig: makeRpcConfig({ modelProvider: 'deepseek', apiKey: 'sk-ds-****ijkl' }),
    gnbConfig: makeGnbConfig({ uuid: '00001003', virtualIp: '10.1.0.3', publicKey: 'c3d4e5f6789012345678901234567890123456789012345678901234cdef', nodeType: 'normal', cryptoType: 'xor', keyUpdateInterval: 'hour', natType: 'port_restricted' }),
  },
  {
    id: 'dev4', tenantId: DEFAULT_TENANT_ID, name: 'XM-DESK-01',
    customerId: 'c4', customerName: '王小明工作室',
    productName: 'SynonClaw Desk Pro', token: 'oc_xm_****d4f0',
    endpoint: 'ws://192.168.1.100:3002', status: 'online', agentCount: 2,
    uptime: '10 天 3 小时', lastSeen: '2026-03-15 21:50', registeredAt: '2026-03-01',
    rpcConfig: makeRpcConfig({ modelProvider: 'openai', apiKey: 'sk-proj-****mnop' }),
    gnbConfig: makeGnbConfig({ uuid: '00001004', virtualIp: '10.1.0.4', publicKey: 'd4e5f6789012345678901234567890123456789012345678901234defg', nodeType: 'normal', natType: 'symmetric' }),
  },
  {
    id: 'dev5', tenantId: DEFAULT_TENANT_ID, name: 'XM-DESK-02',
    customerId: 'c4', customerName: '王小明工作室',
    productName: 'SynonClaw Desk Pro', token: 'oc_xm_****e5a1',
    endpoint: 'ws://192.168.1.101:3002', status: 'offline', agentCount: 0,
    uptime: '—', lastSeen: '2026-03-14 18:30', registeredAt: '2026-03-01',
    rpcConfig: makeRpcConfig(),
    gnbConfig: makeGnbConfig({ uuid: '00001005', virtualIp: '10.1.0.5', publicKey: 'e5f6789012345678901234567890123456789012345678901234efgh', nodeType: 'normal', keyUpdateInterval: 'none', ntpSynced: false, natType: 'unknown' }),
  },
  {
    id: 'dev6', tenantId: DEFAULT_TENANT_ID, name: 'TF-DESK-01',
    customerId: 'c1', customerName: '深圳腾飞科技有限公司',
    productName: 'SynonClaw Desk Lite', token: 'oc_tf_****f6b2',
    endpoint: 'ws://10.0.2.20:3002', status: 'error', agentCount: 0,
    uptime: '—', lastSeen: '2026-03-15 08:12', registeredAt: '2026-02-20',
    rpcConfig: makeRpcConfig(),
    gnbConfig: makeGnbConfig({ uuid: '00001006', virtualIp: '10.1.0.6', publicKey: 'f6789012345678901234567890123456789012345678901234fghi', nodeType: 'forward', cryptoType: 'none', keyUpdateInterval: 'none', passcode: '0xFFFCFFFE' }),
  },
]

// ============================================
// 租户成员数据（新增）
// ============================================

let members: TenantMember[] = [
  {
    id: 'm1', tenantId: DEFAULT_TENANT_ID, name: '张伟', email: 'zhang@tengfei.com',
    department: '技术部', role: 'admin', assignedWorkerIds: [], createdAt: '2026-01-01',
  },
  {
    id: 'm2', tenantId: DEFAULT_TENANT_ID, name: '李明', email: 'liming@tengfei.com',
    department: '研发部', role: 'member', assignedWorkerIds: ['w1', 'w2'], createdAt: '2026-01-15',
  },
  {
    id: 'm3', tenantId: DEFAULT_TENANT_ID, name: '王芳', email: 'wangfang@tengfei.com',
    department: '财务部', role: 'member', assignedWorkerIds: ['w3'], createdAt: '2026-02-01',
  },
  {
    id: 'm4', tenantId: DEFAULT_TENANT_ID, name: '刘洋', email: 'liuyang@tengfei.com',
    department: '产品部', role: 'member', assignedWorkerIds: ['w1'], createdAt: '2026-02-10',
  },
]

// ============================================
// 数字员工数据（新增）
// ============================================

let digitalWorkers: DigitalWorker[] = [
  {
    id: 'w1', tenantId: DEFAULT_TENANT_ID, name: '代码助手',
    description: '精通多种编程语言的全栈开发助手，擅长代码审查、重构和架构设计。',
    deviceId: 'dev1', deviceName: 'TF-RACK-01',
    systemPrompt: '你是一位资深全栈开发工程师，精通 TypeScript、Python、Go。专注于代码质量、性能优化和最佳实践。',
    plugins: ['web_search', 'code_exec', 'file_mgmt'],
    assignedMemberIds: ['m2', 'm4'], status: 'active', createdAt: '2026-02-10',
  },
  {
    id: 'w2', tenantId: DEFAULT_TENANT_ID, name: '数据分析师',
    description: '擅长数据处理、统计分析和可视化的 AI 分析师。',
    deviceId: 'dev2', deviceName: 'TF-RACK-02',
    systemPrompt: '你是一位数据分析专家，精通 SQL、Python、Excel。擅长数据清洗、统计分析和业务洞察。',
    plugins: ['code_exec', 'file_mgmt'],
    assignedMemberIds: ['m2'], status: 'active', createdAt: '2026-02-15',
  },
  {
    id: 'w3', tenantId: DEFAULT_TENANT_ID, name: '财务助手',
    description: '协助处理日常财务工作，包括报表生成、预算分析和报销审核。',
    deviceId: 'dev3', deviceName: 'YQ-RACK-01',
    systemPrompt: '你是一位专业的财务助手，精通中国企业财务制度和会计准则。帮助处理报表、预算和审计工作。',
    plugins: ['file_mgmt', 'calendar'],
    assignedMemberIds: ['m3'], status: 'active', createdAt: '2026-02-20',
  },
]

// ============================================
// 活动日志数据（新增）
// ============================================

let activityLogs: ActivityLog[] = [
  { id: 'al1', tenantId: DEFAULT_TENANT_ID, type: 'device_added', message: '设备 TF-RACK-01 已接入托管', timestamp: '2026-02-05 10:00' },
  { id: 'al2', tenantId: DEFAULT_TENANT_ID, type: 'device_added', message: '设备 TF-RACK-02 已接入托管', timestamp: '2026-02-05 10:30' },
  { id: 'al3', tenantId: DEFAULT_TENANT_ID, type: 'worker_created', message: '数字员工「代码助手」已创建', timestamp: '2026-02-10 14:00' },
  { id: 'al4', tenantId: DEFAULT_TENANT_ID, type: 'member_added', message: '成员 李明 已加入团队', timestamp: '2026-01-15 09:00' },
  { id: 'al5', tenantId: DEFAULT_TENANT_ID, type: 'config_changed', message: 'TF-RACK-01 模型切换为 OpenAI GPT-4', timestamp: '2026-03-10 16:00' },
  { id: 'al6', tenantId: DEFAULT_TENANT_ID, type: 'conversation', message: '李明 与「代码助手」完成 3 轮对话', timestamp: '2026-03-15 11:00' },
]

// ============================================
// 对话数据（新增）
// ============================================

let conversations: Conversation[] = [
  {
    id: 'conv1', tenantId: DEFAULT_TENANT_ID,
    memberId: 'm2', workerId: 'w1', workerName: '代码助手',
    messages: [
      { id: 'msg1', role: 'user', content: '帮我审查一下这段 TypeScript 代码的类型安全性', timestamp: '2026-03-15 10:30' },
      { id: 'msg2', role: 'assistant', content: '好的，请把代码发给我，我会从类型推断、泛型使用和潜在的 any 类型逃逸入口三个维度进行审查。', timestamp: '2026-03-15 10:31' },
    ],
    createdAt: '2026-03-15 10:30', updatedAt: '2026-03-15 10:31',
  },
  {
    id: 'conv2', tenantId: DEFAULT_TENANT_ID,
    memberId: 'm3', workerId: 'w3', workerName: '财务助手',
    messages: [
      { id: 'msg3', role: 'user', content: '帮我生成本月的部门预算报表', timestamp: '2026-03-14 09:00' },
      { id: 'msg4', role: 'assistant', content: '收到。我将根据上月数据和本月预算目标为您生成预算报表。请确认需要包含哪些部门？', timestamp: '2026-03-14 09:01' },
      { id: 'msg5', role: 'user', content: '所有部门都要', timestamp: '2026-03-14 09:02' },
      { id: 'msg6', role: 'assistant', content: '好的，正在生成全部门预算报表，预计 2 分钟完成。', timestamp: '2026-03-14 09:02' },
    ],
    createdAt: '2026-03-14 09:00', updatedAt: '2026-03-14 09:02',
  },
]

// ============================================
// GNB 隧道数据（新增）
// ============================================

// @alpha: 隧道 Mock 数据 — 4 条隧道，涵盖 active/degraded/down 三态
const gnbTunnels: GnbTunnel[] = [
  {
    id: 'tun1', sourceNodeId: 'dev1', sourceNodeName: 'TF-RACK-01',
    targetNodeId: 'dev2', targetNodeName: 'TF-RACK-02',
    latency: 12, packetLoss: 0.1, uptime: '28 天',
    cryptoType: 'arc4', status: 'active',
  },
  {
    id: 'tun2', sourceNodeId: 'dev1', sourceNodeName: 'TF-RACK-01',
    targetNodeId: 'dev3', targetNodeName: 'YQ-RACK-01',
    latency: 45, packetLoss: 0.5, uptime: '15 天',
    cryptoType: 'arc4', status: 'active',
  },
  {
    id: 'tun3', sourceNodeId: 'dev2', sourceNodeName: 'TF-RACK-02',
    targetNodeId: 'dev4', targetNodeName: 'XM-DESK-01',
    latency: 250, packetLoss: 8.2, uptime: '10 天',
    cryptoType: 'xor', status: 'degraded',
  },
  {
    id: 'tun4', sourceNodeId: 'dev3', sourceNodeName: 'YQ-RACK-01',
    targetNodeId: 'dev5', targetNodeName: 'XM-DESK-02',
    latency: 0, packetLoss: 100, uptime: '—',
    cryptoType: 'arc4', status: 'down',
  },
]

// ============================================
// 私域子网数据（新增）
// ============================================

// @alpha: 私域 CIDR 匹配工具 — 判断 IP 是否属于 CIDR 段
const ipToCidrMatch = (ip: string, cidr: string): boolean => {
  const [cidrIp, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr, 10)
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false

  const ipToNum = (addr: string): number => {
    const parts = addr.split('.').map(Number)
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  }

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  return (ipToNum(ip) & mask) === (ipToNum(cidrIp) & mask)
}

let subnets: Subnet[] = [
  {
    id: 'sub1',
    name: '深圳办公网络',
    cidr: '10.1.0.0/24',
    passcode: '0xAA11BB22',
    createdAt: '2026-02-01',
  },
  {
    id: 'sub2',
    name: '杭州分支网络',
    cidr: '10.1.1.0/24',
    passcode: '0xCC33DD44',
    createdAt: '2026-02-15',
  },
]

// ============================================
// 系统信息
// ============================================

const systemInfo: SystemInfo = {
  version: '2.0.0-beta',
  environment: 'Production',
  buildTime: '2026-03-15 10:00:00',
  nodeCount: devices.length,
  onlineRate: Math.round(devices.filter(d => d.status === 'online').length / devices.length * 1000) / 10,
  apiCalls: 128456,
  uptime: '32 天 14 小时',
  lastBackup: '2026-03-15 04:00:00',
  gnbHealth: Math.round(gnbTunnels.filter(t => t.status === 'active').length / gnbTunnels.length * 100),
  avgLatency: Math.round(gnbTunnels.filter(t => t.status !== 'down').reduce((s, t) => s + t.latency, 0) / gnbTunnels.filter(t => t.status !== 'down').length),
}

// ============================================
// 查询函数 — 产品/客户/订单/开发者（保留）
// ============================================

export const getProducts = (): Product[] => [...products]
export const getProductById = (id: string): Product | undefined => products.find(p => p.id === id)

export const getCustomers = (): Customer[] => [...customers]
export const getCustomerById = (id: string): Customer | undefined => customers.find(c => c.id === id)

export const getOrders = (): Order[] => [...orders]
export const getOrderById = (id: string): Order | undefined => orders.find(o => o.id === id)
export const getOrdersByCustomerId = (cid: string): Order[] => orders.filter(o => o.customerId === cid)
export const getRecentOrders = (count: number): Order[] =>
  [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, count)

export const getDevelopers = (): Developer[] => [...developers]
export const getDeveloperById = (id: string): Developer | undefined => developers.find(d => d.id === id)

// ============================================
// 查询函数 — 设备（扩展 tenantId 过滤）
// ============================================

export const getDevices = (tenantId: string = DEFAULT_TENANT_ID): Device[] =>
  devices.filter(d => d.tenantId === tenantId).map(d => ({ ...d }))

export const getDeviceById = (id: string): Device | undefined => {
  const d = devices.find(d => d.id === id)
  return d ? { ...d } : undefined
}

export const getDevicesByCustomerId = (cid: string): Device[] =>
  devices.filter(d => d.customerId === cid).map(d => ({ ...d }))

export const getDeviceCount = (tenantId: string = DEFAULT_TENANT_ID): number =>
  devices.filter(d => d.tenantId === tenantId).length

// ============================================
// 查询函数 — 成员
// ============================================

export const getMembers = (tenantId: string = DEFAULT_TENANT_ID): TenantMember[] =>
  members.filter(m => m.tenantId === tenantId).map(m => ({ ...m, assignedWorkerIds: [...m.assignedWorkerIds] }))

export const getMemberById = (id: string): TenantMember | undefined => {
  const m = members.find(m => m.id === id)
  return m ? { ...m, assignedWorkerIds: [...m.assignedWorkerIds] } : undefined
}

// ============================================
// 查询函数 — 数字员工
// ============================================

export const getDigitalWorkers = (tenantId: string = DEFAULT_TENANT_ID): DigitalWorker[] =>
  digitalWorkers.filter(w => w.tenantId === tenantId).map(w => ({ ...w, plugins: [...w.plugins], assignedMemberIds: [...w.assignedMemberIds] }))

export const getDigitalWorkerById = (id: string): DigitalWorker | undefined => {
  const w = digitalWorkers.find(w => w.id === id)
  return w ? { ...w, plugins: [...w.plugins], assignedMemberIds: [...w.assignedMemberIds] } : undefined
}

export const getWorkersByMemberId = (memberId: string): DigitalWorker[] => {
  const member = members.find(m => m.id === memberId)
  if (!member) return []
  return digitalWorkers
    .filter(w => member.assignedWorkerIds.includes(w.id))
    .map(w => ({ ...w, plugins: [...w.plugins], assignedMemberIds: [...w.assignedMemberIds] }))
}

// ============================================
// 查询函数 — 活动日志
// ============================================

export const getActivityLogs = (tenantId: string = DEFAULT_TENANT_ID, count: number = 10): ActivityLog[] =>
  [...activityLogs]
    .filter(l => l.tenantId === tenantId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, count)

// ============================================
// 查询函数 — 对话
// ============================================

export const getConversations = (memberId: string): Conversation[] =>
  conversations
    .filter(c => c.memberId === memberId)
    .map(c => ({ ...c, messages: c.messages.map(m => ({ ...m })) }))

export const getConversationById = (id: string): Conversation | undefined => {
  const c = conversations.find(c => c.id === id)
  return c ? { ...c, messages: c.messages.map(m => ({ ...m })) } : undefined
}

// ============================================
// 查询函数 — 系统信息 / Dashboard
// ============================================

export const getSystemInfo = (): SystemInfo => {
  const activeTunnels = gnbTunnels.filter(t => t.status === 'active')
  const nonDownTunnels = gnbTunnels.filter(t => t.status !== 'down')
  return {
    ...systemInfo,
    nodeCount: devices.length,
    onlineRate: devices.length > 0
      ? Math.round(devices.filter(d => d.status === 'online').length / devices.length * 1000) / 10
      : 0,
    gnbHealth: gnbTunnels.length > 0
      ? Math.round(activeTunnels.length / gnbTunnels.length * 100)
      : 0,
    avgLatency: nonDownTunnels.length > 0
      ? Math.round(nonDownTunnels.reduce((s, t) => s + t.latency, 0) / nonDownTunnels.length)
      : 0,
  }
}

// @alpha: GNB 隧道查询
export const getGnbTunnels = (): GnbTunnel[] =>
  gnbTunnels.map(t => ({ ...t }))

// @alpha: GNB 网络健康度
export const getGnbNetworkHealth = (): { totalTunnels: number; activeTunnels: number; avgLatency: number } => {
  const active = gnbTunnels.filter(t => t.status === 'active').length
  const nonDown = gnbTunnels.filter(t => t.status !== 'down')
  return {
    totalTunnels: gnbTunnels.length,
    activeTunnels: active,
    avgLatency: nonDown.length > 0
      ? Math.round(nonDown.reduce((s, t) => s + t.latency, 0) / nonDown.length)
      : 0,
  }
}

export const getStatCards = (tenantId: string = DEFAULT_TENANT_ID): StatCard[] => {
  const tenantDevices = devices.filter(d => d.tenantId === tenantId)
  const tenantMembers = members.filter(m => m.tenantId === tenantId)
  const tenantWorkers = digitalWorkers.filter(w => w.tenantId === tenantId)

  return [
    { id: 's1', label: '托管设备', value: tenantDevices.length, icon: '🖥️', trend: 12.5, linkTo: '/admin/devices' },
    { id: 's2', label: '在线设备', value: tenantDevices.filter(d => d.status === 'online').length, icon: '🟢', trend: 8.3, linkTo: '/admin/devices' },
    { id: 's3', label: '活跃隧道', value: gnbTunnels.filter(t => t.status === 'active').length, icon: '🌐', trend: 5.0, linkTo: '/admin/network' },
    { id: 's4', label: '团队成员', value: tenantMembers.length, icon: '👥', trend: 15.0, linkTo: '/admin/members' },
    { id: 's5', label: '数字员工', value: tenantWorkers.filter(w => w.status === 'active').length, icon: '🤖', trend: 20.0, linkTo: '/admin/workers' },
  ]
}

// ============================================
// 变更函数 — 产品（保留）
// ============================================

export const addProduct = (product: Omit<Product, 'id' | 'createdAt'>): Product => {
  const newProduct: Product = {
    ...product,
    id: `p${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  }
  products = [...products, newProduct]
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>): Product | undefined => {
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) return undefined
  products = products.map(p => p.id === id ? { ...p, ...updates } : p)
  return products[idx]
}

export const toggleProductStatus = (id: string): Product | undefined => {
  const product = products.find(p => p.id === id)
  if (!product) return undefined
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  return updateProduct(id, { status: newStatus })
}

// ============================================
// 变更函数 — 订单（保留）
// ============================================

export const advanceOrderStatus = (id: string): Order | undefined => {
  const order = orders.find(o => o.id === id)
  if (!order) return undefined

  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status)
  // @alpha: 终态不可推进
  if (currentIdx === -1 || currentIdx >= ORDER_STATUS_FLOW.length - 1) return undefined

  const nextStatus = ORDER_STATUS_FLOW[currentIdx + 1]
  const statusLabels: Record<OrderStatus, string> = {
    pending: '订单创建',
    producing: '确认生产',
    shipped: '仓库发货',
    completed: '客户签收',
  }

  orders = orders.map(o => {
    if (o.id !== id) return o
    return {
      ...o,
      status: nextStatus,
      statusHistory: [
        ...o.statusHistory,
        {
          status: nextStatus,
          timestamp: new Date().toLocaleString('zh-CN'),
          note: statusLabels[nextStatus],
        },
      ],
    }
  })

  return orders.find(o => o.id === id)
}

// ============================================
// 变更函数 — 开发者（保留）
// ============================================

export const updateDeveloperCertLevel = (id: string, newLevel: CertLevel): Developer | undefined => {
  const dev = developers.find(d => d.id === id)
  if (!dev) return undefined

  const levelLabels: Record<CertLevel, string> = {
    junior: '初级认证',
    mid: '中级认证',
    senior: '高级认证',
  }

  developers = developers.map(d => {
    if (d.id !== id) return d
    return {
      ...d,
      certLevel: newLevel,
      certHistory: [
        ...d.certHistory,
        {
          level: newLevel,
          timestamp: new Date().toISOString().split('T')[0],
          note: `变更为${levelLabels[newLevel]}`,
        },
      ],
    }
  })

  return developers.find(d => d.id === id)
}

// ============================================
// 变更函数 — 设备（扩展配额校验）
// ============================================

// @alpha: 检查租户配额
export const canAddDevice = (tenantId: string = DEFAULT_TENANT_ID): { allowed: boolean; current: number; max: number } => {
  const current = getDeviceCount(tenantId)
  const t = tenantId === DEFAULT_TENANT_ID ? tenant : undefined
  const max = t ? t.maxDevices : 0
  return { allowed: current < max, current, max }
}

export const addDevice = (
  device: Omit<Device, 'id' | 'registeredAt' | 'status' | 'agentCount' | 'uptime' | 'lastSeen' | 'rpcConfig' | 'gnbConfig'>,
): Device | { error: string } => {
  const quota = canAddDevice(device.tenantId)
  if (!quota.allowed) {
    return { error: `已达配额上限（${quota.current}/${quota.max}），请升级订阅计划` }
  }

  const newDevice: Device = {
    ...device,
    id: `dev${Date.now()}`,
    status: 'online',
    agentCount: 0,
    uptime: '刚刚注册',
    lastSeen: new Date().toLocaleString('zh-CN'),
    registeredAt: new Date().toISOString().split('T')[0],
    rpcConfig: makeRpcConfig(),
    gnbConfig: makeGnbConfig(),
  }
  devices = [...devices, newDevice]

  // @alpha: 记录活动日志
  addActivityLog(device.tenantId, 'device_added', `设备 ${device.name} 已接入托管`)

  return newDevice
}

export const removeDevice = (id: string): boolean => {
  const device = devices.find(d => d.id === id)
  if (!device) return false

  const before = devices.length
  devices = devices.filter(d => d.id !== id)

  // @alpha: 关联数字员工标记为不可用
  digitalWorkers = digitalWorkers.map(w =>
    w.deviceId === id ? { ...w, status: 'inactive' as const } : w
  )

  addActivityLog(device.tenantId, 'device_removed', `设备 ${device.name} 已解除托管`)

  return devices.length < before
}

// @alpha: 更新设备 RPC 配置
export const updateDeviceRpcConfig = (deviceId: string, config: RpcConfig): Device | { error: string } => {
  const device = devices.find(d => d.id === deviceId)
  if (!device) return { error: '设备不存在' }

  devices = devices.map(d =>
    d.id === deviceId ? { ...d, rpcConfig: { ...config, plugins: config.plugins.map(p => ({ ...p })) } } : d
  )

  addActivityLog(device.tenantId, 'config_changed', `${device.name} 配置已更新`)

  return devices.find(d => d.id === deviceId)!
}

// ============================================
// 变更函数 — 成员
// ============================================

export const addMember = (
  member: Omit<TenantMember, 'id' | 'createdAt' | 'assignedWorkerIds'>,
): TenantMember => {
  const newMember: TenantMember = {
    ...member,
    id: `m${Date.now()}`,
    assignedWorkerIds: [],
    createdAt: new Date().toISOString().split('T')[0],
  }
  members = [...members, newMember]
  addActivityLog(member.tenantId, 'member_added', `成员 ${member.name} 已加入团队`)
  return newMember
}

export const updateMember = (id: string, updates: Partial<TenantMember>): TenantMember | undefined => {
  const idx = members.findIndex(m => m.id === id)
  if (idx === -1) return undefined
  members = members.map(m => m.id === id ? { ...m, ...updates } : m)
  return members[idx]
}

export const removeMember = (id: string): boolean => {
  const member = members.find(m => m.id === id)
  if (!member) return false

  members = members.filter(m => m.id !== id)

  // @alpha: 清理分配关系
  digitalWorkers = digitalWorkers.map(w => ({
    ...w,
    assignedMemberIds: w.assignedMemberIds.filter(mid => mid !== id),
  }))

  return true
}

// ============================================
// 变更函数 — 数字员工
// ============================================

export const addDigitalWorker = (
  worker: Omit<DigitalWorker, 'id' | 'createdAt' | 'status' | 'assignedMemberIds'>,
): DigitalWorker => {
  const newWorker: DigitalWorker = {
    ...worker,
    id: `w${Date.now()}`,
    assignedMemberIds: [],
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
  }
  digitalWorkers = [...digitalWorkers, newWorker]
  addActivityLog(worker.tenantId, 'worker_created', `数字员工「${worker.name}」已创建`)
  return newWorker
}

export const updateDigitalWorker = (id: string, updates: Partial<DigitalWorker>): DigitalWorker | undefined => {
  const idx = digitalWorkers.findIndex(w => w.id === id)
  if (idx === -1) return undefined
  digitalWorkers = digitalWorkers.map(w => w.id === id ? { ...w, ...updates } : w)
  return digitalWorkers[idx]
}

// @alpha: 分配数字员工给成员
export const assignWorkerToMember = (workerId: string, memberIds: string[]): boolean => {
  const worker = digitalWorkers.find(w => w.id === workerId)
  if (!worker) return false

  // 更新 worker 的 assignedMemberIds
  digitalWorkers = digitalWorkers.map(w =>
    w.id === workerId ? { ...w, assignedMemberIds: [...memberIds] } : w
  )

  // 同步更新成员的 assignedWorkerIds
  members = members.map(m => {
    const shouldHave = memberIds.includes(m.id)
    const alreadyHas = m.assignedWorkerIds.includes(workerId)
    if (shouldHave && !alreadyHas) {
      return { ...m, assignedWorkerIds: [...m.assignedWorkerIds, workerId] }
    }
    if (!shouldHave && alreadyHas) {
      return { ...m, assignedWorkerIds: m.assignedWorkerIds.filter(wid => wid !== workerId) }
    }
    return m
  })

  return true
}

export const removeDigitalWorker = (id: string): boolean => {
  const worker = digitalWorkers.find(w => w.id === id)
  if (!worker) return false

  digitalWorkers = digitalWorkers.filter(w => w.id !== id)

  // @alpha: 清理成员的 assignedWorkerIds
  members = members.map(m => ({
    ...m,
    assignedWorkerIds: m.assignedWorkerIds.filter(wid => wid !== id),
  }))

  return true
}

// ============================================
// 变更函数 — 对话
// ============================================

export const createConversation = (memberId: string, workerId: string): Conversation => {
  const worker = digitalWorkers.find(w => w.id === workerId)
  const now = new Date().toLocaleString('zh-CN')
  const conv: Conversation = {
    id: `conv${Date.now()}`,
    tenantId: DEFAULT_TENANT_ID,
    memberId,
    workerId,
    workerName: worker?.name || '未知员工',
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  conversations = [...conversations, conv]
  return conv
}

export const addMessageToConversation = (
  conversationId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>,
): ChatMessage => {
  const now = new Date().toLocaleString('zh-CN')
  const newMessage: ChatMessage = {
    ...message,
    id: `msg${Date.now()}`,
    timestamp: now,
  }

  conversations = conversations.map(c => {
    if (c.id !== conversationId) return c
    return {
      ...c,
      messages: [...c.messages, newMessage],
      updatedAt: now,
    }
  })

  return newMessage
}

// ============================================
// 活动日志
// ============================================

const addActivityLog = (tenantId: string, type: ActivityLog['type'], message: string): void => {
  const log: ActivityLog = {
    id: `al${Date.now()}`,
    tenantId,
    type,
    message,
    timestamp: new Date().toLocaleString('zh-CN'),
  }
  activityLogs = [...activityLogs, log]
}

// ============================================
// 工具函数
// ============================================

// @alpha: API Key 脱敏 — 保留前6后4
export const maskApiKey = (key: string): string => {
  if (key.length <= 10) return '****'
  return key.slice(0, 6) + '****' + key.slice(-4)
}

// @alpha: Passcode 脱敏 — 保留前4后2
export const maskPasscode = (passcode: string): string => {
  if (passcode.length <= 4) return '****'
  return passcode.slice(0, 4) + '****' + passcode.slice(-2)
}

// @alpha: 安全合规检查 — 检查所有设备是否符合审计建议
export const checkGnbCompliance = (): { compliant: boolean; issues: Array<{ deviceName: string; issue: string }> } => {
  const issues: Array<{ deviceName: string; issue: string }> = []
  for (const d of devices) {
    if (d.gnbConfig.cryptoType === 'none') {
      issues.push({ deviceName: d.name, issue: '未启用加密' })
    }
    if (d.gnbConfig.keyUpdateInterval === 'none') {
      issues.push({ deviceName: d.name, issue: '密钥轮换未激活' })
    }
    if (!d.gnbConfig.ntpSynced && d.gnbConfig.keyUpdateInterval !== 'none') {
      issues.push({ deviceName: d.name, issue: 'NTP 未同步' })
    }
  }
  return { compliant: issues.length === 0, issues }
}

// ============================================
// GNB 操作函数（新增）
// ============================================

// @alpha: 注册 GNB 节点 — 创建新设备 + GNB 配置，含 UUID/IP 唯一性校验
export const registerGnbNode = (
  params: {
    tenantId?: string
    name: string
    uuid: string
    virtualIp: string
    nodeType: GnbNodeConfig['nodeType']
    cryptoType: GnbNodeConfig['cryptoType']
    passcode: string
  },
): Device | { error: string } => {
  const tid = params.tenantId || DEFAULT_TENANT_ID

  // 配额校验
  const quota = canAddDevice(tid)
  if (!quota.allowed) {
    return { error: `已达配额上限（${quota.current}/${quota.max}），请升级订阅计划` }
  }

  // UUID 唯一性
  if (devices.some(d => d.gnbConfig.uuid === params.uuid)) {
    return { error: 'UUID 已存在' }
  }

  // 虚拟 IP 唯一性
  if (devices.some(d => d.gnbConfig.virtualIp === params.virtualIp)) {
    return { error: '虚拟 IP 已被使用' }
  }

  const newDevice: Device = {
    id: `dev${Date.now()}`,
    tenantId: tid,
    name: params.name,
    customerId: '',
    customerName: '',
    productName: 'GNB 节点',
    token: `gnb_${params.uuid.slice(-4)}_****`,
    endpoint: '',
    status: 'online',
    agentCount: 0,
    uptime: '刚刚注册',
    lastSeen: new Date().toLocaleString('zh-CN'),
    registeredAt: new Date().toISOString().split('T')[0],
    rpcConfig: makeRpcConfig(),
    gnbConfig: makeGnbConfig({
      uuid: params.uuid,
      virtualIp: params.virtualIp,
      nodeType: params.nodeType,
      cryptoType: params.cryptoType,
      passcode: params.passcode,
    }),
  }

  devices = [...devices, newDevice]
  addActivityLog(tid, 'node_registered', `GNB 节点 ${params.name} (${params.uuid}) 已注册`)
  return newDevice
}

// @alpha: 更新 GNB 节点 Passcode
export const updateGnbPasscode = (
  deviceId: string,
  newPasscode: string,
): Device | { error: string } => {
  const device = devices.find(d => d.id === deviceId)
  if (!device) return { error: '设备不存在' }

  devices = devices.map(d =>
    d.id === deviceId
      ? { ...d, gnbConfig: { ...d.gnbConfig, passcode: newPasscode } }
      : d
  )

  addActivityLog(device.tenantId, 'passcode_changed', `${device.name} Passcode 已更新`)
  return devices.find(d => d.id === deviceId)!
}

// ============================================
// 私域子网 CRUD（新增）
// ============================================

export const getSubnets = (): Subnet[] => subnets.map(s => ({ ...s }))

export const addSubnet = (
  params: { name: string; cidr: string; passcode: string },
): Subnet => {
  const sub: Subnet = {
    id: `sub${Date.now()}`,
    name: params.name,
    cidr: params.cidr,
    passcode: params.passcode,
    createdAt: new Date().toISOString().split('T')[0],
  }
  subnets = [...subnets, sub]
  addActivityLog(DEFAULT_TENANT_ID, 'subnet_created', `私域「${params.name}」已创建`)
  return sub
}

// @alpha: 获取子网成员节点 — 通过 CIDR 匹配虚拟 IP
export const getSubnetMembers = (subnetId: string): Device[] => {
  const sub = subnets.find(s => s.id === subnetId)
  if (!sub) return []
  return devices.filter(d => ipToCidrMatch(d.gnbConfig.virtualIp, sub.cidr)).map(d => ({ ...d }))
}

// @alpha: 删除子网 — 仅空子网可删
export const removeSubnet = (id: string): boolean | { error: string } => {
  const sub = subnets.find(s => s.id === id)
  if (!sub) return { error: '子网不存在' }

  const memberCount = devices.filter(d => ipToCidrMatch(d.gnbConfig.virtualIp, sub.cidr)).length
  if (memberCount > 0) {
    return { error: `子网包含 ${memberCount} 个节点，仅空子网可删除` }
  }

  subnets = subnets.filter(s => s.id !== id)
  addActivityLog(DEFAULT_TENANT_ID, 'subnet_removed', `私域「${sub.name}」已删除`)
  return true
}
