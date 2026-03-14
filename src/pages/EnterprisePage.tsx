import { useState, useEffect, useCallback } from 'react'
import { CTAButton, SectionTitle } from '../components/shared/Shared'
import { ScrollReveal, useFormValidation } from '../hooks'
import './EnterprisePage.css'

export default function EnterprisePage() {
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    document.title = 'SynonClaw Enterprise — 企业级算力集群'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  return (
    <>
      {/* Hero */}
      <section className="ent-hero" id="enterprise-hero" data-testid="enterprise-hero">
        <div className="ent-hero__glow" />
        <div className="container ent-hero__inner">
          <div className="ent-hero__content">
            <span className="ent-hero__tag">企业版 ENTERPRISE</span>
            <h1 className="ent-hero__title">
              把数字员工
              <br />
              <span className="ent-hero__title-accent">装进机柜</span>
            </h1>
            <p className="ent-hero__subtitle">
              企业级模块化算力集群。物理插拔秒级扩容，配合运营商专线，构建绝对安全的内部智能体系统。
            </p>
            <CTAButton
              variant="primary"
              onClick={() => setModalOpen(true)}
              id="cta-enterprise-demo"
            >
              预约专属演示
            </CTAButton>
          </div>

          <div className="ent-hero__image">
            <img
              src="/images/enterprise-product.png"
              alt="SynonClaw Enterprise 机柜产品图"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 企业级特性 */}
      <section className="section ent-features" id="enterprise-features">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="企业级特性"
              subtitle="为规模化 AI 部署而设计"
            />
          </ScrollReveal>

          {/* 特性 1: 热插拔 */}
          <ScrollReveal>
            <div className="ent-feature-block" data-testid="enterprise-feature">
              <div>
                <div className="ent-feature__tag">物理扩容</div>
                <h3 className="ent-feature__title">物理热插拔，即刻上岗</h3>
                <p className="ent-feature__desc">
                  需要新增 10 个 AI 员工？只需在机柜中插入 10 块算力板卡，系统自动识别授权，即刻分配到对应业务部门。
                </p>
              </div>
              <div className="ent-feature__visual">
                <BladeAnimation />
              </div>
            </div>
          </ScrollReveal>

          {/* 特性 2: 应用生成 */}
          <ScrollReveal>
            <div className="ent-feature-block" data-testid="enterprise-feature">
              <div>
                <div className="ent-feature__tag">数据闭环</div>
                <h3 className="ent-feature__title">应用自动生成</h3>
                <p className="ent-feature__desc">
                  打通业务闭环。由底层的 OpenClaw 引擎清洗本地数据库，数据直通云兔系统，低代码/无代码快速生成企业内部管理应用。
                </p>
              </div>
              <div className="ent-feature__visual">
                <div className="ent-feature__visual-box">
                  <FlowDiagramMini />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 特性 3: 网络隔离 */}
          <ScrollReveal>
            <div className="ent-feature-block" data-testid="enterprise-feature">
              <div>
                <div className="ent-feature__tag">安全架构</div>
                <h3 className="ent-feature__title">运营商级网络隔离</h3>
                <p className="ent-feature__desc">
                  系统内置企业级防火墙策略。支持联合通信运营商拉取专线，配备内网穿透功能，实现员工在外网安全调用内网数据，彻底隔离外部攻击。
                </p>
              </div>
              <div className="ent-feature__visual">
                <div className="ent-feature__visual-box">
                  <NetworkDiagram />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 线索表单模态框 */}
      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}

/* ===== 刀片服务器动画 ===== */

function BladeAnimation() {
  return (
    <div className="ent-feature__visual-box">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="ent-blade-row" key={i}>
          <span className={`ent-blade-dot ${i >= 6 ? 'ent-blade-dot--new' : ''}`} />
          <span className="ent-blade-label">
            {i >= 6 ? `NEW NODE-${i + 1}` : `NODE-${i + 1}`}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ===== 迷你流程图 ===== */

function FlowDiagramMini() {
  const steps = ['本地数据', 'OpenClaw', '云兔系统', '业务应用']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {steps.map((step, i) => (
        <span key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-accent)',
            whiteSpace: 'nowrap',
          }}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>→</span>
          )}
        </span>
      ))}
    </div>
  )
}

/* ===== 网络架构图 ===== */

function NetworkDiagram() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NodeBox label="外网员工" color="var(--color-accent)" />
        <span style={{ color: 'var(--color-text-muted)', letterSpacing: '3px' }}>──── 专线 ────</span>
        <NodeBox label="企业防火墙" color="var(--color-accent-green)" />
      </div>
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '16px' }}>↕</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NodeBox label="SynonClaw 内网集群" color="var(--color-accent)" large />
      </div>
    </div>
  )
}

function NodeBox({ label, color, large }: { label: string; color: string; large?: boolean }) {
  return (
    <div style={{
      padding: large ? '12px 24px' : '8px 14px',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${color}40`,
      background: `${color}10`,
      color,
      fontWeight: 600,
      fontSize: 'var(--text-xs)',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  )
}

/* ===== 线索收集表单 ===== */

const NODE_OPTIONS = ['1-10 节点', '10-50 节点', '50-100 节点', '100+ 节点']

function LeadFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState({
    companyName: '',
    nodeCount: '',
    contactName: '',
    phone: '',
    email: '',
  })

  const { errors, validate, clearErrors } = useFormValidation({
    companyName: [{ required: true, message: '请填写企业名称' }],
    nodeCount: [{ required: true, message: '请选择预计需求节点数' }],
    contactName: [{ required: true, message: '请填写联系人姓名' }],
    phone: [
      { required: true, message: '请填写联系电话' },
      { pattern: /^1[3-9]\d{9}$/, message: '请填写有效的手机号' },
    ],
    email: [
      { required: true, message: '请填写电子邮箱' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请填写有效的邮箱地址' },
    ],
  })

  const handleChange = useCallback((field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validate(values)) {
      setSubmitted(true)
    }
  }, [validate, values])

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setValues({ companyName: '', nodeCount: '', contactName: '', phone: '', email: '' })
      clearErrors()
    }, 300)
  }, [onClose, clearErrors])

  return (
    <div
      className={`lead-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      id="lead-form-modal"
      data-testid="lead-form-modal"
    >
      <div className="lead-modal">
        <button className="lead-modal__close" onClick={handleClose} aria-label="关闭" id="btn-lead-close">✕</button>

        {submitted ? (
          <div className="lead-form__success">
            <div className="lead-form__success-icon">✅</div>
            <div className="lead-form__success-title">提交成功</div>
            <p className="lead-form__success-desc">
              我们的专属顾问将在 24 小时内与您取得联系。
            </p>
          </div>
        ) : (
          <>
            <h3 className="lead-modal__title">预约专属演示</h3>
            <p className="lead-modal__subtitle">填写以下信息，我们将为您安排一对一的产品演示</p>

            <form onSubmit={handleSubmit}>
              <div className="lead-form__group">
                <label className="lead-form__label" htmlFor="companyName">企业名称 *</label>
                <input
                  id="companyName"
                  className={`lead-form__input ${errors.companyName ? 'error' : ''}`}
                  placeholder="请输入企业全称"
                  value={values.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
                {errors.companyName && <div className="lead-form__error">{errors.companyName}</div>}
              </div>

              <div className="lead-form__group">
                <label className="lead-form__label" htmlFor="nodeCount">预计需求节点数 *</label>
                <select
                  id="nodeCount"
                  className={`lead-form__select ${errors.nodeCount ? 'error' : ''}`}
                  value={values.nodeCount}
                  onChange={(e) => handleChange('nodeCount', e.target.value)}
                >
                  <option value="">请选择</option>
                  {NODE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.nodeCount && <div className="lead-form__error">{errors.nodeCount}</div>}
              </div>

              <div className="lead-form__group">
                <label className="lead-form__label" htmlFor="contactName">联系人 *</label>
                <input
                  id="contactName"
                  className={`lead-form__input ${errors.contactName ? 'error' : ''}`}
                  placeholder="请输入联系人姓名"
                  value={values.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                />
                {errors.contactName && <div className="lead-form__error">{errors.contactName}</div>}
              </div>

              <div className="lead-form__group">
                <label className="lead-form__label" htmlFor="phone">联系电话 *</label>
                <input
                  id="phone"
                  type="tel"
                  className={`lead-form__input ${errors.phone ? 'error' : ''}`}
                  placeholder="请输入手机号码"
                  value={values.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && <div className="lead-form__error">{errors.phone}</div>}
              </div>

              <div className="lead-form__group">
                <label className="lead-form__label" htmlFor="email">电子邮箱 *</label>
                <input
                  id="email"
                  type="email"
                  className={`lead-form__input ${errors.email ? 'error' : ''}`}
                  placeholder="请输入电子邮箱"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && <div className="lead-form__error">{errors.email}</div>}
              </div>

              <button type="submit" className="cta-button cta-button--primary lead-form__submit" id="btn-lead-submit" data-testid="btn-lead-submit">
                提交预约
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
