// @alpha: 领域实体类型定义 — 所有 admin 模块的核心数据结构

// ============================================
// 产品域（保留）
// ============================================

export type ProductType = 'desktop' | 'rack'
export type ProductStatus = 'active' | 'inactive'

export interface Product {
  id: string
  name: string
  type: ProductType
  specs: string
  price: number
  status: ProductStatus
  description: string
  createdAt: string
}

// ============================================
// 客户域（保留）
// ============================================

export type CustomerType = 'ToB' | 'ToC'
export type CustomerStatus = 'lead' | 'signed' | 'churned'

export interface Customer {
  id: string
  name: string
  contact: string
  email: string
  type: CustomerType
  status: CustomerStatus
  deviceCount: number
  industry: string
  createdAt: string
}

// ============================================
// 订单域（保留）
// ============================================

export type OrderStatus = 'pending' | 'producing' | 'shipped' | 'completed'

export interface OrderStatusChange {
  status: OrderStatus
  timestamp: string
  note: string
}

export interface Order {
  id: string
  orderNo: string
  customerId: string
  customerName: string
  productId: string
  productName: string
  quantity: number
  amount: number
  status: OrderStatus
  statusHistory: OrderStatusChange[]
  createdAt: string
}

// ============================================
// 开发者域（保留）
// ============================================

export type CertLevel = 'junior' | 'mid' | 'senior'
export type DeveloperStatus = 'active' | 'inactive'

export interface CertRecord {
  level: CertLevel
  timestamp: string
  note: string
}

export interface TaskRecord {
  id: string
  title: string
  status: 'completed' | 'in-progress' | 'cancelled'
  completedAt: string
}

export interface Developer {
  id: string
  name: string
  school: string
  skills: string[]
  certLevel: CertLevel
  status: DeveloperStatus
  taskCount: number
  certHistory: CertRecord[]
  taskRecords: TaskRecord[]
  joinedAt: string
}

// ============================================
// 多租户域（新增）
// ============================================

// @alpha: 订阅计划 — 决定设备配额
export type PlanType = 'basic' | 'pro' | 'enterprise'

export const PLAN_LIMITS: Record<PlanType, number> = {
  basic: 3,
  pro: 10,
  enterprise: Infinity,
}

export const PLAN_LABELS: Record<PlanType, string> = {
  basic: '基础版',
  pro: '专业版',
  enterprise: '企业版',
}

// @alpha: 租户 — 使用 SynonClaw 的企业组织
export interface Tenant {
  id: string
  name: string
  plan: PlanType
  maxDevices: number
  createdAt: string
}

// @alpha: 成员角色
export type MemberRole = 'admin' | 'member'

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  admin: '管理员',
  member: '成员',
}

// @alpha: 租户成员
export interface TenantMember {
  id: string
  tenantId: string
  name: string
  email: string
  department: string
  role: MemberRole
  assignedWorkerIds: string[]
  createdAt: string
}

// ============================================
// GNB 网络域（新增）
// ============================================

// @alpha: GNB 节点类型 — 普通节点/信令节点/中继节点
export type GnbNodeType = 'normal' | 'index' | 'forward'

export const GNB_NODE_TYPE_LABELS: Record<GnbNodeType, string> = {
  normal: '普通节点',
  index: 'Index 信令',
  forward: 'Forward 中继',
}

// @alpha: GNB 加密类型
export type GnbCryptoType = 'arc4' | 'xor' | 'none'

export const GNB_CRYPTO_TYPE_LABELS: Record<GnbCryptoType, string> = {
  arc4: 'ARC4',
  xor: 'XOR',
  none: '无加密',
}

// @alpha: 密钥轮换间隔
export type GnbKeyUpdateInterval = 'none' | 'hour' | 'minute'

export const GNB_KEY_UPDATE_LABELS: Record<GnbKeyUpdateInterval, string> = {
  none: '未启用',
  hour: '每小时',
  minute: '每分钟',
}

// @alpha: NAT 类型
export type NatType = 'full_cone' | 'restricted_cone' | 'port_restricted' | 'symmetric' | 'unknown'

export const NAT_TYPE_LABELS: Record<NatType, string> = {
  full_cone: 'Full Cone',
  restricted_cone: 'Restricted Cone',
  port_restricted: 'Port Restricted',
  symmetric: 'Symmetric',
  unknown: '未知',
}

// @alpha: GNB 节点配置 — 每台设备的网络层属性
export interface GnbNodeConfig {
  uuid: string               // GNB 节点 UUID（4 字节 hex，如 '00001001'）
  virtualIp: string          // 虚拟网络 IP，如 '10.1.0.1'
  publicKey: string           // ED25519 公钥（64 字符 hex）
  nodeType: GnbNodeType
  cryptoType: GnbCryptoType
  keyUpdateInterval: GnbKeyUpdateInterval
  passcode: string            // 8 字符 hex，展示时脱敏
  ntpSynced: boolean
  natType: NatType
}

// @alpha: 隧道状态
export type TunnelStatus = 'active' | 'degraded' | 'down'

export const TUNNEL_STATUS_LABELS: Record<TunnelStatus, string> = {
  active: '正常',
  degraded: '降级',
  down: '断开',
}

// @alpha: GNB 隧道 — 节点间加密通道
export interface GnbTunnel {
  id: string
  sourceNodeId: string       // 关联设备 ID
  sourceNodeName: string
  targetNodeId: string
  targetNodeName: string
  latency: number            // ms
  packetLoss: number         // %, 0~100
  uptime: string
  cryptoType: GnbCryptoType
  status: TunnelStatus
}

// @alpha: GNB 私域子网 — 逻辑网络隔离单元
export interface Subnet {
  id: string
  name: string
  cidr: string              // 如 '10.1.0.0/24'
  passcode: string          // 8 字符 hex (0xXXXXXXXX)
  createdAt: string
}

// ============================================
// 设备域（扩展）
// ============================================

export type DeviceStatus = 'online' | 'offline' | 'error'

// @alpha: 模型供应商
export type ModelProvider = 'openai' | 'anthropic' | 'deepseek' | 'custom'

export const MODEL_PROVIDER_LABELS: Record<ModelProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  deepseek: 'DeepSeek',
  custom: '自定义',
}

// @alpha: 插件定义
export interface PluginConfig {
  id: string
  name: string
  description: string
  enabled: boolean
}

// @alpha: 设备 RPC 配置 — 远程管理核心
export interface RpcConfig {
  modelProvider: ModelProvider
  apiKey: string         // 明文存储，展示时脱敏
  temperature: number    // 0.0 ~ 2.0
  topP: number           // 0.0 ~ 1.0
  maxTokens: number      // 1 ~ 128000
  systemPrompt: string   // 最大 10000 字符
  plugins: PluginConfig[]
}

// @alpha: 设备 = OpenClaw 实例 + GNB 节点，通过 Token 托管
export interface Device {
  id: string
  tenantId: string
  name: string
  customerId: string
  customerName: string
  productName: string
  token: string
  endpoint: string
  status: DeviceStatus
  agentCount: number
  uptime: string
  lastSeen: string
  registeredAt: string
  rpcConfig: RpcConfig
  gnbConfig: GnbNodeConfig   // @alpha: GNB 网络层配置
}

// ============================================
// 数字员工域（新增）
// ============================================

// @alpha: 数字员工 — 将设备包装为业务角色
export interface DigitalWorker {
  id: string
  tenantId: string
  name: string
  description: string
  deviceId: string
  deviceName: string
  systemPrompt: string
  plugins: string[]       // 启用的插件 ID 列表
  assignedMemberIds: string[]
  status: 'active' | 'inactive'
  createdAt: string
}

// @alpha: 数字员工角色模板 — 1 台 Claw = 1 个角色
export type WorkerTemplateGroup = '通用' | '金融' | '技术'

export interface WorkerTemplate {
  id: string
  group: WorkerTemplateGroup
  icon: string
  name: string
  description: string
  systemPrompt: string
  plugins: string[]
}

// @alpha: 预置角色模板集 — 8 个模板覆盖常见工作场景
export const WORKER_TEMPLATES: WorkerTemplate[] = [
  // ── 通用 ──
  {
    id: 'tpl_assistant',
    group: '通用',
    icon: '💬',
    name: '智能助手',
    description: '通用型 AI 助手，擅长问答、文本处理和信息检索。',
    systemPrompt: '你是一位高效的智能助手。擅长回答问题、整理信息、撰写文案和翻译。请用简洁准确的语言回复用户。',
    plugins: ['web_search'],
  },
  {
    id: 'tpl_customer_service',
    group: '通用',
    icon: '🎧',
    name: '客服专员',
    description: '专业客服角色，处理用户咨询、投诉和售后问题。',
    systemPrompt: '你是一位专业的客服专员。始终保持友善、耐心的态度。当用户描述问题时，先确认理解，再给出解决方案。对无法处理的问题，引导用户联系人工客服。输出格式：{ 问题分类: "...", 解决方案: "...", 是否需要升级: true/false }',
    plugins: ['web_search', 'email'],
  },
  {
    id: 'tpl_finance',
    group: '通用',
    icon: '📋',
    name: '财务助手',
    description: '协助处理日常财务工作，包括报表生成、预算分析和报销审核。',
    systemPrompt: '你是一位专业的财务助手，精通中国企业财务制度和会计准则。帮助处理报表、预算和审计工作。所有金额保留两位小数，使用人民币。',
    plugins: ['file_mgmt', 'calendar'],
  },
  // ── 金融 ──
  {
    id: 'tpl_fundamental',
    group: '金融',
    icon: '📊',
    name: '基本面分析师',
    description: '通过分析财报、收益报告、内部交易等数据评估公司内在价值。',
    systemPrompt: '你是一位专业的基本面分析师。你的职责是：\n1. 分析目标公司的财报数据（营收、净利、毛利率、P/E、P/B、ROE）\n2. 评估最近一个季度的收益报告，识别超预期/不及预期信号\n3. 检查内部交易记录（高管增减持）\n4. 输出结论：{ "评级": "买入/持有/卖出", "目标价": "$XXX", "信心": 0~100, "理由": "..." }\n输出格式：JSON',
    plugins: ['web_search'],
  },
  {
    id: 'tpl_sentiment',
    group: '金融',
    icon: '💬',
    name: '情绪分析师',
    description: '关注社交媒体、舆情打分以及公司内部情绪等公众信息。',
    systemPrompt: '你是一位市场情绪分析师。你的职责是：\n1. 搜索目标股票在社交媒体（X/Reddit/StockTwits）的讨论热度和情绪倾向\n2. 分析机构/散户的持仓变化\n3. 量化情绪得分（-100 极度恐惧 ~ +100 极度贪婪）\n4. 输出结论：{ "情绪得分": N, "趋势": "升温/降温/稳定", "关键事件": [...], "信心": 0~100 }\n输出格式：JSON',
    plugins: ['web_search'],
  },
  {
    id: 'tpl_news',
    group: '金融',
    icon: '📰',
    name: '新闻分析师',
    description: '追踪宏观经济指标、重大新闻及公司事件，识别市场拐点。',
    systemPrompt: '你是一位金融新闻分析师。你的职责是：\n1. 搜索最近 7 天与目标公司/行业相关的重大新闻\n2. 评估宏观经济指标（CPI/PPI/就业/利率）对股价的影响\n3. 识别突发政策或地缘事件风险\n4. 输出结论：{ "影响方向": "利好/利空/中性", "强度": 1~5, "关键新闻": [...], "信心": 0~100 }\n输出格式：JSON',
    plugins: ['web_search'],
  },
  {
    id: 'tpl_technical',
    group: '金融',
    icon: '📈',
    name: '技术分析师',
    description: '计算 MACD、RSI 等技术指标，分析价格形态和趋势走势。',
    systemPrompt: '你是一位技术分析师。你的职责是：\n1. 获取目标股票最近 60 天的 OHLCV 数据\n2. 计算技术指标：MACD、RSI(14)、布林带(20,2)、均线(MA5/MA20/MA60)\n3. 识别关键支撑位和阻力位\n4. 输出结论：{ "信号": "买入/卖出/观望", "支撑位": "$XXX", "阻力位": "$XXX", "RSI": N, "信心": 0~100 }\n输出格式：JSON',
    plugins: ['web_search', 'code_exec'],
  },
  // ── 技术 ──
  {
    id: 'tpl_coder',
    group: '技术',
    icon: '👨‍💻',
    name: '代码助手',
    description: '精通多种编程语言的全栈开发助手，擅长代码审查、重构和架构设计。',
    systemPrompt: '你是一位资深全栈开发工程师，精通 TypeScript、Python、Go。专注于代码质量、性能优化和最佳实践。回复代码时请使用 markdown 代码块并标注语言。',
    plugins: ['web_search', 'code_exec', 'file_mgmt'],
  },
]

// @alpha: 按分组索引模板
export const WORKER_TEMPLATE_GROUPS: WorkerTemplateGroup[] = ['通用', '金融', '技术']

// ============================================
// 对话域（新增）
// ============================================

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  tenantId: string
  memberId: string
  workerId: string
  workerName: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// ============================================
// 活动日志（新增）
// ============================================

export type ActivityType = 'device_added' | 'device_removed' | 'config_changed' | 'member_added' | 'worker_created' | 'conversation' | 'node_registered' | 'passcode_changed' | 'subnet_created' | 'subnet_removed'

export interface ActivityLog {
  id: string
  tenantId: string
  type: ActivityType
  message: string
  timestamp: string
}

// ============================================
// RPC 指令（新增）
// ============================================

export type RpcMethod =
  | 'SET_MODEL_PROVIDER'
  | 'SET_API_KEY'
  | 'SET_TEMPERATURE'
  | 'SET_TOP_P'
  | 'SET_MAX_TOKENS'
  | 'SET_SYSTEM_PROMPT'
  | 'TOGGLE_PLUGIN'
  | 'SEND_MESSAGE'

export interface RpcCommand {
  id: string
  deviceId: string
  method: RpcMethod
  params: Record<string, unknown>
  timestamp: string
  status: 'pending' | 'sent' | 'success' | 'failed'
}

// ============================================
// Dashboard / UI
// ============================================

export interface StatCard {
  id: string
  label: string
  value: number
  icon: string
  trend: number
  linkTo: string
}

export interface SystemInfo {
  version: string
  environment: string
  buildTime: string
  nodeCount: number
  onlineRate: number
  apiCalls: number
  uptime: string
  lastBackup: string
  gnbHealth: number          // @alpha: 健康隧道占比 %, 0~100
  avgLatency: number         // @alpha: 平均延迟 ms
}

export interface NavItem {
  path: string
  label: string
  icon: string
}

// ============================================
// 常量映射
// ============================================

export const ORDER_STATUS_FLOW: OrderStatus[] = ['pending', 'producing', 'shipped', 'completed']

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待确认',
  producing: '生产中',
  shipped: '已发货',
  completed: '已完成',
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  lead: '潜在客户',
  signed: '已签约',
  churned: '已流失',
}

export const CERT_LEVEL_LABELS: Record<CertLevel, string> = {
  junior: '初级',
  mid: '中级',
  senior: '高级',
}

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  online: '在线',
  offline: '离线',
  error: '异常',
}

// @alpha: 默认 RPC 配置
export const DEFAULT_RPC_CONFIG: RpcConfig = {
  modelProvider: 'openai',
  apiKey: '',
  temperature: 0.7,
  topP: 1.0,
  maxTokens: 4096,
  systemPrompt: '',
  plugins: [
    { id: 'web_search', name: '联网搜索', description: '允许 AI 代理搜索互联网获取实时信息', enabled: false },
    { id: 'code_exec', name: '代码执行', description: '允许 AI 代理在沙箱中执行代码', enabled: false },
    { id: 'file_mgmt', name: '文件管理', description: '允许 AI 代理读写文件系统', enabled: false },
    { id: 'calendar', name: '日历', description: '允许 AI 代理访问和管理日历事件', enabled: false },
    { id: 'email', name: '邮件', description: '允许 AI 代理发送和接收邮件', enabled: false },
  ],
}

// @alpha: 默认插件列表
export const DEFAULT_PLUGINS: PluginConfig[] = DEFAULT_RPC_CONFIG.plugins
