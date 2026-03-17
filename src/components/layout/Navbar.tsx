// @alpha: 官网导航栏 — 重构版
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { path: '/products', label: '产品' },
  { path: '/technology', label: '技术' },
  { path: '/ecosystem', label: '生态' },
  { path: '/developer', label: '开发者' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <nav id="navbar" className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">SC</span>
            SynonClaw
          </Link>

          <div className="navbar__links">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`navbar__link ${isActive(path) ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
            <Link to="/admin" className="navbar__link navbar__link--admin">
              控制台
            </Link>
          </div>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="打开菜单"
            id="btn-menu-open"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        id="mobile-menu"
        data-testid="mobile-menu"
      >
        <button
          className="mobile-menu__close"
          onClick={() => setMenuOpen(false)}
          aria-label="关闭菜单"
          id="btn-menu-close"
        >
          ✕
        </button>
        {NAV_LINKS.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`mobile-menu__link ${isActive(path) ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link
          to="/admin"
          className="mobile-menu__link"
          onClick={() => setMenuOpen(false)}
        >
          控制台 →
        </Link>
      </div>
    </>
  )
}
