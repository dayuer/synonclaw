import { useEffect } from 'react'
import { CTAButton, SectionTitle, FeatureCard } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './HomePage.css'

export default function HomePage() {
  useEffect(() => {
    document.title = 'SynonClaw — 软硬一体的本地数字员工终端'
  }, [])

  return (
    <>
      {/* ===== Hero Section ===== */}
      <section className="home-hero" id="hero-section" data-testid="hero-section">
        <div className="home-hero__bg-glow" />
        <div className="home-hero__bg-glow home-hero__bg-glow--2" />

        <div className="container home-hero__inner">
          <div className="home-hero__content">
            <div className="home-hero__badge">
              <span className="home-hero__badge-dot" />
              全系列产品现已接受预定
            </div>

            <h1 className="home-hero__title">
              软硬一体的
              <br />
              <span className="home-hero__title-accent">本地数字员工终端</span>
            </h1>

            <p className="home-hero__subtitle">
              数据不出域，算力全掌控。内置 OpenClaw 引擎与云兔系统，插电即可在本地构建企业智能体网络。
            </p>

            <div className="home-hero__actions">
              <CTAButton variant="primary" href="/desk" id="cta-desk">
                了解桌面版
              </CTAButton>
              <CTAButton variant="secondary" href="/enterprise" id="cta-enterprise">
                获取企业方案
              </CTAButton>
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__images">
              <div className="home-hero__product-card">
                <img
                  src="/images/desk-product.png"
                  alt="SynonClaw Desk 桌面版"
                  loading="eager"
                />
                <div className="home-hero__product-label">桌面版 Desk</div>
              </div>
              <div className="home-hero__product-card">
                <img
                  src="/images/enterprise-product.png"
                  alt="SynonClaw Enterprise 企业版"
                  loading="eager"
                />
                <div className="home-hero__product-label">企业版 Enterprise</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 核心特性区 ===== */}
      <section className="section home-features" id="features-section" data-testid="features-section">
        <div className="home-features__bg" />
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="把数据和算力留在公司内部"
              subtitle="从物理层面解决数据安全问题，用最低门槛引入 AI 协同"
            />
          </ScrollReveal>

          <div className="features-grid">
            <ScrollReveal delay={0}>
              <FeatureCard
                icon={<ShieldIcon />}
                title="物理级数据安全"
                description="彻底告别公有云隐私焦虑。所有企业知识库、内部文档与业务数据均在本地硬件处理，从物理层面隔离风险。"
              />
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <FeatureCard
                icon={<ChatIcon />}
                title="开箱即拉群"
                description="无需改变团队现有工作习惯。通电联网后，AI 员工直接以账号形式加入飞书、钉钉、企业微信，接受指令并反馈进度。"
              />
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <FeatureCard
                icon={<UsersIcon />}
                title="人机协同机制"
                description="标准重复任务由本地 AI 员工秒级处理；复杂定制开发需求，通过平台一键派单给经过认证的真实开发者。"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  )
}

/* ===== 内联 SVG 图标 ===== */

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 10h8M8 14h4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
