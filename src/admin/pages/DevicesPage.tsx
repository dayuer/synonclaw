// @alpha: 设备管理页面 — 管理员仅查看/配置/解除托管，不负责添加
import { useState, useEffect, useCallback } from 'react'
import { getDevices, getDeviceById, removeDevice, getDevicesByCustomerId, maskPasscode } from '../data/mockData'
import type { Device, DeviceStatus } from '../data/types'
import { DEVICE_STATUS_LABELS, MODEL_PROVIDER_LABELS, GNB_CRYPTO_TYPE_LABELS, GNB_KEY_UPDATE_LABELS, NAT_TYPE_LABELS } from '../data/types'
import DeviceConfigPage from './DeviceConfigPage'

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | ''>('')

  const refresh = useCallback(() => setDevices(getDevices()), [])
  useEffect(() => { refresh() }, [refresh])

  const filtered = filterStatus
    ? devices.filter(d => d.status === filterStatus)
    : devices

  const onlineCount = devices.filter(d => d.status === 'online').length
  const totalAgents = devices.reduce((sum, d) => sum + d.agentCount, 0)

  const handleRemove = (id: string) => {
    removeDevice(id)
    setSelectedDevice(null)
    refresh()
  }

  // @alpha: 设备配置页
  if (showConfig && selectedDevice) {
    return (
      <DeviceConfigPage
        deviceId={selectedDevice.id}
        onBack={() => {
          setShowConfig(false)
          const updated = getDeviceById(selectedDevice.id)
          if (updated) setSelectedDevice(updated)
          refresh()
        }}
      />
    )
  }

  // 详情视图
  if (selectedDevice) {
    const siblingDevices = getDevicesByCustomerId(selectedDevice.customerId)
      .filter(d => d.id !== selectedDevice.id)

    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelectedDevice(null)}>设备管理</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selectedDevice.name}</span>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="admin-page-header__title">
              <span className={`status-badge status-badge--${selectedDevice.status}`} style={{ marginRight: 'var(--space-md)' }}>
                <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[selectedDevice.status]}
              </span>
              {selectedDevice.name}
            </h1>
            <p className="admin-page-header__subtitle">{selectedDevice.customerName} · {selectedDevice.productName}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="admin-btn admin-btn--primary" onClick={() => setShowConfig(true)}>
              ⚙️ 远程配置
            </button>
            <button className="admin-btn admin-btn--danger" onClick={() => handleRemove(selectedDevice.id)}>
              解除托管
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          {/* 连接信息 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">⚡ 连接信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">RPC 端点</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)' }}>
                    {selectedDevice.endpoint}
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">API Token</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {selectedDevice.token}
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">运行时间</div>
                  <div className="admin-detail__value">{selectedDevice.uptime}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">最后心跳</div>
                  <div className="admin-detail__value">{selectedDevice.lastSeen}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">注册时间</div>
                  <div className="admin-detail__value">{selectedDevice.registeredAt}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RPC 配置概览 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🧠 RPC 配置概览</h2>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setShowConfig(true)}>编辑</button>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">模型供应商</div>
                  <div className="admin-detail__value">{(MODEL_PROVIDER_LABELS as Record<string, string>)[selectedDevice.rpcConfig.modelProvider] || selectedDevice.rpcConfig.modelProvider}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">温度</div>
                  <div className="admin-detail__value">{selectedDevice.rpcConfig.temperature}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">启用插件</div>
                  <div className="admin-detail__value">
                    {selectedDevice.rpcConfig.plugins.filter(p => p.enabled).length} / {selectedDevice.rpcConfig.plugins.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI 代理 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🤖 AI 代理 ({selectedDevice.agentCount})</h2>
            </div>
            <div className="admin-panel__body">
              {selectedDevice.agentCount === 0 ? (
                <div className="admin-empty" style={{ padding: 'var(--space-2xl)' }}>
                  <div className="admin-empty__icon">🤖</div>
                  <p className="admin-empty__title">无运行中的代理</p>
                  <p className="admin-empty__desc">创建数字员工后，代理将自动启动</p>
                </div>
              ) : (
                <div className="system-metrics">
                  <div className="system-metric">
                    <span className="system-metric__label">运行中代理</span>
                    <span className="system-metric__value system-metric__value--accent">{selectedDevice.agentCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* @alpha: GNB 安全面板 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🔐 GNB 安全</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">加密类型</div>
                  <div className="admin-detail__value">{GNB_CRYPTO_TYPE_LABELS[selectedDevice.gnbConfig.cryptoType]}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">密钥轮换</div>
                  <div className="admin-detail__value">{GNB_KEY_UPDATE_LABELS[selectedDevice.gnbConfig.keyUpdateInterval]}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">Passcode</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)' }}>{maskPasscode(selectedDevice.gnbConfig.passcode)}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">NTP 同步</div>
                  <div className="admin-detail__value">
                    {selectedDevice.gnbConfig.ntpSynced
                      ? <span style={{ color: 'var(--color-accent-green)' }}>✓ 已同步</span>
                      : <span style={{ color: 'var(--color-accent-yellow, #f0a030)' }}>✗ 未同步</span>
                    }
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">NAT 类型</div>
                  <div className="admin-detail__value">{NAT_TYPE_LABELS[selectedDevice.gnbConfig.natType]}</div>
                </div>
              </div>
              {selectedDevice.gnbConfig.keyUpdateInterval === 'none' && (
                <div className="security-warning security-warning--red">
                  ⚠️ 密钥轮换未激活，建议启用 MINUTE 模式
                </div>
              )}
              {!selectedDevice.gnbConfig.ntpSynced && (
                <div className="security-warning security-warning--yellow">
                  ⚠️ NTP 未同步，MINUTE 模式下可能导致通信中断
                </div>
              )}
            </div>
          </div>

          {/* 同客户其他设备 */}
          {siblingDevices.length > 0 && (
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">同客户其他设备 ({siblingDevices.length})</h2>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>设备名</th>
                    <th>状态</th>
                    <th>代理数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {siblingDevices.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>
                        <span className={`status-badge status-badge--${d.status}`}>
                          <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td>{d.agentCount}</td>
                      <td>
                        <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => {
                          const updated = getDeviceById(d.id)
                          if (updated) setSelectedDevice(updated)
                        }}>查看</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 列表视图 — 无添加入口，设备由客户自行绑定
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">设备管理</h1>
        <p className="admin-page-header__subtitle">管理托管的 OpenClaw 算力节点</p>
      </div>

      {/* 顶部概览 */}
      <div className="stat-cards" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value">{devices.length}</p>
          <p className="stat-card__label">总设备数</p>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value" style={{ color: 'var(--color-accent-green)' }}>{onlineCount}</p>
          <p className="stat-card__label">在线</p>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value">{totalAgents}</p>
          <p className="stat-card__label">运行中代理</p>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value">{devices.length > 0 ? Math.round(onlineCount / devices.length * 100) : 0}%</p>
          <p className="stat-card__label">在线率</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__left">
            <select className="admin-form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value as DeviceStatus | '')} style={{ width: 120 }}>
              <option value="">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="error">异常</option>
            </select>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
              {filtered.length} / {devices.length} 台设备
            </span>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>设备名</th>
              <th>所属客户</th>
              <th>端点</th>
              <th>状态</th>
              <th>代理数</th>
              <th>最后心跳</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="admin-empty">
                  <div className="admin-empty__icon">🖥️</div>
                  <p className="admin-empty__title">暂无托管设备</p>
                  <p className="admin-empty__desc">设备将在客户绑定 Token 后自动出现</p>
                </div>
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.customerName}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{d.endpoint}</td>
                <td>
                  <span className={`status-badge status-badge--${d.status}`}>
                    <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[d.status]}
                  </span>
                </td>
                <td>{d.agentCount}</td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{d.lastSeen}</td>
                <td>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setSelectedDevice(d)}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
