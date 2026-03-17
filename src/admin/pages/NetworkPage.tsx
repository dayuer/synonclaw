// @alpha: GNB 操作面板 — AWS Console 风格
// 参考 AWS VPC / EC2 控制台设计语言
import { useState, useEffect, useCallback } from 'react'
import {
  getDevices, getGnbTunnels, maskPasscode, checkGnbCompliance,
  registerGnbNode, updateGnbPasscode,
  getSubnets, addSubnet, removeSubnet, getSubnetMembers,
} from '../data/mockData'
import type { Device, GnbTunnel, GnbNodeType, Subnet } from '../data/types'
import {
  DEVICE_STATUS_LABELS, GNB_NODE_TYPE_LABELS, GNB_CRYPTO_TYPE_LABELS,
  GNB_KEY_UPDATE_LABELS, NAT_TYPE_LABELS, TUNNEL_STATUS_LABELS,
} from '../data/types'

type TabType = 'nodes' | 'tunnels' | 'subnets'
type SplitTab = 'details' | 'security' | 'tunnels'

export default function NetworkPage() {
  const [tab, setTab] = useState<TabType>('nodes')
  const [devices, setDevices] = useState<Device[]>([])
  const [tunnels, setTunnels] = useState<GnbTunnel[]>([])
  const [subnetsData, setSubnetsData] = useState<Subnet[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [splitTab, setSplitTab] = useState<SplitTab>('details')
  const [filterNodeType, setFilterNodeType] = useState<GnbNodeType | ''>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  // 模态框
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showPasscodeEdit, setShowPasscodeEdit] = useState(false)
  const [showSubnetModal, setShowSubnetModal] = useState(false)

  // Flash bar
  const [flashDismissed, setFlashDismissed] = useState(false)

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

  // 合规检查
  const compliance = checkGnbCompliance()
  const hasWarnings = !compliance.compliant

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

  // 注册处理
  const handleRegister = () => {
    setRegError('')
    if (!regForm.name.trim()) { setRegError('节点名不能为空'); return }
    if (!/^[0-9a-fA-F]{8}$/.test(regForm.uuid)) { setRegError('UUID 必须为 8 位十六进制'); return }
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(regForm.virtualIp)) { setRegError('请输入合法的 IPv4 地址'); return }
    if (!/^0x[0-9a-fA-F]{8}$/i.test(regForm.passcode)) { setRegError('Passcode 格式: 0x + 8位十六进制'); return }

    const result = registerGnbNode(regForm)
    if ('error' in result) { setRegError(result.error); return }

    setShowRegisterModal(false)
    setRegForm({ name: '', uuid: '', virtualIp: '', nodeType: 'normal', cryptoType: 'arc4', passcode: '' })
    refresh()
  }

  // Passcode 更新
  const handlePasscodeUpdate = () => {
    if (!selectedDevice) return
    setPasscodeError('')
    if (!/^0x[0-9a-fA-F]{8}$/i.test(newPasscode)) { setPasscodeError('格式: 0x + 8位十六进制'); return }

    const result = updateGnbPasscode(selectedDevice.id, newPasscode)
    if ('error' in result) { setPasscodeError(result.error); return }

    setShowPasscodeEdit(false)
    setNewPasscode('')
    const updated = getDevices().find(d => d.id === selectedDevice.id)
    if (updated) setSelectedDevice(updated)
    refresh()
  }

  // 子网创建
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
    if (typeof result === 'object' && 'error' in result) { alert(result.error); return }
    refresh()
  }

  // 节点详情 — AWS Split Panel 而非全屏切换
  const relatedTunnels = selectedDevice
    ? tunnels.filter(t => t.sourceNodeId === selectedDevice.id || t.targetNodeId === selectedDevice.id)
    : []

  return (
    <div>
      {/* ===== AWS Service Header ===== */}
      <div className="aws-header">
        <div className="aws-header__left">
          <span className="aws-header__service">GNB Virtual Network</span>
          <h1 className="aws-header__title">
            GNB 操作面板
            <span className="aws-header__count">
              {devices.length} 节点 · {tunnels.length} 隧道 · {subnetsData.length} 私域
            </span>
          </h1>
        </div>
        <div className="aws-header__actions">
          <button className="aws-btn aws-btn--icon" onClick={refresh} title="刷新">⟳</button>
          {tab === 'nodes' && (
            <button className="aws-btn aws-btn--primary" onClick={() => { setShowRegisterModal(true); setRegError('') }}>
              注册节点
            </button>
          )}
          {tab === 'subnets' && (
            <button className="aws-btn aws-btn--primary" onClick={() => { setShowSubnetModal(true); setSubnetError('') }}>
              创建私域
            </button>
          )}
        </div>
      </div>

      {/* ===== AWS Flash Bar — 合规警告 ===== */}
      {hasWarnings && !flashDismissed && (
        <div className="aws-flashbar aws-flashbar--warning">
          <span className="aws-flashbar__icon">⚠</span>
          <div className="aws-flashbar__content">
            <strong>安全合规提醒</strong> — {compliance.issues.map(i => `${i.deviceName}: ${i.issue}`).join('；')}
          </div>
          <button className="aws-flashbar__dismiss" onClick={() => setFlashDismissed(true)}>×</button>
        </div>
      )}

      {/* ===== AWS Tabs ===== */}
      <div className="aws-tabs">
        <button className={`aws-tab ${tab === 'nodes' ? 'aws-tab--active' : ''}`} onClick={() => { setTab('nodes'); setSelectedDevice(null) }}>
          节点 <span className="aws-tab__badge">{devices.length}</span>
        </button>
        <button className={`aws-tab ${tab === 'tunnels' ? 'aws-tab--active' : ''}`} onClick={() => { setTab('tunnels'); setSelectedDevice(null) }}>
          隧道 <span className="aws-tab__badge">{tunnels.length}</span>
        </button>
        <button className={`aws-tab ${tab === 'subnets' ? 'aws-tab--active' : ''}`} onClick={() => { setTab('subnets'); setSelectedDevice(null) }}>
          子网 (VPC) <span className="aws-tab__badge">{subnetsData.length}</span>
        </button>
      </div>

      {/* ===== 节点 Tab ===== */}
      {tab === 'nodes' && (
        <div className="aws-container">
          <div className="aws-action-bar">
            <div className="aws-action-bar__left">
              <select className="admin-form-select" value={filterNodeType} onChange={e => setFilterNodeType(e.target.value as GnbNodeType | '')} style={{ width: 130, fontSize: 'var(--text-xs)', padding: '4px 8px' }}>
                <option value="">全部类型</option>
                <option value="normal">普通节点</option>
                <option value="index">Index 信令</option>
                <option value="forward">Forward 中继</option>
              </select>
              <select className="admin-form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 110, fontSize: 'var(--text-xs)', padding: '4px 8px' }}>
                <option value="">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
              </select>
              <span className="aws-action-bar__info">
                显示 {filteredNodes.length} / {devices.length}
              </span>
            </div>
          </div>
          <div className="aws-table-wrapper">
            <table className="aws-table">
              <thead>
                <tr>
                  <th>节点名称</th>
                  <th>UUID</th>
                  <th>虚拟 IP</th>
                  <th>节点类型</th>
                  <th>加密算法</th>
                  <th>NAT</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-muted)' }}>
                    暂无匹配节点
                  </td></tr>
                ) : filteredNodes.map(d => (
                  <tr
                    key={d.id}
                    className={selectedDevice?.id === d.id ? 'aws-table__row--selected' : ''}
                    onClick={() => { setSelectedDevice(d); setSplitTab('details') }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="aws-table__cell--name">{d.name}</td>
                    <td className="aws-table__cell--mono">{d.gnbConfig.uuid}</td>
                    <td className="aws-table__cell--mono">{d.gnbConfig.virtualIp}</td>
                    <td>{GNB_NODE_TYPE_LABELS[d.gnbConfig.nodeType]}</td>
                    <td>{GNB_CRYPTO_TYPE_LABELS[d.gnbConfig.cryptoType]}</td>
                    <td style={{ fontSize: 'var(--text-xs)' }}>{NAT_TYPE_LABELS[d.gnbConfig.natType]}</td>
                    <td>
                      <span className={`aws-status aws-status--${d.status}`}>
                        <span className="aws-status__dot" />
                        {DEVICE_STATUS_LABELS[d.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="aws-container__footer">
            上次刷新: {new Date().toLocaleTimeString('zh-CN')}
          </div>
        </div>
      )}

      {/* ===== 隧道 Tab ===== */}
      {tab === 'tunnels' && (
        <div>
          {/* 概览卡片 */}
          <div className="aws-overview-cards">
            <div className="aws-overview-card">
              <p className="aws-overview-card__value">{tunnelStats.total}</p>
              <p className="aws-overview-card__label">总隧道</p>
            </div>
            <div className="aws-overview-card">
              <p className="aws-overview-card__value" style={{ color: '#44dd88' }}>{tunnelStats.active}</p>
              <p className="aws-overview-card__label">正常 (Active)</p>
            </div>
            <div className="aws-overview-card">
              <p className="aws-overview-card__value" style={{ color: '#ffcc44' }}>{tunnelStats.degraded}</p>
              <p className="aws-overview-card__label">降级 (Degraded)</p>
            </div>
            <div className="aws-overview-card">
              <p className="aws-overview-card__value" style={{ color: '#ff5050' }}>{tunnelStats.down}</p>
              <p className="aws-overview-card__label">断开 (Down)</p>
            </div>
          </div>

          <div className="aws-container">
            <div className="aws-container__header">
              <h2 className="aws-container__title">
                隧道列表
                <span className="aws-container__title-count">({tunnels.length})</span>
              </h2>
            </div>
            <div className="aws-container__body--flush">
              <table className="aws-table">
                <thead>
                  <tr>
                    <th>源节点</th>
                    <th></th>
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
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-muted)' }}>
                      暂无隧道连接
                    </td></tr>
                  ) : tunnels.map(t => (
                    <tr key={t.id} className={t.status === 'down' ? 'tunnel-row--down' : t.latency > 200 || t.packetLoss > 5 ? 'tunnel-row--degraded' : ''}>
                      <td style={{ fontWeight: 600 }}>{t.sourceNodeName}</td>
                      <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>→</td>
                      <td style={{ fontWeight: 600 }}>{t.targetNodeName}</td>
                      <td className="aws-table__cell--mono">{t.status === 'down' ? '—' : `${t.latency}ms`}</td>
                      <td className="aws-table__cell--mono">{t.status === 'down' ? '—' : `${t.packetLoss}%`}</td>
                      <td>{t.uptime}</td>
                      <td>{GNB_CRYPTO_TYPE_LABELS[t.cryptoType]}</td>
                      <td>
                        <span className={`aws-status aws-status--${t.status}`}>
                          <span className="aws-status__dot" />
                          {TUNNEL_STATUS_LABELS[t.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== 子网 Tab ===== */}
      {tab === 'subnets' && (
        <div>
          {subnetsData.length === 0 ? (
            <div className="aws-container">
              <div className="aws-container__body" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <p style={{ fontSize: 'var(--text-h3)', marginBottom: 'var(--space-sm)' }}>🏢</p>
                <p style={{ color: 'var(--color-text-muted)' }}>暂无私域子网，点击上方「创建私域」按钮创建</p>
              </div>
            </div>
          ) : (
            <div className="subnet-grid">
              {subnetsData.map(sub => {
                const members = getSubnetMembers(sub.id)
                return (
                  <div key={sub.id} className="aws-container" style={{ marginBottom: 0 }}>
                    <div className="aws-container__header">
                      <h3 className="aws-container__title">{sub.name}</h3>
                      <div className="aws-container__actions">
                        <button className="aws-btn aws-btn--icon" onClick={() => handleRemoveSubnet(sub.id)} title="删除">🗑</button>
                      </div>
                    </div>
                    <div className="aws-container__body">
                      <div className="aws-kv">
                        <div className="aws-kv__item">
                          <span className="aws-kv__label">CIDR</span>
                          <span className="aws-kv__value aws-kv__value--mono">{sub.cidr}</span>
                        </div>
                        <div className="aws-kv__item">
                          <span className="aws-kv__label">Passcode</span>
                          <span className="aws-kv__value aws-kv__value--mono">{maskPasscode(sub.passcode)}</span>
                        </div>
                        <div className="aws-kv__item">
                          <span className="aws-kv__label">成员节点</span>
                          <span className="aws-kv__value">{members.length} 个节点</span>
                        </div>
                        <div className="aws-kv__item">
                          <span className="aws-kv__label">创建时间</span>
                          <span className="aws-kv__value">{new Date(sub.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>
                    {members.length > 0 && (
                      <div className="aws-container__footer" style={{ fontSize: 'var(--text-xs)' }}>
                        {members.map(m => (
                          <span key={m.id} style={{ marginRight: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className={`aws-status aws-status--${m.status}`}>
                              <span className="aws-status__dot" />
                              {m.name}
                            </span>
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

      {/* ===== AWS Split Panel — 节点详情 ===== */}
      {selectedDevice && (
        <div className="aws-split-panel">
          <div className="aws-split-panel__header">
            <h3 className="aws-split-panel__title">
              <span className={`aws-status aws-status--${selectedDevice.status}`}>
                <span className="aws-status__dot" />
              </span>
              {selectedDevice.name}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                {selectedDevice.gnbConfig.virtualIp}
              </span>
            </h3>
            <button className="aws-split-panel__close" onClick={() => setSelectedDevice(null)}>关闭 ✕</button>
          </div>

          {/* Split Panel 内部 Tabs */}
          <div className="aws-split-panel__tabs">
            <button className={`aws-split-panel__tab ${splitTab === 'details' ? 'aws-split-panel__tab--active' : ''}`} onClick={() => setSplitTab('details')}>
              详细信息
            </button>
            <button className={`aws-split-panel__tab ${splitTab === 'security' ? 'aws-split-panel__tab--active' : ''}`} onClick={() => setSplitTab('security')}>
              安全配置
            </button>
            <button className={`aws-split-panel__tab ${splitTab === 'tunnels' ? 'aws-split-panel__tab--active' : ''}`} onClick={() => setSplitTab('tunnels')}>
              关联隧道 ({relatedTunnels.length})
            </button>
          </div>

          <div className="aws-split-panel__body">
            {/* 详细信息 Tab */}
            {splitTab === 'details' && (
              <div className="aws-kv aws-kv--3col">
                <div className="aws-kv__item">
                  <span className="aws-kv__label">节点名称</span>
                  <span className="aws-kv__value">{selectedDevice.name}</span>
                </div>
                <div className="aws-kv__item">
                  <span className="aws-kv__label">UUID</span>
                  <span className="aws-kv__value aws-kv__value--mono">{selectedDevice.gnbConfig.uuid}</span>
                </div>
                <div className="aws-kv__item">
                  <span className="aws-kv__label">虚拟 IP</span>
                  <span className="aws-kv__value aws-kv__value--mono">{selectedDevice.gnbConfig.virtualIp}</span>
                </div>
                <div className="aws-kv__item">
                  <span className="aws-kv__label">节点类型</span>
                  <span className="aws-kv__value">{GNB_NODE_TYPE_LABELS[selectedDevice.gnbConfig.nodeType]}</span>
                </div>
                <div className="aws-kv__item">
                  <span className="aws-kv__label">NAT 类型</span>
                  <span className="aws-kv__value">{NAT_TYPE_LABELS[selectedDevice.gnbConfig.natType]}</span>
                </div>
                <div className="aws-kv__item">
                  <span className="aws-kv__label">关联产品</span>
                  <span className="aws-kv__value">{selectedDevice.productName}</span>
                </div>
                <div className="aws-kv__item" style={{ gridColumn: '1 / -1' }}>
                  <span className="aws-kv__label">公钥</span>
                  <span className="aws-kv__value aws-kv__value--mono">{selectedDevice.gnbConfig.publicKey}</span>
                </div>
              </div>
            )}

            {/* 安全配置 Tab */}
            {splitTab === 'security' && (
              <div>
                <div className="aws-kv">
                  <div className="aws-kv__item">
                    <span className="aws-kv__label">加密算法</span>
                    <span className="aws-kv__value">{GNB_CRYPTO_TYPE_LABELS[selectedDevice.gnbConfig.cryptoType]}</span>
                  </div>
                  <div className="aws-kv__item">
                    <span className="aws-kv__label">密钥轮换</span>
                    <span className="aws-kv__value">{GNB_KEY_UPDATE_LABELS[selectedDevice.gnbConfig.keyUpdateInterval]}</span>
                  </div>
                  <div className="aws-kv__item">
                    <span className="aws-kv__label">Passcode</span>
                    <span className="aws-kv__value aws-kv__value--action">
                      <code style={{ background: 'var(--color-bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {maskPasscode(selectedDevice.gnbConfig.passcode)}
                      </code>
                      <button className="aws-btn aws-btn--link" onClick={() => { setShowPasscodeEdit(true); setNewPasscode(''); setPasscodeError('') }}>
                        编辑
                      </button>
                    </span>
                  </div>
                  <div className="aws-kv__item">
                    <span className="aws-kv__label">NTP 同步</span>
                    <span className="aws-kv__value">
                      {selectedDevice.gnbConfig.ntpSynced
                        ? <span className="aws-status aws-status--online"><span className="aws-status__dot" />已同步</span>
                        : <span className="aws-status aws-status--pending"><span className="aws-status__dot" />未同步</span>
                      }
                    </span>
                  </div>
                </div>
                {selectedDevice.gnbConfig.keyUpdateInterval === 'none' && (
                  <div className="aws-flashbar aws-flashbar--error" style={{ marginTop: 'var(--space-lg)', marginBottom: 0 }}>
                    <span className="aws-flashbar__icon">⚠</span>
                    <div className="aws-flashbar__content">密钥轮换未激活，建议启用 MINUTE 或 HOUR 模式以增强安全性</div>
                  </div>
                )}
                {!selectedDevice.gnbConfig.ntpSynced && (
                  <div className="aws-flashbar aws-flashbar--warning" style={{ marginTop: 'var(--space-md)', marginBottom: 0 }}>
                    <span className="aws-flashbar__icon">⚠</span>
                    <div className="aws-flashbar__content">NTP 未同步 — 密钥轮换在 MINUTE 模式下可能导致通信中断</div>
                  </div>
                )}
              </div>
            )}

            {/* 关联隧道 Tab */}
            {splitTab === 'tunnels' && (
              <div>
                {relatedTunnels.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                    该节点暂无关联隧道
                  </p>
                ) : (
                  <table className="aws-table">
                    <thead>
                      <tr>
                        <th>对端节点</th>
                        <th>延迟</th>
                        <th>丢包</th>
                        <th>加密</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedTunnels.map(t => {
                        const peerName = t.sourceNodeId === selectedDevice.id ? t.targetNodeName : t.sourceNodeName
                        return (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600 }}>{peerName}</td>
                            <td className="aws-table__cell--mono">{t.status === 'down' ? '—' : `${t.latency}ms`}</td>
                            <td className="aws-table__cell--mono">{t.status === 'down' ? '—' : `${t.packetLoss}%`}</td>
                            <td>{GNB_CRYPTO_TYPE_LABELS[t.cryptoType]}</td>
                            <td>
                              <span className={`aws-status aws-status--${t.status}`}>
                                <span className="aws-status__dot" />
                                {TUNNEL_STATUS_LABELS[t.status]}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
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
              <button className="aws-btn aws-btn--normal" onClick={() => setShowRegisterModal(false)}>取消</button>
              <button className="aws-btn aws-btn--primary" onClick={handleRegister}>注册节点</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Passcode 编辑模态框 ===== */}
      {showPasscodeEdit && selectedDevice && (
        <div className="admin-modal-overlay" onClick={() => setShowPasscodeEdit(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">编辑 Passcode — {selectedDevice.name}</h3>
              <button className="admin-modal__close" onClick={() => setShowPasscodeEdit(false)}>×</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)', fontSize: 'var(--text-small)' }}>
                当前: <code style={{ background: 'var(--color-bg-primary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>{maskPasscode(selectedDevice.gnbConfig.passcode)}</code>
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">新 Passcode</label>
                <input className="admin-form-input" placeholder="0xXXXXXXXX（8位十六进制）" value={newPasscode} onChange={e => setNewPasscode(e.target.value)} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              {passcodeError && <div className="admin-form-error">{passcodeError}</div>}
            </div>
            <div className="admin-modal__footer">
              <button className="aws-btn aws-btn--normal" onClick={() => setShowPasscodeEdit(false)}>取消</button>
              <button className="aws-btn aws-btn--primary" onClick={handlePasscodeUpdate}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 创建私域模态框 ===== */}
      {showSubnetModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSubnetModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">创建私域子网 (VPC)</h3>
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
              <button className="aws-btn aws-btn--normal" onClick={() => setShowSubnetModal(false)}>取消</button>
              <button className="aws-btn aws-btn--primary" onClick={handleAddSubnet}>创建子网</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
