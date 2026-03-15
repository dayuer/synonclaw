// @alpha: Admin 侧边栏导航 — 支持角色视角过滤
import { useLocation, useNavigate } from 'react-router-dom'
import type { NavItem } from '../data/types'
import type { ViewRole } from './AdminLayout'

interface NavGroup {
  label: string
  items: NavItem[]
  adminOnly?: boolean  // @alpha: 标记仅管理员可见的分组
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: '概览',
    adminOnly: true,
    items: [
      { path: '/admin', label: '仪表盘', icon: '📊' },
    ],
  },
  {
    label: '设备与角色',
    adminOnly: true,
    items: [
      { path: '/admin/devices', label: '设备管理', icon: '📡' },
      { path: '/admin/workers', label: '数字员工', icon: '🤖' },
    ],
  },
  {
    label: '团队',
    adminOnly: true,
    items: [
      { path: '/admin/members', label: '团队成员', icon: '👥' },
    ],
  },
  {
    label: '工作台',
    items: [
      { path: '/admin/workspace', label: '我的工作台', icon: '💬' },
    ],
  },
  {
    label: '运营',
    adminOnly: true,
    items: [
      { path: '/admin/products', label: '产品管理', icon: '📦' },
      { path: '/admin/customers', label: '客户管理', icon: '🏢' },
      { path: '/admin/orders', label: '订单管理', icon: '📋' },
      { path: '/admin/developers', label: '开发者网络', icon: '👨‍💻' },
      { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
    ],
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onCloseMobile: () => void
  viewRole: ViewRole
}

export default function AdminSidebar({ collapsed, mobileOpen, onToggle, onCloseMobile, viewRole }: AdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // @alpha: 根据角色过滤导航组
  const visibleGroups = viewRole === 'admin'
    ? NAV_GROUPS
    : NAV_GROUPS.filter(g => !g.adminOnly)

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
            <span className="admin-sidebar__logo-text"> 合爪</span>
          </div>
          <button className="admin-sidebar__toggle" onClick={onToggle} title={collapsed ? '展开侧边栏' : '折叠侧边栏'}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          {visibleGroups.map(group => (
            <div key={group.label} className="admin-sidebar__group">
              {!collapsed && (
                <div className="admin-sidebar__group-label">{group.label}</div>
              )}
              {group.items.map(item => (
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
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
