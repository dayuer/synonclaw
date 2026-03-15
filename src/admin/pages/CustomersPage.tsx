// @alpha: 客户管理页面
import { useState, useEffect, useMemo, useCallback } from 'react'
import { getCustomers, getOrdersByCustomerId, getDevicesByCustomerId } from '../data/mockData'
import type { Customer, CustomerType, CustomerStatus, Order, Device } from '../data/types'
import { CUSTOMER_STATUS_LABELS, ORDER_STATUS_LABELS, DEVICE_STATUS_LABELS } from '../data/types'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<CustomerType | ''>('')
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | ''>('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [customerDevices, setCustomerDevices] = useState<Device[]>([])

  const refresh = useCallback(() => setCustomers(getCustomers()), [])
  useEffect(() => { refresh() }, [refresh])

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = !search || c.name.includes(search) || c.contact.includes(search)
      const matchType = !filterType || c.type === filterType
      const matchStatus = !filterStatus || c.status === filterStatus
      return matchSearch && matchType && matchStatus
    })
  }, [customers, search, filterType, filterStatus])

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerOrders(getOrdersByCustomerId(customer.id))
    setCustomerDevices(getDevicesByCustomerId(customer.id))
  }

  // 详情视图
  if (selectedCustomer) {
    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelectedCustomer(null)}>客户管理</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selectedCustomer.name}</span>
        </div>

        <div className="admin-page-header">
          <h1 className="admin-page-header__title">{selectedCustomer.name}</h1>
          <p className="admin-page-header__subtitle">客户详细信息</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">基本信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">联系人</div>
                  <div className="admin-detail__value">{selectedCustomer.contact}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">邮箱</div>
                  <div className="admin-detail__value">{selectedCustomer.email}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">类型</div>
                  <div className="admin-detail__value">
                    <span className={`status-badge ${selectedCustomer.type === 'ToB' ? 'status-badge--active' : 'status-badge--pending'}`}>
                      <span className="status-badge__dot" />{selectedCustomer.type}
                    </span>
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">状态</div>
                  <div className="admin-detail__value">
                    <span className={`status-badge status-badge--${selectedCustomer.status}`}>
                      <span className="status-badge__dot" />{CUSTOMER_STATUS_LABELS[selectedCustomer.status]}
                    </span>
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">行业</div>
                  <div className="admin-detail__value">{selectedCustomer.industry}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">托管设备</div>
                  <div className="admin-detail__value">{customerDevices.length} 台</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">创建时间</div>
                  <div className="admin-detail__value">{selectedCustomer.createdAt}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">关联订单 ({customerOrders.length})</h2>
            </div>
            {customerOrders.length === 0 ? (
              <div className="admin-empty" style={{ padding: 'var(--space-2xl)' }}>
                <div className="admin-empty__icon">📦</div>
                <p className="admin-empty__title">暂无订单</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>产品</th>
                    <th>金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{o.orderNo}</td>
                      <td>{o.productName}</td>
                      <td>¥{o.amount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-badge--${o.status}`}>
                          <span className="status-badge__dot" />{ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 托管设备 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">托管设备 ({customerDevices.length})</h2>
            </div>
            {customerDevices.length === 0 ? (
              <div className="admin-empty" style={{ padding: 'var(--space-2xl)' }}>
                <div className="admin-empty__icon">🖥️</div>
                <p className="admin-empty__title">暂无托管设备</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>设备名</th>
                    <th>端点</th>
                    <th>状态</th>
                    <th>代理数</th>
                  </tr>
                </thead>
                <tbody>
                  {customerDevices.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{d.endpoint}</td>
                      <td>
                        <span className={`status-badge status-badge--${d.status}`}>
                          <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td>{d.agentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 列表视图
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">客户管理</h1>
        <p className="admin-page-header__subtitle">管理企业客户信息与客户生命周期</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__left">
            <div className="admin-search">
              <span className="admin-search__icon">🔍</span>
              <input
                className="admin-form-input"
                placeholder="搜索客户名或联系人..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
            </div>
            <select className="admin-form-select" value={filterType} onChange={e => setFilterType(e.target.value as CustomerType | '')} style={{ width: 120 }}>
              <option value="">全部类型</option>
              <option value="ToB">ToB</option>
              <option value="ToC">ToC</option>
            </select>
            <select className="admin-form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value as CustomerStatus | '')} style={{ width: 120 }}>
              <option value="">全部状态</option>
              <option value="lead">潜在客户</option>
              <option value="signed">已签约</option>
              <option value="churned">已流失</option>
            </select>
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            {filtered.length} / {customers.length} 位客户
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>企业名称</th>
              <th>联系人</th>
              <th>类型</th>
              <th>状态</th>
              <th>设备数</th>
              <th>行业</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="admin-empty">
                  <div className="admin-empty__icon">🏢</div>
                  <p className="admin-empty__title">未找到匹配的客户</p>
                </div>
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.contact}</td>
                <td>
                  <span className={`status-badge ${c.type === 'ToB' ? 'status-badge--active' : 'status-badge--pending'}`}>
                    <span className="status-badge__dot" />{c.type}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-badge--${c.status}`}>
                    <span className="status-badge__dot" />{CUSTOMER_STATUS_LABELS[c.status]}
                  </span>
                </td>
                <td>{getDevicesByCustomerId(c.id).length}</td>
                <td>{c.industry}</td>
                <td>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openDetail(c)}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
