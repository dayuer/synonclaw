// @alpha: Admin 侧边栏导航
import { useLocation, useNavigate } from 'react-router-dom'
import type { NavItem } from '../data/types'

const NAV_ITEMS: NavItem[] = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/products', label: '产品管理', icon: '🖥️' },
  { path: '/admin/customers', label: '客户管理', icon: '🏢' },
  { path: '/admin/orders', label: '订单管理', icon: '📦' },
  { path: '/admin/developers', label: '开发者网络', icon: '👨‍💻' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
]

interface AdminSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onCloseMobile: () => void
}

export default function AdminSidebar({ collapsed, mobileOpen, onToggle, onCloseMobile }: AdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string): boolean => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const handleNav = (path: string) => {
    navigate(path)
    onCloseMobile()
  }

  return (
    <>
      <div className={`admin-sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={onCloseMobile} />
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">
            <span>⚡</span>
            <span className="admin-sidebar__logo-text"> SynonClaw</span>
          </div>
          <button className="admin-sidebar__toggle" onClick={onToggle} title={collapsed ? '展开侧边栏' : '折叠侧边栏'}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item.path}
              className={`admin-sidebar__nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
              role="button"
              tabIndex={0}
            >
              <span className="admin-sidebar__nav-icon">{item.icon}</span>
              <span className="admin-sidebar__nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
