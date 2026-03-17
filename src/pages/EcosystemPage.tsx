// @alpha: 软件生态页 — 升级版
import { useEffect } from 'react'
import { SectionTitle } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './EcosystemPage.css'

const AI_CAPABILITIES = [
  { icon: '🧠', title: '本地优先推理', desc: '大语言模型优先在本地硬件运行，保障数据安全和低延迟。复杂任务可弹性调度云端算力，兼顾成本与性能。' },
  { icon: '📚', title: '统一知识库 (RAG)', desc: '导入企业文档、代码库、内部知识，构建专属知识检索系统。知识资产沉淀在本地，越用越聪明。' },
  { icon: '🤖', title: '智能体编排', desc: '多个 AI 员工协同工作，自动分配任务、传递上下文、汇总结果。本地+云端混合调度，保障高可用。' },
]

const LOWCODE_CAPABILITIES = [
  { icon: '📊', title: '数据看板', desc: '连接本地数据源，自动生成可视化仪表盘。' },
  { icon: '🛠️', title: '应用自动生成', desc: '描述需求即可生成完整的企业内部管理工具。' },
  { icon: '🔄', title: '工作流引擎', desc: '拖拽式自动化流程设计，连接 AI 能力和业务系统。' },
]

const FLOW_STEPS = [
  { icon: '🗄️', title: '企业本地数据', desc: '知识库 / 文档 / 数据库' },
  { icon: '⚙️', title: '数据清洗', desc: 'AI 引擎自动处理' },
  { icon: '🧠', title: '智能推理', desc: '本地大模型推理' },
  { icon: '📱', title: '业务应用', desc: '自动生成管理工具' },
]

export default function EcosystemPage() {
  useEffect(() => {
    document.title = '软件生态 — SynonClaw'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="eco-hero section" id="ecosystem-hero">
        <div className="container eco-hero__inner">
          <span className="eco-hero__tag">软件生态</span>
          <h1 className="eco-hero__title">从本地数据到智能应用</h1>
          <p className="eco-hero__subtitle">
            一套完整的企业智能化工作流：数据清洗、智能推理、应用自动生成。
          </p>
        </div>
      </section>

      {/* AI 引擎能力 */}
      <section className="section" id="ai-engine">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="本地 AI 引擎" subtitle="强大的本地推理和智能体编排能力" />
          </ScrollReveal>
          <div className="eco-caps__grid">
            {AI_CAPABILITIES.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 100}>
                <div className="eco-cap-card">
                  <div className="eco-cap-card__icon">{c.icon}</div>
                  <h3 className="eco-cap-card__title">{c.title}</h3>
                  <p className="eco-cap-card__desc">{c.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 低代码平台 */}
      <section className="section" id="lowcode">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="低代码应用平台" subtitle="无需编程，数据驱动的应用构建" />
          </ScrollReveal>
          <div className="eco-caps__grid">
            {LOWCODE_CAPABILITIES.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 100}>
                <div className="eco-cap-card">
                  <div className="eco-cap-card__icon">{c.icon}</div>
                  <h3 className="eco-cap-card__title">{c.title}</h3>
                  <p className="eco-cap-card__desc">{c.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 端到端工作流 */}
      <section className="section eco-workflow" id="workflow-diagram" data-testid="workflow-diagram">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="端到端工作流" subtitle="数据从本地出发，经过智能处理，最终输出可用的业务应用" />
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
    </>
  )
}
