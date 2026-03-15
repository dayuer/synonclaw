// @alpha: 设备远程配置页 — RPC 指令翻译的 GUI 入口
import { useState, useEffect, useCallback } from 'react'
import { getDeviceById, updateDeviceRpcConfig, maskApiKey } from '../data/mockData'
import { translateConfigToCommands, executeCommands, validateRpcConfig } from '../data/rpcClient'
import type { Device, RpcConfig, ModelProvider } from '../data/types'
import { MODEL_PROVIDER_LABELS, DEVICE_STATUS_LABELS } from '../data/types'

interface DeviceConfigPageProps {
  deviceId: string
  onBack: () => void
}

// @alpha: 设备配置页核心组件
export default function DeviceConfigPage({ deviceId, onBack }: DeviceConfigPageProps) {
  const [device, setDevice] = useState<Device | null>(null)
  const [config, setConfig] = useState<RpcConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<RpcConfig | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const d = getDeviceById(deviceId)
    if (!d) return
    setDevice(d)
    const cfg = { ...d.rpcConfig, plugins: d.rpcConfig.plugins.map(p => ({ ...p })) }
    setConfig(cfg)
    setOriginalConfig({ ...d.rpcConfig, plugins: d.rpcConfig.plugins.map(p => ({ ...p })) })
  }, [deviceId])

  useEffect(() => { refresh() }, [refresh])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // @alpha: 检测是否有变更
  const hasChanges = (): boolean => {
    if (!config || !originalConfig) return false
    return JSON.stringify(config) !== JSON.stringify(originalConfig)
  }

  // @alpha: 保存配置 → 翻译 RPC → 模拟下发
  const handleSave = async () => {
    if (!config || !originalConfig || !device) return

    const validationErrors = validateRpcConfig(config)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    // 设备离线时提示
    if (device.status !== 'online') {
      showToast('⚠️ 设备离线，配置将在设备重新上线后同步')
    }

    setSaving(true)
    const commands = translateConfigToCommands(deviceId, originalConfig, config)

    if (commands.length === 0) {
      showToast('无配置变更')
      setSaving(false)
      return
    }

    await executeCommands(commands)
    updateDeviceRpcConfig(deviceId, config)
    refresh()
    setSaving(false)
    showToast(`✅ 配置已同步（${commands.length} 条 RPC 指令）`)
  }

  if (!device || !config) return null

  return (
    <div>
      {/* 面包屑 */}
      <div className="admin-breadcrumb">
        <span className="admin-breadcrumb__item" onClick={onBack}>设备管理</span>
        <span className="admin-breadcrumb__separator">/</span>
        <span className="admin-breadcrumb__item" onClick={onBack}>{device.name}</span>
        <span className="admin-breadcrumb__separator">/</span>
        <span className="admin-breadcrumb__current">远程配置</span>
      </div>

      {/* 标题 */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-page-header__title">
            <span className={`status-badge status-badge--${device.status}`} style={{ marginRight: 'var(--space-md)' }}>
              <span className="status-badge__dot" />{DEVICE_STATUS_LABELS[device.status]}
            </span>
            {device.name} — 远程配置
          </h1>
          <p className="admin-page-header__subtitle">
            通过 RPC 协议远程管理设备底层参数。修改保存后将实时下发到设备。
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button className="admin-btn admin-btn--secondary" onClick={onBack}>返回</button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={saving || !hasChanges()}
          >
            {saving ? '同步中...' : '保存配置'}
          </button>
        </div>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div style={{
          position: 'fixed', top: 'var(--space-xl)', right: 'var(--space-xl)', zIndex: 1000,
          background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)',
          padding: 'var(--space-md) var(--space-xl)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)',
          fontSize: 'var(--text-small)', animation: 'fadeInUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* 模型配置 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">🧠 模型配置</h2>
          </div>
          <div className="admin-panel__body">
            <div className="admin-form-group">
              <label className="admin-form-label">模型供应商</label>
              <select
                className="admin-form-select"
                value={config.modelProvider}
                onChange={e => setConfig(prev => prev ? { ...prev, modelProvider: e.target.value as ModelProvider } : prev)}
              >
                {Object.entries(MODEL_PROVIDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">API Key *</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <input
                  className={`admin-form-input ${errors.apiKey ? 'error' : ''}`}
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig(prev => prev ? { ...prev, apiKey: e.target.value } : prev)}
                  placeholder="输入 API Key"
                  style={{ fontFamily: 'var(--font-mono)', flex: 1 }}
                />
              </div>
              {config.apiKey && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                  当前: {maskApiKey(config.apiKey)}
                </p>
              )}
              {errors.apiKey && <p className="admin-form-error">{errors.apiKey}</p>}
            </div>
          </div>
        </div>

        {/* 参数调优 */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">⚙️ 参数调优</h2>
          </div>
          <div className="admin-panel__body">
            <div className="admin-form-group">
              <label className="admin-form-label">温度 (Temperature): {config.temperature.toFixed(1)}</label>
              <input
                type="range" min="0" max="2" step="0.1"
                className="admin-slider"
                value={config.temperature}
                onChange={e => setConfig(prev => prev ? { ...prev, temperature: parseFloat(e.target.value) } : prev)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <span>精确 0.0</span><span>创意 2.0</span>
              </div>
              {errors.temperature && <p className="admin-form-error">{errors.temperature}</p>}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Top-P: {config.topP.toFixed(1)}</label>
              <input
                type="range" min="0" max="1" step="0.1"
                className="admin-slider"
                value={config.topP}
                onChange={e => setConfig(prev => prev ? { ...prev, topP: parseFloat(e.target.value) } : prev)}
              />
              {errors.topP && <p className="admin-form-error">{errors.topP}</p>}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">最大 Token 数</label>
              <input
                className={`admin-form-input ${errors.maxTokens ? 'error' : ''}`}
                type="number" min="1" max="128000"
                value={config.maxTokens}
                onChange={e => setConfig(prev => prev ? { ...prev, maxTokens: parseInt(e.target.value) || 0 } : prev)}
              />
              {errors.maxTokens && <p className="admin-form-error">{errors.maxTokens}</p>}
            </div>
          </div>
        </div>

        {/* 系统 Prompt */}
        <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">💬 系统 Prompt</h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {config.systemPrompt.length} / 10000
            </span>
          </div>
          <div className="admin-panel__body">
            <textarea
              className={`admin-form-textarea ${errors.systemPrompt ? 'error' : ''}`}
              value={config.systemPrompt}
              onChange={e => setConfig(prev => prev ? { ...prev, systemPrompt: e.target.value.slice(0, 10000) } : prev)}
              placeholder="定义 AI 代理的行为准则和角色设定..."
              rows={6}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)', resize: 'vertical' }}
            />
            {errors.systemPrompt && <p className="admin-form-error">{errors.systemPrompt}</p>}
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
              系统 Prompt 对团队成员不可见，定义 AI 代理的基础行为。
            </p>
          </div>
        </div>

        {/* 插件管理 */}
        <div className="admin-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-panel__header">
            <h2 className="admin-panel__title">🔌 插件管理</h2>
          </div>
          <div className="admin-panel__body">
            <div className="plugin-grid">
              {config.plugins.map((plugin, idx) => (
                <div key={plugin.id} className="plugin-item">
                  <div className="plugin-item__info">
                    <span className="plugin-item__name">{plugin.name}</span>
                    <span className="plugin-item__desc">{plugin.description}</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={plugin.enabled}
                      onChange={() => {
                        setConfig(prev => {
                          if (!prev) return prev
                          const newPlugins = prev.plugins.map((p, i) =>
                            i === idx ? { ...p, enabled: !p.enabled } : p
                          )
                          return { ...prev, plugins: newPlugins }
                        })
                      }}
                    />
                    <span className="toggle-switch__slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
