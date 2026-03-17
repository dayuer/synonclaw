// @alpha: 首页 — 全新设计
// Hero + 三大价值支柱 + 社会证明 + CTA
import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CTAButton } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './HomePage.css'

const PILLARS = [
  {
    icon: '🔒',
    title: '安全',
    desc: '数据全链路物理隔离，不经过任何第三方服务器。从硬件到网络到应用，每一层都在你自己的控制之下。零信任架构，端到端加密。',
    link: '/technology',
    linkText: '了解安全架构',
  },
  {
    icon: '🎛️',
    title: '可管控',
    desc: '算力完全自主，不依赖外部云服务。Web 控制台统一管理所有节点、网络拓扑和智能体。物理插拔即扩容，成本固定可预测。',
    link: '/products',
    linkText: '查看管控能力',
  },
  {
    icon: '📚',
    title: '统一知识库',
    desc: '将企业文档、代码库、业务数据沉淀为可检索、可推理的私有知识资产。AI 员工基于统一知识库协同工作，越用越聪明。',
    link: '/ecosystem',
    linkText: '了解知识管理',
  },
]

const STATS = [
  { value: 2400, suffix: '+', label: '活跃节点' },
  { value: 99.7, suffix: '%', label: '网络在线率', decimals: 1 },
  { value: 128, suffix: 'bit', label: '加密强度' },
  { value: 50, suffix: '+', label: '企业客户' },
]

export default function HomePage() {
  useEffect(() => {
    document.title = 'SynonClaw — 安全本地智能基础设施'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="home-hero" id="hero-section" data-testid="hero-section">
        <div className="home-hero__bg-glow" />
        <div className="home-hero__bg-glow home-hero__bg-glow--2" />
        <NetworkCanvas />

        <div className="container home-hero__inner">
          <div className="home-hero__content">
            <div className="home-hero__badge">
              <span className="home-hero__badge-dot" />
              安全本地智能基础设施
            </div>

            <h1 className="home-hero__title">
              数据不出域
              <br />
              <span className="home-hero__title-accent">算力全掌控</span>
            </h1>

            <p className="home-hero__subtitle">
              本地优先，云端弹性。AI 引擎在本地运行保障数据安全，云端资源按需调度降低成本。端到端加密，物理级隔离，零信任架构。
            </p>

            <div className="home-hero__actions">
              <CTAButton variant="primary" href="/products" id="cta-products">
                了解产品
              </CTAButton>
              <CTAButton variant="secondary" href="/technology" id="cta-tech">
                技术架构
              </CTAButton>
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__images">
              <div className="home-hero__product-card">
                <img src="/images/desk-product.png" alt="SynonClaw Desk" loading="eager" />
                <div className="home-hero__product-label">Desk 桌面版</div>
              </div>
              <div className="home-hero__product-card">
                <img src="/images/enterprise-product.png" alt="SynonClaw Rack" loading="eager" />
                <div className="home-hero__product-label">Rack 企业版</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 三大价值支柱 ===== */}
      <section className="section home-pillars" id="pillars-section" data-testid="pillars-section">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2 className="section-title__heading">三大核心能力</h2>
              <p className="section-title__sub">从安全组网到智能应用的完整闭环</p>
            </div>
          </ScrollReveal>

          <div className="home-pillars__grid">
            {PILLARS.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 120}>
                <Link to={p.link} className="home-pillar-card" data-testid="pillar-card">
                  <div className="home-pillar-card__icon">{p.icon}</div>
                  <h3 className="home-pillar-card__title">{p.title}</h3>
                  <p className="home-pillar-card__desc">{p.desc}</p>
                  <span className="home-pillar-card__link">{p.linkText} →</span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 社会证明 ===== */}
      <section className="section home-stats" id="stats-section" data-testid="stats-section">
        <div className="container">
          <ScrollReveal>
            <div className="home-stats__grid">
              {STATS.map(s => (
                <div className="home-stat" key={s.label}>
                  <AnimatedNumber target={s.value} suffix={s.suffix} decimals={s.decimals} />
                  <div className="home-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CTA 转化区 ===== */}
      <section className="section home-cta" id="cta-section">
        <div className="container">
          <ScrollReveal>
            <div className="home-cta__box">
              <h2 className="home-cta__title">准备好重新掌控你的数据了吗？</h2>
              <p className="home-cta__desc">
                选择适合你的硬件方案，或预约一场专属演示了解更多。
              </p>
              <div className="home-cta__actions">
                <CTAButton variant="primary" href="/products" id="cta-products-bottom">
                  查看产品
                </CTAButton>
                <CTAButton variant="secondary" href="/developer" id="cta-developer-bottom">
                  开发者入口
                </CTAButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}

/* ===== 数字动画组件 ===== */

function AnimatedNumber({ target, suffix = '', decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  const animate = useCallback(() => {
    if (animated.current) return
    animated.current = true
    const duration = 1500
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * target)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animate() },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animate])

  return (
    <div className="home-stat__value" ref={ref}>
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value)}
      <span className="home-stat__suffix">{suffix}</span>
    </div>
  )
}

/* ===== Hero 背景网络动画 ===== */

function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    const nodeCount = 40

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const init = () => {
      resize()
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      nodes.length = 0
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        })
      }
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // 连线
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.12 * (1 - dist / 150)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // 节点
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0 || node.x > w) node.vx *= -1
        if (node.y < 0 || node.y > h) node.vy *= -1

        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)'
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="home-hero__canvas" />
}
