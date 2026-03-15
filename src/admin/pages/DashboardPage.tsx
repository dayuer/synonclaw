// @alpha: Dashboard 仪表盘
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStatCards, getRecentOrders, getSystemInfo } from '../data/mockData'
import type { StatCard, Order, SystemInfo } from '../data/types'
import { ORDER_STATUS_LABELS } from '../data/types'

// @alpha: 计数器动画 Hook — 从 0 到目标值的过渡动画
function useCountUp(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) { setCurrent(0); return }

    const startTime = performance.now()
    let rafId: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo 缓动函数
      const eased = 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.round(target * eased))

      if (progress < 1) rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return current
}

// 统计卡片子组件
function StatCardItem({ card }: { card: StatCard }) {
  const navigate = useNavigate()
  const displayValue = useCountUp(card.value)

  return (
    <div className="stat-card" onClick={() => navigate(card.linkTo)}>
      <div className="stat-card__header">
        <span className="stat-card__icon">{card.icon}</span>
        <span className={`stat-card__trend ${card.trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
          {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
        </span>
      </div>
      <p className="stat-card__value">{displayValue.toLocaleString()}</p>
      <p className="stat-card__label">{card.label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    setStats(getStatCards())
    setRecentOrders(getRecentOrders(5))
    setSysInfo(getSystemInfo())
  }, [])

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">仪表盘</h1>
        <p className="admin-page-header__subtitle">SynonClaw 运营数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="stat-cards">
        {stats.map(card => (
          <StatCardItem key={card.id} card={card} />
        ))}
      </div>

      {/* 下方两栏 */}
      <div className="dashboard-grid">
        {/* 最近订单 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">最近订单</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户</th>
                <th>产品</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{order.orderNo}</td>
                  <td>{order.customerName}</td>
                  <td>{order.productName}</td>
                  <td>¥{order.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-badge--${order.status}`}>
                      <span className="status-badge__dot" />
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 系统状态 */}
        {sysInfo && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">系统状态</h2>
            </div>
            <div className="admin-panel__body">
              <div className="system-metrics">
                <div className="system-metric">
                  <span className="system-metric__label">在线节点</span>
                  <span className="system-metric__value system-metric__value--accent">{sysInfo.nodeCount}</span>
                </div>
                <div className="system-metric">
                  <span className="system-metric__label">在线率</span>
                  <span className="system-metric__value system-metric__value--green">{sysInfo.onlineRate}%</span>
                </div>
                <div className="system-metric">
                  <span className="system-metric__label">API 调用</span>
                  <span className="system-metric__value">{sysInfo.apiCalls.toLocaleString()}</span>
                </div>
                <div className="system-metric">
                  <span className="system-metric__label">运行时间</span>
                  <span className="system-metric__value">{sysInfo.uptime}</span>
                </div>
                <div className="system-metric">
                  <span className="system-metric__label">版本</span>
                  <span className="system-metric__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body)' }}>{sysInfo.version}</span>
                </div>
                <div className="system-metric">
                  <span className="system-metric__label">最近备份</span>
                  <span className="system-metric__value" style={{ fontSize: 'var(--text-small)' }}>{sysInfo.lastBackup}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
