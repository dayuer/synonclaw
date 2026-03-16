// @alpha: GNB 操作面板 — 节点注册 + 状态监控 + Passcode 控制 + 私域子网规划
import { useState, useEffect, useCallback } from 'react'
import {
  getDevices, getGnbTunnels, maskPasscode,
  registerGnbNode, updateGnbPasscode,
  getSubnets, addSubnet, removeSubnet, getSubnetMembers,
} from '../data/mockData'
import type { Device, GnbTunnel, GnbNodeType, Subnet } from '../data/types'
import {
  DEVICE_STATUS_LABELS, GNB_NODE_TYPE_LABELS, GNB_CRYPTO_TYPE_LABELS,
  GNB_KEY_UPDATE_LABELS, NAT_TYPE_LABELS, TUNNEL_STATUS_LABELS,
} from '../data/types'

type TabType = 'nodes' | 'tunnels' | 'subnets'

export default function NetworkPage() {
  const [tab, setTab] = useState<TabType>('nodes')
  const [devices, setDevices] = useState<Device[]>([])
  const [tunnels, setTunnels] = useState<GnbTunnel[]>([])
  const [subnetsData, setSubnetsData] = useState<Subnet[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [filterNodeType, setFilterNodeType] = useState<GnbNodeType | ''>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  // 模态框状态
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showPasscodeEdit, setShowPasscodeEdit] = useState(false)
  const [showSubnetModal, setShowSubnetModal] = useState(false)

  // 注册表单
  const [regForm, setRegForm] = useState({
    name: '', uuid: '', virtualIp: '', nodeType: 'normal' as GnbNodeType,
    cryptoType: 'arc4' as Device['gnbConfig']['cryptoType'], passcode: '',
  })
  const [regError, setRegError] = useState('')

  // Passcode 编辑
  const [newPasscode, setNewPasscode] = useState('')
  const [passcodeError, setPasscodeError] = useState('')

  // 子网表单
  const [subnetForm, setSubnetForm] = useState({ name: '', cidr: '', passcode: '' })
  const [subnetError, setSubnetError] = useState('')

  const refresh = useCallback(() => {
    setDevices(getDevices())
    setTunnels(getGnbTunnels())
    setSubnetsData(getSubnets())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // @alpha: UUID 截取末 8 位
  const shortUuid = (uuid: string): string =>
    uuid.length > 8 ? `…${uuid.slice(-8)}` : uuid || '—'

  // @alpha: 公钥截取
  const shortKey = (key: string): string =>
    key.length > 16 ? `${key.slice(0, 8)}…${key.slice(-8)}` : key || '—'

  // 筛选节点
  const filteredNodes = devices.filter(d => {
    if (filterNodeType && d.gnbConfig.nodeType !== filterNodeType) return false
    if (filterStatus === 'online' && d.status !== 'online') return false
    if (filterStatus === 'offline' && d.status === 'online') return false
    return true
  })

  // 隧道统计
  const tunnelStats = {
    total: tunnels.length,
    active: tunnels.filter(t => t.status === 'active').length,
    degraded: tunnels.filter(t => t.status === 'degraded').length,
    down: tunnels.filter(t => t.status === 'down').length,
  }

  // @alpha: 隧道行样式判定 — 严格 >200ms 或 >5%
  const tunnelRowClass = (t: GnbTunnel): string => {
    if (t.status === 'down') return 'tunnel-row--down'
    if (t.latency > 200 || t.packetLoss > 5) return 'tunnel-row--degraded'
    return ''
  }

  // ============================================
  // 节点注册
  // ============================================

  const handleRegister = () => {
    setRegError('')

    // 客户端校验
    if (!regForm.name.trim()) { setRegError('节点名不能为空'); return }
    if (!/^[0-9a-fA-F]{8}$/.test(regForm.uuid)) { setRegError('UUID 必须为 8 位十六进制'); return }
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(regForm.virtualIp)) { setRegError('请输入合法的 IPv4 地址'); return }
    if (!/^0x[0-9a-fA-F]{8}$/i.test(regForm.passcode)) { setRegError('Passcode 格式: 0x + 8位十六进制'); return }

    const result = registerGnbNode({
      name: regForm.name,
      uuid: regForm.uuid,
      virtualIp: regForm.virtualIp,
      nodeType: regForm.nodeType,
      cryptoType: regForm.cryptoType,
      passcode: regForm.passcode,
    })

    if ('error' in result) {
      setRegError(result.error)
      return
    }

    // 成功
    setShowRegisterModal(false)
    setRegForm({ name: '', uuid: '', virtualIp: '', nodeType: 'normal', cryptoType: 'arc4', passcode: '' })
    refresh()
  }

  // ============================================
  // Passcode 编辑
  // ============================================

  const handlePasscodeUpdate = () => {
    if (!selectedDevice) return
    setPasscodeError('')

    if (!/^0x[0-9a-fA-F]{8}$/i.test(newPasscode)) {
      setPasscodeError('格式: 0x + 8位十六进制')
      return
    }

    const result = updateGnbPasscode(selectedDevice.id, newPasscode)
    if ('error' in result) {
      setPasscodeError(result.error)
      return
    }

    setShowPasscodeEdit(false)
    setNewPasscode('')
    // 刷新详情
    const updated = getDevices().find(d => d.id === selectedDevice.id)
    if (updated) setSelectedDevice(updated)
    refresh()
  }

  // ============================================
  // 子网管理
  // ============================================

  const handleAddSubnet = () => {
    setSubnetError('')

    if (!subnetForm.name.trim()) { setSubnetError('名称不能为空'); return }
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(subnetForm.cidr)) { setSubnetError('CIDR 格式: 如 10.1.0.0/24'); return }
    if (!/^0x[0-9a-fA-F]{8}$/i.test(subnetForm.passcode)) { setSubnetError('Passcode 格式: 0x + 8位十六进制'); return }

    addSubnet(subnetForm)
    setShowSubnetModal(false)
    setSubnetForm({ name: '', cidr: '', passcode: '' })
    refresh()
  }

  const handleRemoveSubnet = (id: string) => {
    const result = removeSubnet(id)
    if (typeof result === 'object' && 'error' in result) {
      alert(result.error)
      return
    }
    refresh()
  }

  // ============================================
  // 节点详情面板
  // ============================================

  if (selectedDevice) {
    const cfg = selectedDevice.gnbConfig
    const relatedTunnels = tunnels.filter(
      t => t.sourceNodeId === selectedDevice.id || t.targetNodeId === selectedDevice.id
    )

    return (
      <div>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb__item" onClick={() => setSelectedDevice(null)}>网络拓扑</span>
          <span className="admin-breadcrumb__separator">/</span>
          <span className="admin-breadcrumb__current">{selectedDevice.name}</span>
        </div>

        <div className="admin-page-header">
          <h1 className="admin-page-header__title">
            <span className={`status-badge status-badge--${selectedDevice.status}`} style={{ marginRight: 'var(--space-md)' }}>
              <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[selectedDevice.status]}
            </span>
            {selectedDevice.name}
          </h1>
          <p className="admin-page-header__subtitle">
            {GNB_NODE_TYPE_LABELS[cfg.nodeType]} · {cfg.virtualIp}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          {/* GNB 节点信息 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🌐 GNB 节点信息</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">UUID</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)' }}>{cfg.uuid}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">虚拟 IP</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)' }}>{cfg.virtualIp}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">公钥</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {shortKey(cfg.publicKey)}
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">NAT 类型</div>
                  <div className="admin-detail__value">{NAT_TYPE_LABELS[cfg.natType]}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">关联设备</div>
                  <div className="admin-detail__value">{selectedDevice.name} ({selectedDevice.productName})</div>
                </div>
              </div>
            </div>
          </div>

          {/* 安全配置 + Passcode 编辑 */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🔐 安全配置</h2>
            </div>
            <div className="admin-panel__body">
              <div className="admin-detail">
                <div className="admin-detail__field">
                  <div className="admin-detail__label">加密类型</div>
                  <div className="admin-detail__value">{GNB_CRYPTO_TYPE_LABELS[cfg.cryptoType]}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">密钥轮换</div>
                  <div className="admin-detail__value">{GNB_KEY_UPDATE_LABELS[cfg.keyUpdateInterval]}</div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">Passcode</div>
                  <div className="admin-detail__value" style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    {maskPasscode(cfg.passcode)}
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => { setShowPasscodeEdit(true); setNewPasscode(''); setPasscodeError('') }}
                    >
                      ✏️ 编辑
                    </button>
                  </div>
                </div>
                <div className="admin-detail__field">
                  <div className="admin-detail__label">NTP 同步</div>
                  <div className="admin-detail__value">
                    {cfg.ntpSynced
                      ? <span style={{ color: 'var(--color-accent-green)' }}>✓ 已同步</span>
                      : <span style={{ color: 'var(--color-accent-yellow, #f0a030)' }}>✗ 未同步</span>
                    }
                  </div>
                </div>
              </div>
              {cfg.keyUpdateInterval === 'none' && (
                <div className="security-warning security-warning--red">
                  ⚠️ 密钥轮换未激活，建议启用 MINUTE 模式
                </div>
              )}
              {!cfg.ntpSynced && (
                <div className="security-warning security-warning--yellow">
                  ⚠️ NTP 未同步，MINUTE 模式下可能导致通信中断
                </div>
              )}
            </div>
          </div>

          {/* Passcode 编辑弹窗 */}
          {showPasscodeEdit && (
            <div className="admin-modal-overlay" onClick={() => setShowPasscodeEdit(false)}>
              <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal__header">
                  <h3 className="admin-modal__title">编辑 Passcode</h3>
                  <button className="admin-modal__close" onClick={() => setShowPasscodeEdit(false)}>×</button>
                </div>
                <div className="admin-modal__body">
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)', fontSize: 'var(--text-small)' }}>
                    当前: <code>{maskPasscode(cfg.passcode)}</code>
                  </p>
                  <div className="admin-form-group">
                    <label className="admin-form-label">新 Passcode</label>
                    <input
                      className="admin-form-input"
                      placeholder="0xXXXXXXXX（8位十六进制）"
                      value={newPasscode}
                      onChange={e => setNewPasscode(e.target.value)}
                    />
                  </div>
                  {passcodeError && <div className="admin-form-error">{passcodeError}</div>}
                </div>
                <div className="admin-modal__footer">
                  <button className="admin-btn admin-btn--ghost" onClick={() => setShowPasscodeEdit(false)}>取消</button>
                  <button className="admin-btn admin-btn--primary" onClick={handlePasscodeUpdate}>保存</button>
                </div>
              </div>
            </div>
          )}

          {/* 关联隧道 */}
          <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">🔗 关联隧道 ({relatedTunnels.length})</h2>
            </div>
            {relatedTunnels.length === 0 ? (
              <div className="admin-panel__body">
                <div className="admin-empty" style={{ padding: 'var(--space-xl)' }}>
                  <p className="admin-empty__title">无关联隧道</p>
                </div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>对端节点</th>
                    <th>延迟</th>
                    <th>丢包率</th>
                    <th>加密</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedTunnels.map(t => {
                    const peerName = t.sourceNodeId === selectedDevice.id ? t.targetNodeName : t.sourceNodeName
                    return (
                      <tr key={t.id} className={tunnelRowClass(t)}>
                        <td style={{ fontWeight: 600 }}>{peerName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{t.status === 'down' ? '—' : `${t.latency}ms`}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{t.status === 'down' ? '—' : `${t.packetLoss}%`}</td>
                        <td>{GNB_CRYPTO_TYPE_LABELS[t.cryptoType]}</td>
                        <td>
                          <span className={`status-badge status-badge--${t.status === 'active' ? 'online' : t.status === 'degraded' ? 'error' : 'offline'}`}>
                            <span className="status-badge__dot" />{TUNNEL_STATUS_LABELS[t.status]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // 主列表视图 — 三 Tab
  // ============================================

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">GNB 操作面板</h1>
        <p className="admin-page-header__subtitle">节点注册 · 状态监控 · Passcode 控制 · 私域规划</p>
      </div>

      {/* Tab 切换 */}
      <div className="network-tabs" style={{ marginBottom: 'var(--space-xl)' }}>
        <button
          className={`network-tab ${tab === 'nodes' ? 'network-tab--active' : ''}`}
          onClick={() => setTab('nodes')}
        >
          🖥️ 节点 ({devices.length})
        </button>
        <button
          className={`network-tab ${tab === 'tunnels' ? 'network-tab--active' : ''}`}
          onClick={() => setTab('tunnels')}
        >
          🔗 隧道 ({tunnels.length})
        </button>
        <button
          className={`network-tab ${tab === 'subnets' ? 'network-tab--active' : ''}`}
          onClick={() => setTab('subnets')}
        >
          🏢 私域 ({subnetsData.length})
        </button>
      </div>

      {/* ===== 节点 Tab ===== */}
      {tab === 'nodes' && (
        <div className="admin-table-wrapper">
          <div className="admin-table-toolbar">
            <div className="admin-table-toolbar__left">
              <select className="admin-form-select" value={filterNodeType} onChange={e => setFilterNodeType(e.target.value as GnbNodeType | '')} style={{ width: 140 }}>
                <option value="">全部类型</option>
                <option value="normal">普通节点</option>
                <option value="index">Index 信令</option>
                <option value="forward">Forward 中继</option>
              </select>
              <select className="admin-form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 120 }}>
                <option value="">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
              </select>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                {filteredNodes.length} / {devices.length} 个节点
              </span>
            </div>
            <div className="admin-table-toolbar__right">
              <button className="admin-btn admin-btn--primary" onClick={() => { setShowRegisterModal(true); setRegError('') }}>
                ＋ 注册节点
              </button>
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>节点名</th>
                <th>UUID</th>
                <th>虚拟 IP</th>
                <th>类型</th>
                <th>加密</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="admin-empty">
                    <div className="admin-empty__icon">🌐</div>
                    <p className="admin-empty__title">暂无节点</p>
                    <p className="admin-empty__desc">点击「注册节点」添加 GNB 节点</p>
                  </div>
                </td></tr>
              ) : filteredNodes.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{shortUuid(d.gnbConfig.uuid)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{d.gnbConfig.virtualIp}</td>
                  <td>{GNB_NODE_TYPE_LABELS[d.gnbConfig.nodeType]}</td>
                  <td>{GNB_CRYPTO_TYPE_LABELS[d.gnbConfig.cryptoType]}</td>
                  <td>
                    <span className={`status-badge status-badge--${d.status}`}>
                      <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td>
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setSelectedDevice(d)}>详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== 隧道 Tab ===== */}
      {tab === 'tunnels' && (
        <div>
          {/* 隧道概览 */}
          <div className="stat-cards" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card" style={{ cursor: 'default' }}>
              <p className="stat-card__value">{tunnelStats.total}</p>
              <p className="stat-card__label">总隧道</p>
            </div>
            <div className="stat-card" style={{ cursor: 'default' }}>
              <p className="stat-card__value" style={{ color: 'var(--color-accent-green)' }}>{tunnelStats.active}</p>
              <p className="stat-card__label">正常</p>
            </div>
            <div className="stat-card" style={{ cursor: 'default' }}>
              <p className="stat-card__value" style={{ color: 'var(--color-accent-yellow, #f0a030)' }}>{tunnelStats.degraded}</p>
              <p className="stat-card__label">降级</p>
            </div>
            <div className="stat-card" style={{ cursor: 'default' }}>
              <p className="stat-card__value" style={{ color: 'var(--color-accent-red)' }}>{tunnelStats.down}</p>
              <p className="stat-card__label">断开</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>源节点</th>
                  <th>→</th>
                  <th>目标节点</th>
                  <th>延迟</th>
                  <th>丢包率</th>
                  <th>运行时长</th>
                  <th>加密</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {tunnels.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="admin-empty">
                      <div className="admin-empty__icon">🔗</div>
                      <p className="admin-empty__title">暂无隧道</p>
                      <p className="admin-empty__desc">节点间建立连接后隧道将自动出现</p>
                    </div>
                  </td></tr>
                ) : tunnels.map(t => (
                  <tr key={t.id} className={tunnelRowClass(t)}>
                    <td style={{ fontWeight: 600 }}>{t.sourceNodeName}</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>→</td>
                    <td style={{ fontWeight: 600 }}>{t.targetNodeName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.status === 'down' ? '—' : `${t.latency}ms`}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.status === 'down' ? '—' : `${t.packetLoss}%`}</td>
                    <td>{t.uptime}</td>
                    <td>{GNB_CRYPTO_TYPE_LABELS[t.cryptoType]}</td>
                    <td>
                      <span className={`status-badge status-badge--${t.status === 'active' ? 'online' : t.status === 'degraded' ? 'error' : 'offline'}`}>
                        <span className="status-badge__dot" />{TUNNEL_STATUS_LABELS[t.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== 私域 Tab ===== */}
      {tab === 'subnets' && (
        <div>
          <div className="admin-table-toolbar" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="admin-table-toolbar__left">
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                {subnetsData.length} 个私域子网
              </span>
            </div>
            <div className="admin-table-toolbar__right">
              <button className="admin-btn admin-btn--primary" onClick={() => { setShowSubnetModal(true); setSubnetError('') }}>
                ＋ 创建私域
              </button>
            </div>
          </div>

          {subnetsData.length === 0 ? (
            <div className="admin-empty" style={{ padding: 'var(--space-3xl)' }}>
              <div className="admin-empty__icon">🏢</div>
              <p className="admin-empty__title">暂无私域子网</p>
              <p className="admin-empty__desc">创建私域将节点隔离到独立虚拟网络</p>
            </div>
          ) : (
            <div className="subnet-grid">
              {subnetsData.map(sub => {
                const members = getSubnetMembers(sub.id)
                return (
                  <div key={sub.id} className="subnet-card">
                    <div className="subnet-card__header">
                      <h3 className="subnet-card__title">{sub.name}</h3>
                      <button
                        className="admin-btn admin-btn--ghost admin-btn--sm subnet-card__delete"
                        onClick={() => handleRemoveSubnet(sub.id)}
                        title="删除私域"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="subnet-card__body">
                      <div className="subnet-card__field">
                        <span className="subnet-card__label">CIDR</span>
                        <span className="subnet-card__value" style={{ fontFamily: 'var(--font-mono)' }}>{sub.cidr}</span>
                      </div>
                      <div className="subnet-card__field">
                        <span className="subnet-card__label">Passcode</span>
                        <span className="subnet-card__value" style={{ fontFamily: 'var(--font-mono)' }}>{maskPasscode(sub.passcode)}</span>
                      </div>
                      <div className="subnet-card__field">
                        <span className="subnet-card__label">成员节点</span>
                        <span className="subnet-card__value">{members.length} 个</span>
                      </div>
                    </div>
                    {members.length > 0 && (
                      <div className="subnet-card__members">
                        {members.map(m => (
                          <span key={m.id} className="subnet-card__member-badge">
                            <span className={`status-badge__dot status-badge__dot--${m.status}`} />
                            {m.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== 注册节点模态框 ===== */}
      {showRegisterModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">注册 GNB 节点</h3>
              <button className="admin-modal__close" onClick={() => setShowRegisterModal(false)}>×</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-group">
                <label className="admin-form-label">节点名称</label>
                <input className="admin-form-input" placeholder="如 SZ-NODE-01" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">UUID (8位十六进制)</label>
                <input className="admin-form-input" placeholder="如 00002001" value={regForm.uuid} onChange={e => setRegForm(f => ({ ...f, uuid: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">虚拟 IP</label>
                <input className="admin-form-input" placeholder="如 10.1.1.1" value={regForm.virtualIp} onChange={e => setRegForm(f => ({ ...f, virtualIp: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">节点类型</label>
                  <select className="admin-form-select" value={regForm.nodeType} onChange={e => setRegForm(f => ({ ...f, nodeType: e.target.value as GnbNodeType }))}>
                    <option value="normal">普通节点</option>
                    <option value="index">Index 信令</option>
                    <option value="forward">Forward 中继</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">加密类型</label>
                  <select className="admin-form-select" value={regForm.cryptoType} onChange={e => setRegForm(f => ({ ...f, cryptoType: e.target.value as Device['gnbConfig']['cryptoType'] }))}>
                    <option value="arc4">ARC4</option>
                    <option value="xor">XOR</option>
                    <option value="none">无加密</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Passcode</label>
                <input className="admin-form-input" placeholder="0xXXXXXXXX" value={regForm.passcode} onChange={e => setRegForm(f => ({ ...f, passcode: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              {regError && <div className="admin-form-error">{regError}</div>}
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setShowRegisterModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleRegister}>注册</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 创建私域模态框 ===== */}
      {showSubnetModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSubnetModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">创建私域子网</h3>
              <button className="admin-modal__close" onClick={() => setShowSubnetModal(false)}>×</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-group">
                <label className="admin-form-label">私域名称</label>
                <input className="admin-form-input" placeholder="如 深圳办公室" value={subnetForm.name} onChange={e => setSubnetForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">CIDR 地址段</label>
                <input className="admin-form-input" placeholder="如 10.1.0.0/24" value={subnetForm.cidr} onChange={e => setSubnetForm(f => ({ ...f, cidr: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">子网 Passcode</label>
                <input className="admin-form-input" placeholder="0xXXXXXXXX" value={subnetForm.passcode} onChange={e => setSubnetForm(f => ({ ...f, passcode: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              {subnetError && <div className="admin-form-error">{subnetError}</div>}
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setShowSubnetModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleAddSubnet}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
