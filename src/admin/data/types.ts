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

// @alpha: 设备 = OpenClaw 实例，通过 Token 托管
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

export type ActivityType = 'device_added' | 'device_removed' | 'config_changed' | 'member_added' | 'worker_created' | 'conversation'

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
