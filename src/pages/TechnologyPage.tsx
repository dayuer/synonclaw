// @alpha: 技术能力页 — 新增
// 安全架构可视化 + 安全能力 + 方案对比 + 全栈架构图
import { useEffect } from 'react'
import { SectionTitle } from '../components/shared/Shared'
import { ScrollReveal } from '../hooks'
import './TechnologyPage.css'

const SECURITY_FEATURES = [
  { icon: '🔐', title: '全链路加密', desc: '所有节点间通信均经过端到端加密，支持多种加密算法自动协商，攻击者即使截获数据包也无法解密。' },
  { icon: '🔑', title: '密钥自动轮换', desc: '加密密钥按策略自动轮换，无需人工干预。即使单次密钥泄露，历史通信仍然安全。' },
  { icon: '🌐', title: 'NAT 智能穿透', desc: '自动识别网络环境并选择最优穿透方案，无需公网 IP 即可实现节点互联。' },
  { icon: '🏢', title: '物理级隔离', desc: '数据处理在本地硬件完成，不经过任何第三方云服务器。从物理架构层面彻底消除数据泄露风险。' },
]

const COMPARISON = [
  { feature: '数据传输', sc: '全链路加密 + 物理隔离', vpn: '加密隧道', cloud: '依赖云端安全策略' },
  { feature: '数据存储', sc: '本地硬件', vpn: '终端设备', cloud: '云端服务器' },
  { feature: '部署复杂度', sc: '插电即用', vpn: '需网络配置', cloud: '需云端配置 + 运维' },
  { feature: '规模化成本', sc: '固定硬件成本', vpn: '按带宽计费', cloud: '按用量计费' },
  { feature: '扩展方式', sc: '物理插拔秒级扩容', vpn: '增加服务器', cloud: '弹性扩容（依赖厂商）' },
  { feature: '网络独立性', sc: '完全自主', vpn: '依赖 VPN 提供商', cloud: '依赖云厂商' },
]

const ARCH_LAYERS = [
  { label: '应用层', items: ['智能体编排', '低代码平台', '数据看板', '业务应用'], color: 'var(--color-accent)' },
  { label: 'AI 引擎层', items: ['本地推理', 'RAG 检索', '知识库构建', '模型调度'], color: '#44dd88' },
  { label: '网络层', items: ['加密隧道', '密钥轮换', 'NAT 穿透', '私域子网'], color: '#ffcc44' },
  { label: '物理层', items: ['Desk 桌面终端', 'Rack 机柜集群', '安全芯片', '本地存储'], color: '#ff7070' },
]

export default function TechnologyPage() {
  useEffect(() => {
    document.title = '技术架构 — SynonClaw'
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="tech-hero section" id="tech-hero" data-testid="tech-hero">
        <div className="tech-hero__glow" />
        <div className="container tech-hero__inner">
          <span className="tech-hero__tag">技术架构</span>
          <h1 className="tech-hero__title">从物理层到应用层的安全闭环</h1>
          <p className="tech-hero__subtitle">
            每一比特数据，从产生到消费，全程物理隔离、全链路加密。不依赖任何第三方基础设施。
          </p>
        </div>
      </section>

      {/* 网络架构可视化 */}
      <section className="section" id="network-arch">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="安全私域网络"
              subtitle="节点互联、加密隧道和私域隔离"
            />
          </ScrollReveal>

          <ScrollReveal>
            <div className="tech-network-diagram" data-testid="network-diagram">
              <div className="tech-network__zone tech-network__zone--vpc">
                <div className="tech-network__zone-label">私域 A</div>
                <div className="tech-network__nodes">
                  <div className="tech-network__node tech-network__node--desk">Desk-01</div>
                  <div className="tech-network__node tech-network__node--desk">Desk-02</div>
                </div>
              </div>
              <div className="tech-network__tunnels">
                <div className="tech-network__tunnel" />
                <div className="tech-network__tunnel-label">加密隧道</div>
                <div className="tech-network__tunnel" />
              </div>
              <div className="tech-network__zone tech-network__zone--vpc">
                <div className="tech-network__zone-label">私域 B</div>
                <div className="tech-network__nodes">
                  <div className="tech-network__node tech-network__node--rack">Rack-01</div>
                  <div className="tech-network__node tech-network__node--index">Index 信令</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 安全特性 */}
      <section className="section tech-security" id="security-features">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="安全能力"
              subtitle="多层防御，从协议到硬件的全方位保护"
            />
          </ScrollReveal>

          <div className="tech-security__grid">
            {SECURITY_FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div className="tech-security-card">
                  <div className="tech-security-card__icon">{f.icon}</div>
                  <h3 className="tech-security-card__title">{f.title}</h3>
                  <p className="tech-security-card__desc">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 方案对比 */}
      <section className="section" id="comparison">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="方案对比"
              subtitle="为什么选择 SynonClaw"
            />
          </ScrollReveal>

          <ScrollReveal>
            <div className="tech-comparison-table" data-testid="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>维度</th>
                    <th className="tech-comparison__highlight">SynonClaw</th>
                    <th>传统 VPN</th>
                    <th>公有云方案</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(row => (
                    <tr key={row.feature}>
                      <td className="tech-comparison__feature">{row.feature}</td>
                      <td className="tech-comparison__highlight">{row.sc}</td>
                      <td>{row.vpn}</td>
                      <td>{row.cloud}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 全栈架构图 */}
      <section className="section" id="arch-stack">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              title="全栈架构"
              subtitle="从物理硬件到业务应用的四层设计"
            />
          </ScrollReveal>

          <ScrollReveal>
            <div className="tech-arch-stack" data-testid="arch-stack">
              {ARCH_LAYERS.map((layer, i) => (
                <div className="tech-arch-layer" key={layer.label} style={{ '--layer-color': layer.color, animationDelay: `${i * 0.15}s` } as React.CSSProperties}>
                  <div className="tech-arch-layer__label">{layer.label}</div>
                  <div className="tech-arch-layer__items">
                    {layer.items.map(item => (
                      <span className="tech-arch-layer__item" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
