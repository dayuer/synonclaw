import { useEffect } from 'react'
import { CTAButton, SectionTitle } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './DeveloperPage.css'

const PATH_STEPS = [
  {
    step: 1,
    title: '学习与培训',
    description: '免费获取官方培训教材，掌握 OpenClaw 引擎调试与云兔系统的核心架构。在线课程涵盖本地 AI 部署、数据清洗管线和低代码应用构建。',
  },
  {
    step: 2,
    title: '官方认证',
    description: '通过线上理论考试与实操考核，获取 SynonClaw 官方认证开发者资质。认证分为基础级和高级两个等级，对应不同的接单权限。',
  },
  {
    step: 3,
    title: '承接真实需求',
    description: '进入任务大厅，对接企业客户在使用 SynonClaw 过程中产生的复杂定制化开发需求。按项目结算佣金，积累实战经验。',
  },
]

export default function DeveloperPage() {
  useEffect(() => {
    document.title = '开发者网络 — 学习·认证·接单'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="dev-hero section" id="developer-hero" data-testid="developer-hero">
        <div className="dev-hero__glow" />
        <div className="container dev-hero__inner">
          <span className="dev-hero__tag">开发者网络</span>
          <h1 className="dev-hero__title">SynonClaw 开发者网络</h1>
          <p className="dev-hero__subtitle">
            面向高校计算机专业学生的实战与接单平台。掌握企业级 AI 部署，用真实技术变现。
          </p>
          <CTAButton variant="primary" id="cta-dev-register">
            注册开发者账号
          </CTAButton>
        </div>
      </section>

      {/* 成长路径 */}
      <section className="section dev-path" id="dev-path" data-testid="path-step">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="成长与接单路径"
              subtitle="从学习到变现的完整闭环"
            />
          </ScrollReveal>

          <div className="dev-path__timeline">
            {PATH_STEPS.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 150}>
                <div className="dev-step">
                  <div className="dev-step__number">{item.step}</div>
                  <div className="dev-step__content">
                    <h3 className="dev-step__title">{item.title}</h3>
                    <p className="dev-step__desc">{item.description}</p>
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
              <p className="dev-cta__desc">
                注册开发者账号，开启你的 AI 工程师职业路径。
              </p>
              <CTAButton variant="primary" id="cta-dev-register-bottom">
                立即注册
              </CTAButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
