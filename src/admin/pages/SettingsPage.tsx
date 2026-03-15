// @alpha: 系统设置页面 — 含 OpenClaw Token 配置预留
import { useState, useEffect } from 'react'
import { getSystemInfo } from '../data/mockData'
import type { SystemInfo } from '../data/types'

export default function SettingsPage() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)
  // @alpha: OpenClaw Token 配置 — 预留 RPC 管理接口
  const [openclawToken, setOpenclawToken] = useState('')
  const [openclawEndpoint, setOpenclawEndpoint] = useState('ws://localhost:3002')
  const [tokenSaved, setTokenSaved] = useState(false)

  useEffect(() => {
    setSysInfo(getSystemInfo())
  }, [])

  const handleSaveToken = () => {
    // @alpha: 实际场景中此处调用 OpenClaw RPC 接口验证 token 有效性
    // POST /openclaw/rpc { method: 'validateToken', params: { token } }
    // 验证通过后存入 localStorage 或后端
    console.log('[SettingsPage] 保存 OpenClaw 配置:', {
      endpoint: openclawEndpoint,
      tokenLength: openclawToken.length,
    })
    setTokenSaved(true)
    setTimeout(() => setTokenSaved(false), 3000)
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">系统设置</h1>
        <p className="admin-page-header__subtitle">系统配置与 OpenClaw 引擎管理</p>
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
                  <div className="admin-detail__label">节点数</div>
                  <div className="admin-detail__value">{sysInfo.nodeCount} 个</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">最近备份</div>
                  <div className="admin-detail__value">{sysInfo.lastBackup}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OpenClaw Token 配置 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">⚡ OpenClaw 引擎配置</h2>
          </div>
          <div className="admin-panel__body">
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-lg)', marginTop: 0 }}>
              配置 OpenClaw 智能体引擎的连接信息。Token 用于通过 WebSocket/RPC 接口管理 AI 代理、节点和任务。
            </p>

            <div className="admin-form-group">
              <label className="admin-form-label">WebSocket / RPC 端点</label>
              <input
                className="admin-form-input"
                value={openclawEndpoint}
                onChange={e => setOpenclawEndpoint(e.target.value)}
                placeholder="例如: ws://192.168.1.100:3002"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">API Token</label>
              <input
                className="admin-form-input"
                type="password"
                value={openclawToken}
                onChange={e => setOpenclawToken(e.target.value)}
                placeholder="输入 OpenClaw API Token"
              />
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                Token 通过 RPC 接口進行验证 (POST /openclaw/rpc)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <button className="admin-btn admin-btn--primary" onClick={handleSaveToken}>
                保存配置
              </button>
              {tokenSaved && (
                <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-small)' }}>
                  ✅ 配置已保存
                </span>
              )}
            </div>
          </div>
        </div>

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

        {/* OpenClaw RPC 接口说明 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">📡 RPC 接口说明</h2>
          </div>
          <div className="admin-panel__body">
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', marginTop: 0, marginBottom: 'var(--space-md)' }}>
              通过 Token 认证后，可调用以下 OpenClaw RPC 接口管理引擎：
            </p>
            <table className="admin-table" style={{ fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr>
                  <th>接口</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/agents</td><td>AI 代理列表</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>POST /openclaw/agents</td><td>创建 AI 代理</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/nodes</td><td>算力节点列表</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>POST /openclaw/rpc</td><td>通用 RPC 调用</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/sessions</td><td>会话列表</td></tr>
                <tr><td style={{ fontFamily: 'var(--font-mono)' }}>GET /openclaw/events</td><td>事件列表</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
