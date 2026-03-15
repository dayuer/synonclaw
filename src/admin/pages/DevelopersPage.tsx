// @alpha: 开发者网络管理页面
import { useState, useEffect, useCallback } from 'react'
import { getDevelopers, getDeveloperById, updateDeveloperCertLevel } from '../data/mockData'
import type { Developer, CertLevel } from '../data/types'
import { CERT_LEVEL_LABELS } from '../data/types'

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [selectedDev, setSelectedDev] = useState<Developer | null>(null)

  const refresh = useCallback(() => setDevelopers(getDevelopers()), [])
  useEffect(() => { refresh() }, [refresh])

  const openDetail = (dev: Developer) => setSelectedDev(dev)

  const handleCertChange = (id: string, newLevel: CertLevel) => {
    updateDeveloperCertLevel(id, newLevel)
    const updated = getDeveloperById(id)
    if (updated) setSelectedDev(updated)
    refresh()
  }

  // 详情视图
  if (selectedDev) {
    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelectedDev(null)}>开发者网络</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selectedDev.name}</span>
        </div>

        <div className="admin-page-header">
          <h1 className="admin-page-header__title">{selectedDev.name}</h1>
          <p className="admin-page-header__subtitle">{selectedDev.school} · 加入于 {selectedDev.joinedAt}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          {/* 基本信息 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">个人信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail__field" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="admin-detail__label">状态</div>
                <div className="admin-detail__value">
                  <span className={`status-badge status-badge--${selectedDev.status}`}>
                    <span className="status-badge__dot" />{selectedDev.status === 'active' ? '活跃' : '停用'}
                  </span>
                </div>
              </div>
              <div className="admin-detail__field" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="admin-detail__label">认证等级</div>
                <div className="admin-detail__value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className={`status-badge status-badge--${selectedDev.certLevel}`}>
                    <span className="status-badge__dot" />{CERT_LEVEL_LABELS[selectedDev.certLevel]}
                  </span>
                  <select
                    className="admin-form-select"
                    value={selectedDev.certLevel}
                    onChange={e => handleCertChange(selectedDev.id, e.target.value as CertLevel)}
                    style={{ width: 120 }}
                  >
                    <option value="junior">初级</option>
                    <option value="mid">中级</option>
                    <option value="senior">高级</option>
                  </select>
                </div>
              </div>
              <div className="admin-detail__field" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="admin-detail__label">技能标签</div>
                <div className="admin-detail__value">
                  {selectedDev.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="admin-detail__field">
                <div className="admin-detail__label">完成任务数</div>
                <div className="admin-detail__value">{selectedDev.taskCount}</div>
              </div>
            </div>
          </div>

          {/* 右侧：认证历史 + 任务记录 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">认证历史</h2>
              </div>
              <div className="admin-panel__body">
                <div className="admin-timeline">
                  {[...selectedDev.certHistory].reverse().map((cert, idx) => (
                    <div className="admin-timeline__item" key={idx}>
                      <div className="admin-timeline__dot" />
                      <div className="admin-timeline__time">{cert.timestamp}</div>
                      <div className="admin-timeline__text">
                        <span className={`status-badge status-badge--${cert.level}`} style={{ marginRight: 8 }}>
                          <span className="status-badge__dot" />{CERT_LEVEL_LABELS[cert.level]}
                        </span>
                        {cert.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel__header">
                <h2 className="admin-panel__title">任务记录 ({selectedDev.taskRecords.length})</h2>
              </div>
              {selectedDev.taskRecords.length === 0 ? (
                <div className="admin-empty" style={{ padding: 'var(--space-2xl)' }}>
                  <div className="admin-empty__icon">📝</div>
                  <p className="admin-empty__title">暂无任务记录</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>任务</th>
                      <th>状态</th>
                      <th>完成时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDev.taskRecords.map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>
                          <span className={`status-badge status-badge--${task.status}`}>
                            <span className="status-badge__dot" />
                            {task.status === 'completed' ? '已完成' : task.status === 'in-progress' ? '进行中' : '已取消'}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {task.completedAt || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
        <h1 className="admin-page-header__title">开发者网络</h1>
        <p className="admin-page-header__subtitle">管理认证开发者人才储备池</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            共 {developers.length} 位开发者
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>学校</th>
              <th>技能</th>
              <th>认证等级</th>
              <th>状态</th>
              <th>任务数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {developers.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.school}</td>
                <td style={{ maxWidth: 200 }}>
                  {d.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </td>
                <td>
                  <span className={`status-badge status-badge--${d.certLevel}`}>
                    <span className="status-badge__dot" />{CERT_LEVEL_LABELS[d.certLevel]}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-badge--${d.status}`}>
                    <span className="status-badge__dot" />{d.status === 'active' ? '活跃' : '停用'}
                  </span>
                </td>
                <td>{d.taskCount}</td>
                <td>
                  <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openDetail(d)}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
