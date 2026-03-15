// @alpha: 团队成员管理页 — CRUD + 角色 + 数字员工关联
import { useState, useEffect, useCallback } from 'react'
import {
  getMembers, getMemberById, addMember, updateMember, removeMember,
  getWorkersByMemberId,
} from '../data/mockData'
import type { TenantMember, MemberRole, DigitalWorker } from '../data/types'
import { MEMBER_ROLE_LABELS } from '../data/types'

interface MemberForm {
  name: string
  email: string
  department: string
  role: MemberRole
}

const EMPTY_FORM: MemberForm = {
  name: '', email: '', department: '', role: 'member',
}

export default function MembersPage() {
  const [membersList, setMembersList] = useState<TenantMember[]>([])
  const [selected, setSelected] = useState<TenantMember | null>(null)
  const [selectedWorkers, setSelectedWorkers] = useState<DigitalWorker[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<MemberForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof MemberForm, string>>>({})

  const refresh = useCallback(() => setMembersList(getMembers()), [])
  useEffect(() => { refresh() }, [refresh])

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = '姓名不能为空'
    if (!form.email.trim()) e.email = '邮箱不能为空'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    if (editId) {
      updateMember(editId, {
        name: form.name,
        email: form.email,
        department: form.department,
        role: form.role,
      })
    } else {
      addMember({
        tenantId: 't1',
        name: form.name,
        email: form.email,
        department: form.department,
        role: form.role,
      })
    }

    setShowModal(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    refresh()
  }

  const openDetail = (m: TenantMember) => {
    const full = getMemberById(m.id)
    if (!full) return
    setSelected(full)
    setSelectedWorkers(getWorkersByMemberId(full.id))
  }

  const openEdit = (m: TenantMember) => {
    setEditId(m.id)
    setForm({ name: m.name, email: m.email, department: m.department, role: m.role })
    setErrors({})
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    removeMember(id)
    setSelected(null)
    refresh()
  }

  // 详情视图
  if (selected) {
    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelected(null)}>团队成员</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selected.name}</span>
        </div>

        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="admin-page-header__title">{selected.name}</h1>
            <p className="admin-page-header__subtitle">{selected.department} · {MEMBER_ROLE_LABELS[selected.role]}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="admin-btn admin-btn--secondary" onClick={() => openEdit(selected)}>编辑</button>
            {selected.role !== 'admin' && (
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(selected.id)}>删除</button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          {/* 基本信息 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">👤 基本信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">邮箱</div>
                  <div className="admin-detail__value">{selected.email}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">部门</div>
                  <div className="admin-detail__value">{selected.department}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">角色</div>
                  <div className="admin-detail__value">
                    <span className={`status-badge status-badge--${selected.role === 'admin' ? 'active' : 'signed'}`}>
                      {MEMBER_ROLE_LABELS[selected.role]}
                    </span>
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">加入时间</div>
                  <div className="admin-detail__value">{selected.createdAt}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 已分配数字员工 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🤖 数字员工 ({selectedWorkers.length})</h2>
            </div>
            <div className="admin-panel__body">
              {selectedWorkers.length === 0 ? (
                <div className="admin-empty" style={{ padding: 'var(--space-xl)' }}>
                  <p className="admin-empty__title">暂无分配</p>
                  <p className="admin-empty__desc">在「数字员工」页面中分配角色给此成员</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {selectedWorkers.map(w => (
                    <div key={w.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-md)',
                      background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{w.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{w.description}</div>
                      </div>
                      <span className={`status-badge status-badge--${w.status === 'active' ? 'online' : 'offline'}`}>
                        <span className="status-badge__dot" />{w.status === 'active' ? '运行中' : '已停用'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 列表视图
  const adminCount = membersList.filter(m => m.role === 'admin').length
  const memberCount = membersList.filter(m => m.role === 'member').length

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">团队成员</h1>
        <p className="admin-page-header__subtitle">管理租户下的团队成员和权限角色</p>
      </div>

      {/* 概览卡片 */}
      <div className="stat-cards" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value">{membersList.length}</p>
          <p className="stat-card__label">总成员</p>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value">{adminCount}</p>
          <p className="stat-card__label">管理员</p>
        </div>
        <div className="stat-card" style={{ cursor: 'default' }}>
          <p className="stat-card__value">{memberCount}</p>
          <p className="stat-card__label">普通成员</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            {membersList.length} 名成员
          </span>
          <button className="admin-btn admin-btn--primary" onClick={() => {
            setEditId(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true)
          }}>
            + 添加成员
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>邮箱</th>
              <th>部门</th>
              <th>角色</th>
              <th>数字员工</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {membersList.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td style={{ fontSize: 'var(--text-small)' }}>{m.email}</td>
                <td>{m.department}</td>
                <td>
                  <span className={`status-badge status-badge--${m.role === 'admin' ? 'active' : 'signed'}`}>
                    {MEMBER_ROLE_LABELS[m.role]}
                  </span>
                </td>
                <td>{m.assignedWorkerIds.length} 个</td>
                <td>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openDetail(m)}>查看</button>
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
              <h3 className="admin-modal__title">{editId ? '编辑成员' : '添加成员'}</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-group">
                <label className="admin-form-label">姓名 *</label>
                <input
                  className={`admin-form-input ${errors.name ? 'error' : ''}`}
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入成员姓名"
                />
                {errors.name && <p className="admin-form-error">{errors.name}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">邮箱 *</label>
                <input
                  className={`admin-form-input ${errors.email ? 'error' : ''}`}
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="输入邮箱地址"
                />
                {errors.email && <p className="admin-form-error">{errors.email}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">部门</label>
                <input
                  className="admin-form-input"
                  value={form.department}
                  onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="例如：研发部"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">角色</label>
                <select
                  className="admin-form-select"
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value as MemberRole }))}
                >
                  <option value="member">成员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave}>{editId ? '保存' : '添加'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
