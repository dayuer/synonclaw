import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Shared.css'

/* ========== CTA 按钮 ========== */

export function CTAButton({
  variant = 'primary',
  href,
  onClick,
  children,
  id,
}: {
  variant?: 'primary' | 'secondary'
  href?: string
  onClick?: () => void
  children: ReactNode
  id?: string
}) {
  const className = `cta-button cta-button--${variant}`

  if (href?.startsWith('/')) {
    return (
      <Link to={href} className={className} id={id} data-testid={id}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={className} id={id} data-testid={id} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <button className={className} onClick={onClick} id={id} data-testid={id} type="button">
      {children}
    </button>
  )
}

/* ========== 区块标题 ========== */

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="section-title">
      <h2 className="section-title__heading">{title}</h2>
      {subtitle && <p className="section-title__sub">{subtitle}</p>}
    </div>
  )
}

/* ========== 特性卡片 ========== */

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="feature-card" data-testid="feature-card">
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{description}</p>
    </div>
  )
}
