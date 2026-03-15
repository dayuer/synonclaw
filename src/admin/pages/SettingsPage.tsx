// @alpha: 系统设置页面 — 系统信息 + 主题设置
import { useState, useEffect } from 'react'
import { getSystemInfo } from '../data/mockData'
import type { SystemInfo } from '../data/types'

export default function SettingsPage() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    setSysInfo(getSystemInfo())
  }, [])

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">系统设置</h1>
        <p className="admin-page-header__subtitle">系统配置与运行状态</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* 系统信息 */}
        {sysInfo && (
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">系统信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">版本</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)' }}>{sysInfo.version}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">环境</div>
                  <div className="admin-detail__value">
                    <span className="status-badge status-badge--active">
                      <span className="status-badge__dot" />{sysInfo.environment}
                    </span>
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">构建时间</div>
                  <div className="admin-detail__value">{sysInfo.buildTime}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">运行时间</div>
                  <div className="admin-detail__value">{sysInfo.uptime}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">托管设备数</div>
                  <div className="admin-detail__value">{sysInfo.nodeCount} 台</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">在线率</div>
                  <div className="admin-detail__value" style={{ color: 'var(--color-accent-green)' }}>{sysInfo.onlineRate}%</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">最近备份</div>
                  <div className="admin-detail__value">{sysInfo.lastBackup}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主题设置 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">🎨 主题设置</h2>
          </div>
          <div className="admin-panel__body">
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', marginTop: 0 }}>
              当前使用暗色主题。更多主题选项将在后续版本中开放。
            </p>
            <div className="admin-detail__field">
              <div className="admin-detail__label">当前主题</div>
              <div className="admin-detail__value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{
                  display: 'inline-block', width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-primary)', border: '2px solid var(--color-accent)',
                }} />
                深色模式 (SynonClaw Dark)
              </div>
            </div>
            <div className="admin-detail__field" style={{ marginTop: 'var(--space-lg)' }}>
              <div className="admin-detail__label">强调色</div>
              <div className="admin-detail__value" style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <span style={{
                  display: 'inline-block', width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--color-accent)', boxShadow: 'var(--shadow-glow)',
                }} />
                <span style={{
                  display: 'inline-block', width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--color-accent-green)',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* 关于 OpenClaw */}
        <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">📡 关于 OpenClaw</h2>
          </div>
          <div className="admin-panel__body">
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', marginTop: 0, marginBottom: 'var(--space-md)' }}>
              每台 SynonClaw 设备内置 OpenClaw 智能体引擎。设备通过 Token 添加到管理后台后，可通过以下 RPC 接口远程管理每台设备上的 AI 代理。前往 <strong>设备管理</strong> 页添加和管理设备。
            </p>
            <table className="admin-table" style={{ fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr>
                  <th>接口</th>
                  <th>说明</th>
                  <th>作用域</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/agents</td><td>AI 代理列表</td><td>单设备</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>POST /openclaw/agents</td><td>创建 AI 代理</td><td>单设备</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/nodes</td><td>算力节点状态</td><td>单设备</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>POST /openclaw/rpc</td><td>通用 RPC 调用</td><td>单设备</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/sessions</td><td>会话列表</td><td>单设备</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/events</td><td>事件列表</td><td>单设备</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
