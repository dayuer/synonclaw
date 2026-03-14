import { useEffect } from 'react'
import { CTAButton, SectionTitle, FeatureCard } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './DeskPage.css'

const SPECS = [
  { label: '处理器', value: '工控级 SoC 套件' },
  { label: '内存', value: '32GB DDR5' },
  { label: '本地存储', value: '1TB NVMe SSD' },
  { label: '散热', value: '静音散热架构' },
  { label: '运行时间', value: '7×24 小时连续运行' },
  { label: '预装系统', value: 'OpenClaw 基础环境' },
  { label: '网络', value: '双千兆以太网' },
  { label: '扩展接口', value: 'USB-C / HDMI / GPIO' },
]

export default function DeskPage() {
  useEffect(() => {
    document.title = 'SynonClaw Desk — 桌面边缘算力中心'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="desk-hero" id="desk-hero" data-testid="desk-hero">
        <div className="desk-hero__glow" />
        <div className="container desk-hero__inner">
          <div className="desk-hero__content">
            <span className="desk-hero__tag">个人版 DESK</span>
            <h1 className="desk-hero__title">
              SynonClaw Desk
              <br />
              桌面的边缘算力中心
            </h1>
            <p className="desk-hero__subtitle">
              专为开发者、极客和小型工作室设计。高品质金属机身，本地部署专属智能体。
            </p>
            <div className="desk-hero__price">
              ¥ 待定 <span>含首年 OpenClaw 许可</span>
            </div>
            <CTAButton variant="primary" id="cta-desk-order">
              立即预定
            </CTAButton>
          </div>

          <div className="desk-hero__image">
            <img
              src="/images/desk-product.png"
              alt="SynonClaw Desk 产品图"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 硬件配置 */}
      <section className="section desk-specs" id="spec-table" data-testid="spec-table">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="硬件配置"
              subtitle="工控级板卡套件，为持续稳定运行而生"
            />
          </ScrollReveal>

          <div className="desk-specs__grid">
            {SPECS.map((spec, i) => (
              <ScrollReveal key={spec.label} delay={i * 50}>
                <div className="desk-spec-item">
                  <div className="desk-spec-item__label">{spec.label}</div>
                  <div className="desk-spec-item__value">{spec.value}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 应用场景 */}
      <section className="section" id="desk-scenarios">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="应用场景"
              subtitle="你的桌面，你的算力"
            />
          </ScrollReveal>

          <div className="desk-scenarios__grid">
            <ScrollReveal delay={0}>
              <FeatureCard
                icon={<CodeIcon />}
                title="代码与文档辅助"
                description="无延迟的本地代码分析与知识库极速检索。在完全离线的环境中，享受毫秒级的智能补全和代码审查。"
              />
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <FeatureCard
                icon={<CpuIcon />}
                title="算力自由"
                description="彻底摆脱按 Token 计费的公有云模式。算力成本固定可控，不限调用次数，不限并发请求。"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  )
}

function CodeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function CpuIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent-green)' }}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  )
}
