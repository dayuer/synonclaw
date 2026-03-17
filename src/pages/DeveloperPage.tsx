// @alpha: 开发者页 — 升级版
import { useEffect } from 'react'
import { CTAButton, SectionTitle } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './DeveloperPage.css'

const DOC_LINKS = [
  { icon: '📖', title: 'API Reference', desc: '完整的 REST API 文档，覆盖设备管理、智能体控制和数据接口。' },
  { icon: '📦', title: 'SDK', desc: 'Python / Node.js SDK，快速集成 SynonClaw 能力到你的应用中。' },
  { icon: '⌨️', title: 'CLI 工具', desc: '命令行工具，用于设备部署、配置管理和远程调试。' },
]

const PATH_STEPS = [
  { step: 1, title: '学习与培训', desc: '免费获取官方培训教材，掌握本地 AI 部署、数据清洗管线和低代码应用构建。' },
  { step: 2, title: '官方认证', desc: '通过理论考试与实操考核，获取官方认证开发者资质。认证分为基础级和高级两个等级。' },
  { step: 3, title: '承接真实需求', desc: '进入任务大厅，对接企业客户的复杂定制化开发需求。按项目结算佣金，积累实战经验。' },
]

export default function DeveloperPage() {
  useEffect(() => {
    document.title = '开发者 — SynonClaw'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="dev-hero section" id="developer-hero" data-testid="developer-hero">
        <div className="dev-hero__glow" />
        <div className="container dev-hero__inner">
          <span className="dev-hero__tag">开发者</span>
          <h1 className="dev-hero__title">SynonClaw 开发者网络</h1>
          <p className="dev-hero__subtitle">
            技术文档、培训认证、真实接单 — 面向工程师的完整成长路径。
          </p>
          <div className="dev-hero__actions">
            <CTAButton variant="primary" id="cta-dev-register">注册开发者账号</CTAButton>
            <CTAButton variant="secondary" href="https://github.com" id="cta-dev-github">GitHub →</CTAButton>
          </div>
        </div>
      </section>

      {/* 技术文档入口 */}
      <section className="section" id="dev-docs">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="技术文档" subtitle="快速上手 SynonClaw 开发" />
          </ScrollReveal>
          <div className="dev-docs__grid">
            {DOC_LINKS.map((d, i) => (
              <ScrollReveal key={d.title} delay={i * 100}>
                <div className="dev-doc-card">
                  <div className="dev-doc-card__icon">{d.icon}</div>
                  <h3 className="dev-doc-card__title">{d.title}</h3>
                  <p className="dev-doc-card__desc">{d.desc}</p>
                  <span className="dev-doc-card__link">查看文档 →</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 认证路径 */}
      <section className="section dev-path" id="dev-path" data-testid="path-step">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="成长与接单路径" subtitle="从学习到变现的完整闭环" />
          </ScrollReveal>
          <div className="dev-path__timeline">
            {PATH_STEPS.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 150}>
                <div className="dev-step">
                  <div className="dev-step__number">{item.step}</div>
                  <div className="dev-step__content">
                    <h3 className="dev-step__title">{item.title}</h3>
                    <p className="dev-step__desc">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section dev-cta" id="dev-cta-section">
        <div className="container">
          <ScrollReveal>
            <div className="dev-cta__box">
              <h2 className="dev-cta__title">准备好开始了吗？</h2>
              <p className="dev-cta__desc">注册开发者账号，开启你的 AI 工程师职业路径。</p>
              <CTAButton variant="primary" id="cta-dev-register-bottom">立即注册</CTAButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
