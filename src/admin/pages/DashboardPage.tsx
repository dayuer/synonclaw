// @alpha: Dashboard 仪表盘 — 改造为 SaaS 控制台视角
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStatCards, getActivityLogs, getTenant, getSystemInfo } from '../data/mockData'
import type { StatCard, ActivityLog, Tenant, SystemInfo } from '../data/types'
import { PLAN_LABELS } from '../data/types'

// @alpha: 计数器动画 Hook
function useCountUp(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) { setCurrent(0); return }
    const startTime = performance.now()
    let rafId: number
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.round(target * eased))
      if (progress < 1) rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])
  return current
}

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

// @alpha: 活动类型图标映射
const ACTIVITY_ICONS: Record<string, string> = {
  device_added: '📡', device_removed: '❌', config_changed: '⚙️',
  member_added: '👤', worker_created: '🤖', conversation: '💬',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [tenantInfo, setTenantInfo] = useState<Tenant | null>(null)
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    setStats(getStatCards())
    setLogs(getActivityLogs('t1', 8))
    setTenantInfo(getTenant())
    setSysInfo(getSystemInfo())
  }, [])

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">控制台</h1>
        <p className="admin-page-header__subtitle">OpenClaw 集中托管与分发概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="stat-cards">
        {stats.map(card => (
          <StatCardItem key={card.id} card={card} />
        ))}
      </div>

      <div className="dashboard-grid">
        {/* 活动日志 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">📋 最近活动</h2>
          </div>
          <div className="admin-panel__body">
            {logs.length === 0 ? (
              <div className="admin-empty" style={{ padding: 'var(--space-xl)' }}>
                <p className="admin-empty__title">暂无活动记录</p>
              </div>
            ) : (
              <div className="activity-list">
                {logs.map(log => (
                  <div key={log.id} className="activity-item">
                    <span className="activity-item__icon">{ACTIVITY_ICONS[log.type] || '📌'}</span>
                    <div className="activity-item__content">
                      <span className="activity-item__message">{log.message}</span>
                      <span className="activity-item__time">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：订阅信息 + 系统状态 */}
        <div>
          {/* 订阅计划 */}
          {tenantInfo && sysInfo && (
            <div className="admin-panel" style={{ marginBottom: 'var(--space-xl)' }}>
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">💎 订阅计划</h2>
              </div>
              <div className="admin-panel__body">
                <div className="admin-detail">
                  <div className="admin-detail__field">
                    <div className="admin-detail__label">当前计划</div>
                    <div className="admin-detail__value">
                      <span className="status-badge status-badge--active">
                        {PLAN_LABELS[tenantInfo.plan]}
                      </span>
                    </div>
                  </div>
                  <div className="admin-detail__field">
                    <div className="admin-detail__label">设备配额</div>
                    <div className="admin-detail__value" style={{
                      color: sysInfo.nodeCount >= tenantInfo.maxDevices ? 'var(--color-accent-red)' : 'var(--color-text-primary)',
                      fontWeight: 600,
                    }}>
                      {sysInfo.nodeCount} / {tenantInfo.maxDevices === Infinity ? '∞' : tenantInfo.maxDevices}
                    </div>
                  </div>
                  <div className="admin-detail__field">
                    <div className="admin-detail__label">在线率</div>
                    <div className="admin-detail__value" style={{ color: 'var(--color-accent-green)' }}>
                      {sysInfo.onlineRate}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 系统状态 */}
          {sysInfo && (
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">⚡ 系统状态</h2>
              </div>
              <div className="admin-panel__body">
                <div className="system-metrics">
                  <div className="system-metric">
                    <span className="system-metric__label">版本</span>
                    <span className="system-metric__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body)' }}>{sysInfo.version}</span>
                  </div>
                  <div className="system-metric">
                    <span className="system-metric__label">运行时间</span>
                    <span className="system-metric__value">{sysInfo.uptime}</span>
                  </div>
                  <div className="system-metric">
                    <span className="system-metric__label">API 调用</span>
                    <span className="system-metric__value">{sysInfo.apiCalls.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
