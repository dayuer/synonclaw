import { useEffect } from 'react'
import { SectionTitle } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './EcosystemPage.css'

const FLOW_STEPS = [
  { icon: '🗄️', title: '企业本地数据', desc: '知识库/文档/数据库' },
  { icon: '⚙️', title: 'OpenClaw 引擎', desc: '数据清洗与标注' },
  { icon: '☁️', title: '云兔系统', desc: '低代码应用构建' },
  { icon: '📱', title: '业务应用', desc: '自动生成管理后台' },
]

export default function EcosystemPage() {
  useEffect(() => {
    document.title = '软件生态 — OpenClaw & 云兔'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="eco-hero section" id="ecosystem-hero">
        <div className="container eco-hero__inner">
          <span className="eco-hero__tag">软件生态</span>
          <h1 className="eco-hero__title">OpenClaw + 云兔</h1>
          <p className="eco-hero__subtitle">
            从本地数据清洗到可视化业务应用自动生成，一套完整的企业智能化工作流。
          </p>
        </div>
      </section>

      {/* 工作流程图 */}
      <section className="section eco-workflow" id="workflow-diagram" data-testid="workflow-diagram">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="端到端工作流"
              subtitle="数据从本地出发，经过智能处理，最终输出可用的业务应用"
            />
          </ScrollReveal>

          <ScrollReveal>
            <div className="eco-flow">
              {FLOW_STEPS.map((step, i) => (
                <div className="eco-flow__step" key={step.title}>
                  <div className="eco-flow__node">
                    <div className="eco-flow__node-icon">{step.icon}</div>
                    <div className="eco-flow__node-title">{step.title}</div>
                    <div className="eco-flow__node-desc">{step.desc}</div>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="eco-flow__arrow">
                      <div className="eco-flow__arrow-line" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 人机协同 */}
      <section className="section" id="eco-collab">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="人机协同生态"
              subtitle="AI 处理标准任务，真人开发者承接复杂定制"
            />
          </ScrollReveal>

          <div className="eco-collab__grid">
            <ScrollReveal delay={0}>
              <div className="eco-collab__card">
                <div className="eco-collab__card-icon">🤖</div>
                <h3 className="eco-collab__card-title">AI 员工自动处理</h3>
                <p className="eco-collab__card-desc">
                  重复性标准任务由本地 AI 员工秒级处理。从数据录入、文档生成到报表分析，
                  全自动执行，释放团队精力投入高价值工作。
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="eco-collab__card">
                <div className="eco-collab__card-icon">👨‍💻</div>
                <h3 className="eco-collab__card-title">一键派单真人开发者</h3>
                <p className="eco-collab__card-desc">
                  遇到复杂定制化需求？通过平台一键派发到经过 SynonClaw 官方认证的
                  开发者网络，由专业工程师远程协助完成。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  )
}
