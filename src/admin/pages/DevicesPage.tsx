// @alpha: 设备管理页面 — 每台设备 = 一个 OpenClaw 实例
import { useState, useEffect, useCallback } from 'react'
import { getDevices, getDeviceById, addDevice, removeDevice, getDevicesByCustomerId } from '../data/mockData'
import { getCustomers } from '../data/mockData'
import type { Device, DeviceStatus } from '../data/types'
import { DEVICE_STATUS_LABELS } from '../data/types'

interface AddDeviceForm {
  name: string
  customerId: string
  customerName: string
  productName: string
  token: string
  endpoint: string
}

const EMPTY_FORM: AddDeviceForm = {
  name: '', customerId: '', customerName: '', productName: '',
  token: '', endpoint: 'ws://',
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<AddDeviceForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof AddDeviceForm, string>>>({})
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | ''>('')

  const refresh = useCallback(() => setDevices(getDevices()), [])
  useEffect(() => { refresh() }, [refresh])

  const filtered = filterStatus
    ? devices.filter(d => d.status === filterStatus)
    : devices

  const onlineCount = devices.filter(d => d.status === 'online').length
  const totalAgents = devices.reduce((sum, d) => sum + d.agentCount, 0)

  const customers = getCustomers()

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.name.trim()) newErrors.name = '设备名称不能为空'
    if (!form.token.trim()) newErrors.token = 'Token 不能为空'
    if (!form.endpoint.trim() || form.endpoint === 'ws://') newErrors.endpoint = '请输入有效的端点地址'
    if (!form.customerId) newErrors.customerId = '请选择所属客户'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    addDevice({
      name: form.name,
      customerId: form.customerId,
      customerName: form.customerName,
      productName: form.productName || 'SynonClaw',
      token: form.token.slice(0, 6) + '****' + form.token.slice(-4),
      endpoint: form.endpoint,
    })
    setShowAddModal(false)
    setForm(EMPTY_FORM)
    refresh()
  }

  const handleRemove = (id: string) => {
    removeDevice(id)
    setSelectedDevice(null)
    refresh()
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setForm(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || '',
    }))
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
          <button className="admin-btn admin-btn--danger" onClick={() => handleRemove(selectedDevice.id)}>
            解除托管
          </button>
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
                  <p className="admin-empty__desc">通过 RPC 接口 POST /openclaw/agents 创建</p>
                </div>
              ) : (
                <div className="system-metrics">
                  <div className="system-metric">
                    <span className="system-metric__label">运行中代理</span>
                    <span className="system-metric__value system-metric__value--accent">{selectedDevice.agentCount}</span>
                  </div>
                  <div className="system-metric">
                    <span className="system-metric__label">管理接口</span>
                    <span className="system-metric__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      GET {selectedDevice.endpoint.replace('ws://', 'http://').replace(':3002', ':8000')}/openclaw/agents
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 同客户其他设备 */}
          {siblingDevices.length > 0 && (
            <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">同客户其他设备 ({siblingDevices.length})</h2>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>设备名</th>
                    <th>产品</th>
                    <th>端点</th>
                    <th>状态</th>
                    <th>代理数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {siblingDevices.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.productName}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{d.endpoint}</td>
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

  // 列表视图
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
          <button className="admin-btn admin-btn--primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowAddModal(true) }}>
            + 添加设备
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>设备名</th>
              <th>所属客户</th>
              <th>产品</th>
              <th>端点</th>
              <th>状态</th>
              <th>代理数</th>
              <th>最后心跳</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="admin-empty">
                  <div className="admin-empty__icon">🖥️</div>
                  <p className="admin-empty__title">暂无设备</p>
                  <p className="admin-empty__desc">点击"添加设备"通过 Token 托管 OpenClaw 节点</p>
                </div>
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.customerName}</td>
                <td style={{ fontSize: 'var(--text-small)' }}>{d.productName}</td>
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

      {/* 添加设备模态框 */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">添加 OpenClaw 设备</h3>
              <button className="admin-modal__close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', marginTop: 0, marginBottom: 'var(--space-lg)' }}>
                输入设备的 OpenClaw Token 和 WebSocket 端点，系统将验证连接并纳入托管。
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">设备名称 *</label>
                <input
                  className={`admin-form-input ${errors.name ? 'error' : ''}`}
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如: HQ-RACK-01"
                />
                {errors.name && <p className="admin-form-error">{errors.name}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">所属客户 *</label>
                <select
                  className={`admin-form-select ${errors.customerId ? 'error' : ''}`}
                  value={form.customerId}
                  onChange={e => handleCustomerChange(e.target.value)}
                >
                  <option value="">选择客户...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.customerId && <p className="admin-form-error">{errors.customerId}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">产品型号</label>
                <input
                  className="admin-form-input"
                  value={form.productName}
                  onChange={e => setForm(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="例如: SynonClaw Desk Pro"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">OpenClaw API Token *</label>
                <input
                  className={`admin-form-input ${errors.token ? 'error' : ''}`}
                  value={form.token}
                  onChange={e => setForm(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="输入设备的 OpenClaw Token"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                {errors.token && <p className="admin-form-error">{errors.token}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">WebSocket / RPC 端点 *</label>
                <input
                  className={`admin-form-input ${errors.endpoint ? 'error' : ''}`}
                  value={form.endpoint}
                  onChange={e => setForm(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="例如: ws://192.168.1.100:3002"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                {errors.endpoint && <p className="admin-form-error">{errors.endpoint}</p>}
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                  设备内网地址，用于 WebSocket 通信和 RPC 管理
                </p>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleAdd}>验证并添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
