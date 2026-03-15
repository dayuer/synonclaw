// @alpha: Mock 数据层 — 模拟全部业务数据 + CRUD 操作函数

import type {
  Product, Customer, Order, Developer,
  StatCard, SystemInfo, OrderStatus, CertLevel,
  ORDER_STATUS_FLOW as _FLOW
} from './types'
import { ORDER_STATUS_FLOW } from './types'

// ============================================
// 模拟数据
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

const systemInfo: SystemInfo = {
  version: '1.2.0-beta',
  environment: 'Production',
  buildTime: '2026-03-15 10:00:00',
  nodeCount: 24,
  onlineRate: 95.8,
  apiCalls: 128456,
  uptime: '32 天 14 小时',
  lastBackup: '2026-03-15 04:00:00',
}

// ============================================
// 查询函数
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

export const getSystemInfo = (): SystemInfo => ({ ...systemInfo })

export const getStatCards = (): StatCard[] => [
  { id: 's1', label: '设备总数', value: 24, icon: '🖥️', trend: 12.5, linkTo: '/admin/products' },
  { id: 's2', label: '企业客户', value: customers.filter(c => c.type === 'ToB').length, icon: '🏢', trend: 8.3, linkTo: '/admin/customers' },
  { id: 's3', label: '活跃订单', value: orders.filter(o => o.status !== 'completed').length, icon: '📦', trend: -2.1, linkTo: '/admin/orders' },
  { id: 's4', label: '认证开发者', value: developers.filter(d => d.status === 'active').length, icon: '👨‍💻', trend: 15.0, linkTo: '/admin/developers' },
]

// ============================================
// 变更函数
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
