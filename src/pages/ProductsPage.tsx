// @alpha: 产品线页 — Desk + Rack 合并
import { useState, useEffect } from 'react'
import { CTAButton, SectionTitle } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './ProductsPage.css'

const PRODUCTS = [
  {
    id: 'desk',
    name: 'SynonClaw Desk',
    tagline: '桌面的边缘算力中心',
    desc: '专为开发者、极客和小型工作室设计。高品质金属机身，本地部署专属智能体。',
    image: '/images/desk-product.png',
    cta: '立即预定',
    ctaVariant: 'primary' as const,
    specs: [
      { label: '处理器', value: '工控级 SoC 套件' },
      { label: '内存', value: '32GB DDR5' },
      { label: '存储', value: '1TB NVMe SSD' },
      { label: '网络', value: '双千兆以太网' },
      { label: '散热', value: '静音散热架构' },
      { label: '运行', value: '7×24 小时不间断' },
    ],
    scenarios: ['个人开发者', '工作室', '小型团队'],
  },
  {
    id: 'rack',
    name: 'SynonClaw Rack',
    tagline: '企业级模块化算力集群',
    desc: '物理插拔秒级扩容，配合安全私域网络，构建绝对安全的内部智能体系统。',
    image: '/images/enterprise-product.png',
    cta: '预约演示',
    ctaVariant: 'secondary' as const,
    specs: [
      { label: '架构', value: '模块化刀片设计' },
      { label: '扩展', value: '物理热插拔' },
      { label: '容量', value: '单柜 20+ 节点' },
      { label: '网络', value: '万兆内网互联' },
      { label: '管理', value: '集中式 Web 控制台' },
      { label: '冗余', value: '双电源 + UPS' },
    ],
    scenarios: ['企业', '数据中心', '大型团队'],
  },
]

const SCENARIOS = [
  { icon: '👨‍💻', title: '个人开发者', desc: '本地代码分析、知识库检索、AI 编程辅助', recommend: 'desk' },
  { icon: '🏢', title: '中小企业', desc: '团队协作智能体、内部知识管理、自动化工作流', recommend: 'rack' },
  { icon: '🏭', title: '大型企业 / 数据中心', desc: '大规模 AI 部署、多部门智能体编排、合规级隔离', recommend: 'rack' },
]

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('desk')

  useEffect(() => {
    document.title = '产品 — SynonClaw'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="prod-hero section" id="products-hero" data-testid="products-hero">
        <div className="prod-hero__glow" />
        <div className="container prod-hero__inner">
          <span className="prod-hero__tag">产品</span>
          <h1 className="prod-hero__title">选择适合你的算力方案</h1>
          <p className="prod-hero__subtitle">从桌面到机柜，从个人到企业，一套完整的本地智能基础设施。</p>
        </div>
      </section>

      {/* SKU 对比卡片 */}
      <section className="section" id="product-cards">
        <div className="container">
          <div className="prod-cards">
            {PRODUCTS.map(p => (
              <ScrollReveal key={p.id}>
                <div className={`prod-card ${activeTab === p.id ? 'prod-card--active' : ''}`} onClick={() => setActiveTab(p.id)}>
                  <div className="prod-card__image">
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </div>
                  <div className="prod-card__content">
                    <h2 className="prod-card__name">{p.name}</h2>
                    <p className="prod-card__tagline">{p.tagline}</p>
                    <p className="prod-card__desc">{p.desc}</p>
                    <div className="prod-card__scenarios">
                      {p.scenarios.map(s => (
                        <span className="prod-card__scenario-tag" key={s}>{s}</span>
                      ))}
                    </div>
                    <CTAButton variant={p.ctaVariant} id={`cta-${p.id}`}>
                      {p.cta}
                    </CTAButton>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 规格对比表 */}
      <section className="section" id="specs-compare">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="规格对比" subtitle="硬件配置一览" />
          </ScrollReveal>

          <ScrollReveal>
            <div className="prod-specs-table">
              <table>
                <thead>
                  <tr>
                    <th>规格</th>
                    <th>Desk 桌面版</th>
                    <th>Rack 企业版</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS[0].specs.map((spec, i) => (
                    <tr key={spec.label}>
                      <td className="prod-specs__label">{spec.label}</td>
                      <td>{spec.value}</td>
                      <td>{PRODUCTS[1].specs[i]?.value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 场景匹配 */}
      <section className="section" id="scenarios">
        <div className="container">
          <ScrollReveal>
            <SectionTitle title="哪个适合你？" subtitle="根据使用场景选择合适的产品" />
          </ScrollReveal>

          <div className="prod-scenarios__grid">
            {SCENARIOS.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 100}>
                <div className="prod-scenario-card">
                  <div className="prod-scenario-card__icon">{s.icon}</div>
                  <h3 className="prod-scenario-card__title">{s.title}</h3>
                  <p className="prod-scenario-card__desc">{s.desc}</p>
                  <span className={`prod-scenario-card__recommend prod-scenario-card__recommend--${s.recommend}`}>
                    推荐 {s.recommend === 'desk' ? 'Desk' : 'Rack'}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
