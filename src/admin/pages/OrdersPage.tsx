// @alpha: 订单管理页面
import { useState, useEffect, useCallback } from 'react'
import { getOrders, getOrderById, advanceOrderStatus } from '../data/mockData'
import type { Order, OrderStatus } from '../data/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '../data/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const refresh = useCallback(() => setOrders(getOrders()), [])
  useEffect(() => { refresh() }, [refresh])

  const openDetail = (order: Order) => setSelectedOrder(order)

  const handleAdvance = (id: string) => {
    advanceOrderStatus(id)
    const updated = getOrderById(id)
    if (updated) setSelectedOrder(updated)
    refresh()
  }

  const canAdvance = (status: OrderStatus): boolean => {
    const idx = ORDER_STATUS_FLOW.indexOf(status)
    return idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1
  }

  const getNextStatusLabel = (status: OrderStatus): string => {
    const idx = ORDER_STATUS_FLOW.indexOf(status)
    if (idx < 0 || idx >= ORDER_STATUS_FLOW.length - 1) return ''
    const actionLabels: Record<OrderStatus, string> = {
      pending: '确认生产',
      producing: '确认发货',
      shipped: '确认完成',
      completed: '',
    }
    return actionLabels[status]
  }

  // 详情视图
  if (selectedOrder) {
    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelectedOrder(null)}>订单管理</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selectedOrder.orderNo}</span>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="admin-page-header__title">{selectedOrder.orderNo}</h1>
            <p className="admin-page-header__subtitle">订单详细信息</p>
          </div>
          {canAdvance(selectedOrder.status) && (
            <button className="admin-btn admin-btn--primary" onClick={() => handleAdvance(selectedOrder.id)}>
              {getNextStatusLabel(selectedOrder.status)} →
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">订单信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">客户</div>
                  <div className="admin-detail__value">{selectedOrder.customerName}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">产品</div>
                  <div className="admin-detail__value">{selectedOrder.productName}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">数量</div>
                  <div className="admin-detail__value">{selectedOrder.quantity} 台</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">金额</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent)' }}>
                    ¥{selectedOrder.amount.toLocaleString()}
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">当前状态</div>
                  <div className="admin-detail__value">
                    <span className={`status-badge status-badge--${selectedOrder.status}`}>
                      <span className="status-badge__dot" />{ORDER_STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">创建时间</div>
                  <div className="admin-detail__value">{selectedOrder.createdAt}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">状态变更历史</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-timeline">
                {[...selectedOrder.statusHistory].reverse().map((change, idx) => (
                  <div className="admin-timeline__item" key={idx}>
                    <div className="admin-timeline__dot" />
                    <div className="admin-timeline__time">{change.timestamp}</div>
                    <div className="admin-timeline__text">
                      <span className={`status-badge status-badge--${change.status}`} style={{ marginRight: 8 }}>
                        <span className="status-badge__dot" />{ORDER_STATUS_LABELS[change.status]}
                      </span>
                      {change.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 列表视图
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">订单管理</h1>
        <p className="admin-page-header__subtitle">追踪硬件订单全流程</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            共 {orders.length} 笔订单
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>产品</th>
              <th>数量</th>
              <th>金额</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="admin-empty">
                  <div className="admin-empty__icon">📦</div>
                  <p className="admin-empty__title">暂无订单</p>
                </div>
              </td></tr>
            ) : orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{o.orderNo}</td>
                <td>{o.customerName}</td>
                <td>{o.productName}</td>
                <td>{o.quantity}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>¥{o.amount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-badge--${o.status}`}>
                    <span className="status-badge__dot" />{ORDER_STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{o.createdAt}</td>
                <td>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openDetail(o)}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
