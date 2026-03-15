// @alpha: 领域实体类型定义 — 所有 admin 模块的核心数据结构

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

export interface StatCard {
  id: string
  label: string
  value: number
  icon: string
  trend: number // 百分比变化，正数=增长
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

// @alpha: 侧边栏导航项类型
export interface NavItem {
  path: string
  label: string
  icon: string
}

// @alpha: 订单状态流转顺序
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
