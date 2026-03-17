// @alpha: 数字员工管理页 — 角色定义 + 设备绑定 + 成员分配
import { useState, useEffect, useCallback } from 'react'
import {
  getDigitalWorkers, getDigitalWorkerById, addDigitalWorker, updateDigitalWorker, removeDigitalWorker,
  assignWorkerToMember, getDevices, getMembers, getDeviceById,
} from '../data/mockData'
import type { DigitalWorker, Device, TenantMember } from '../data/types'
import { DEVICE_STATUS_LABELS, WORKER_TEMPLATES, WORKER_TEMPLATE_GROUPS } from '../data/types'

interface WorkerForm {
  name: string
  description: string
  deviceId: string
  deviceName: string
  systemPrompt: string
  plugins: string[]
}

const EMPTY_FORM: WorkerForm = {
  name: '', description: '', deviceId: '', deviceName: '',
  systemPrompt: '', plugins: [],
}

const AVAILABLE_PLUGINS = [
  { id: 'web_search', name: '联网搜索' },
  { id: 'code_exec', name: '代码执行' },
  { id: 'file_mgmt', name: '文件管理' },
  { id: 'calendar', name: '日历' },
  { id: 'email', name: '邮件' },
]

export default function WorkersPage() {
  const [workers, setWorkers] = useState<DigitalWorker[]>([])
  const [selected, setSelected] = useState<DigitalWorker | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<WorkerForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof WorkerForm, string>>>({})
  const [showAssign, setShowAssign] = useState(false)
  const [assignMemberIds, setAssignMemberIds] = useState<string[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const devices: Device[] = getDevices()
  const members: TenantMember[] = getMembers()

  const refresh = useCallback(() => setWorkers(getDigitalWorkers()), [])
  useEffect(() => { refresh() }, [refresh])

  // @alpha: 应用角色模板 — 自动填充表单
  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (!templateId) return
    const tpl = WORKER_TEMPLATES.find(t => t.id === templateId)
    if (!tpl) return
    setForm(prev => ({
      ...prev,
      name: tpl.name,
      description: tpl.description,
      systemPrompt: tpl.systemPrompt,
      plugins: [...tpl.plugins],
    }))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = '角色名不能为空'
    if (!form.deviceId) e.deviceId = '必须绑定至少一台设备'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    if (editId) {
      updateDigitalWorker(editId, {
        name: form.name,
        description: form.description,
        deviceId: form.deviceId,
        deviceName: form.deviceName,
        systemPrompt: form.systemPrompt,
        plugins: form.plugins,
      })
    } else {
      addDigitalWorker({
        tenantId: 't1',
        name: form.name,
        description: form.description,
        deviceId: form.deviceId,
        deviceName: form.deviceName,
        systemPrompt: form.systemPrompt,
        plugins: form.plugins,
      })
    }

    setShowModal(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    refresh()
  }

  const openEdit = (w: DigitalWorker) => {
    setEditId(w.id)
    setForm({
      name: w.name,
      description: w.description,
      deviceId: w.deviceId,
      deviceName: w.deviceName,
      systemPrompt: w.systemPrompt,
      plugins: [...w.plugins],
    })
    setErrors({})
    setShowModal(true)
  }

  const handleDeviceChange = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId)
    setForm(prev => ({ ...prev, deviceId, deviceName: device?.name || '' }))
  }

  const openAssign = (w: DigitalWorker) => {
    setSelected(w)
    setAssignMemberIds([...w.assignedMemberIds])
    setShowAssign(true)
  }

  const handleAssignSave = () => {
    if (!selected) return
    assignWorkerToMember(selected.id, assignMemberIds)
    setShowAssign(false)
    refresh()
    // 刷新详情
    const updated = getDigitalWorkerById(selected.id)
    if (updated) setSelected(updated)
  }

  // 详情视图
  if (selected && !showAssign) {
    const device = getDeviceById(selected.deviceId)

    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelected(null)}>数字员工</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selected.name}</span>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="admin-page-header__title">
              <span className={`status-badge status-badge--${selected.status === 'active' ? 'online' : 'offline'}`} style={{ marginRight: 'var(--space-md)' }}>
                <span className="status-badge__dot" />{selected.status === 'active' ? '运行中' : '已停用'}
              </span>
              {selected.name}
            </h1>
            <p className="admin-page-header__subtitle">{selected.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="admin-btn admin-btn--secondary" onClick={() => openEdit(selected)}>编辑</button>
            <button className="admin-btn admin-btn--primary" onClick={() => openAssign(selected)}>分配成员</button>
            <button className="admin-btn admin-btn--danger" onClick={() => { removeDigitalWorker(selected.id); setSelected(null); refresh() }}>删除</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          {/* 绑定设备 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🖥️ 绑定设备</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">设备名</div>
                  <div className="admin-detail__value" style={{ fontWeight: 600 }}>{selected.deviceName}</div>
                </div>
                {device && (
                  <>
                    <div className="admin-detail__field">
                      <div className="admin-detail__label">设备状态</div>
                      <div className="admin-detail__value">
                        <span className={`status-badge status-badge--${device.status}`}>
                          <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[device.status]}
                        </span>
                      </div>
                    </div>
                    <div className="admin-detail__field">
                      <div className="admin-detail__label">端点</div>
                      <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{device.endpoint}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 分配的成员 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">👥 分配的成员 ({selected.assignedMemberIds.length})</h2>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openAssign(selected)}>管理</button>
            </div>
            <div className="admin-panel__body">
              {selected.assignedMemberIds.length === 0 ? (
                <div className="admin-empty" style={{ padding: 'var(--space-xl)' }}>
                  <p className="admin-empty__title">暂无分配</p>
                  <p className="admin-empty__desc">点击"分配成员"将此数字员工分配给团队成员</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {selected.assignedMemberIds.map(mid => {
                    const m = members.find(mm => mm.id === mid)
                    return m ? (
                      <div key={mid} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)',
                      }}>
                        <span style={{ fontWeight: 500 }}>{m.name}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{m.department}</span>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 系统 Prompt */}
          <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">💬 系统 Prompt</h2>
            </div>
            <div className="admin-panel__body">
              <pre style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)',
                color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap',
                margin: 0, lineHeight: 1.6,
              }}>
                {selected.systemPrompt || '（未设置）'}
              </pre>
            </div>
          </div>

          {/* 启用插件 */}
          <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🔌 启用插件</h2>
            </div>
            <div className="admin-panel__body">
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                {selected.plugins.length === 0 ? (
                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>无启用插件</span>
                ) : selected.plugins.map(pid => {
                  const p = AVAILABLE_PLUGINS.find(ap => ap.id === pid)
                  return (
                    <span key={pid} style={{
                      padding: 'var(--space-xs) var(--space-md)',
                      background: 'var(--color-accent-alpha)',
                      borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                      color: 'var(--color-accent)',
                    }}>
                      {p?.name || pid}
                    </span>
                  )
                })}
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
        <h1 className="admin-page-header__title">数字员工</h1>
        <p className="admin-page-header__subtitle">定义 AI 角色、绑定设备、分配给团队成员</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            {workers.length} 个数字员工
          </span>
          <button className="admin-btn admin-btn--primary" onClick={() => {
            setEditId(null); setForm(EMPTY_FORM); setErrors({}); setSelectedTemplateId(''); setShowModal(true)
          }}>
            + 创建数字员工
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>角色名</th>
              <th>描述</th>
              <th>绑定设备</th>
              <th>分配成员</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="admin-empty">
                  <div className="admin-empty__icon">🤖</div>
                  <p className="admin-empty__title">暂无数字员工</p>
                  <p className="admin-empty__desc">创建数字员工，将 OpenClaw 设备包装为业务角色</p>
                </div>
              </td></tr>
            ) : workers.map(w => (
              <tr key={w.id}>
                <td style={{ fontWeight: 600 }}>{w.name}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.description}</td>
                <td>{w.deviceName}</td>
                <td>{w.assignedMemberIds.length} 人</td>
                <td>
                  <span className={`status-badge status-badge--${w.status === 'active' ? 'online' : 'offline'}`}>
                    <span className="status-badge__dot" />{w.status === 'active' ? '运行中' : '已停用'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => {
                    const full = getDigitalWorkerById(w.id)
                    if (full) setSelected(full)
                  }}>查看</button>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEdit(w)}>编辑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{editId ? '编辑数字员工' : '创建数字员工'}</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              {/* @alpha: 模板选择器 — 仅在创建模式显示 */}
              {!editId && (
                <div className="admin-form-group">
                  <label className="admin-form-label">选择模板</label>
                  <select
                    className="admin-form-select"
                    value={selectedTemplateId}
                    onChange={e => applyTemplate(e.target.value)}
                  >
                    <option value="">自定义（空白创建）</option>
                    {WORKER_TEMPLATE_GROUPS.map(group => (
                      <optgroup key={group} label={group}>
                        {WORKER_TEMPLATES.filter(t => t.group === group).map(t => (
                          <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {selectedTemplateId && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
                      模板已填充表单，你仍可修改任意字段
                    </p>
                  )}
                </div>
              )}
              <div className="admin-form-group">
                <label className="admin-form-label">角色名 *</label>
                <input
                  className={`admin-form-input ${errors.name ? 'error' : ''}`}
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：程序员、财务助理"
                />
                {errors.name && <p className="admin-form-error">{errors.name}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">描述</label>
                <input
                  className="admin-form-input"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简要描述此数字员工的职能"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">绑定设备 *</label>
                <select
                  className={`admin-form-select ${errors.deviceId ? 'error' : ''}`}
                  value={form.deviceId}
                  onChange={e => handleDeviceChange(e.target.value)}
                >
                  <option value="">选择设备...</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({DEVICE_STATUS_LABELS[d.status]})</option>
                  ))}
                </select>
                {errors.deviceId && <p className="admin-form-error">{errors.deviceId}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">系统 Prompt</label>
                <textarea
                  className="admin-form-textarea"
                  value={form.systemPrompt}
                  onChange={e => setForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="定义此数字员工的行为准则..."
                  rows={4}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)', resize: 'vertical' }}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">可用插件</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  {AVAILABLE_PLUGINS.map(p => {
                    const checked = form.plugins.includes(p.id)
                    return (
                      <label key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
                        padding: 'var(--space-xs) var(--space-md)', borderRadius: 'var(--radius-sm)',
                        background: checked ? 'var(--color-accent-alpha)' : 'var(--color-bg-primary)',
                        border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        cursor: 'pointer', fontSize: 'var(--text-small)',
                      }}>
                        <input
                          type="checkbox" checked={checked}
                          onChange={() => {
                            setForm(prev => ({
                              ...prev,
                              plugins: checked
                                ? prev.plugins.filter(id => id !== p.id)
                                : [...prev.plugins, p.id],
                            }))
                          }}
                          style={{ display: 'none' }}
                        />
                        {p.name}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave}>{editId ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 分配成员模态框 */}
      {showAssign && selected && (
        <div className="admin-modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">分配成员 — {selected.name}</h3>
              <button className="admin-modal__close" onClick={() => setShowAssign(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', marginTop: 0 }}>
                勾选的成员将获得此数字员工的使用权限。
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                {members.filter(m => m.role === 'member').map(m => (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                    padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)',
                    background: assignMemberIds.includes(m.id) ? 'var(--color-accent-alpha)' : 'var(--color-bg-primary)',
                    border: `1px solid ${assignMemberIds.includes(m.id) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={assignMemberIds.includes(m.id)}
                      onChange={() => {
                        setAssignMemberIds(prev =>
                          prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                        )
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{m.department} · {m.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setShowAssign(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleAssignSave}>保存分配</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
