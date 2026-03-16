// @alpha: Admin 主布局 — 侧边栏 + 顶栏 + 路由 + 角色切换
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'
import DashboardPage from '../pages/DashboardPage'
import DevicesPage from '../pages/DevicesPage'
import NetworkPage from '../pages/NetworkPage'
import WorkersPage from '../pages/WorkersPage'
import MembersPage from '../pages/MembersPage'
import WorkspacePage from '../pages/WorkspacePage'
import ProductsPage from '../pages/ProductsPage'
import CustomersPage from '../pages/CustomersPage'
import OrdersPage from '../pages/OrdersPage'
import DevelopersPage from '../pages/DevelopersPage'
import SettingsPage from '../pages/SettingsPage'
import '../styles/admin.css'

export type ViewRole = 'admin' | 'member'

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [viewRole, setViewRole] = useState<ViewRole>('admin')
  const navigate = useNavigate()
  const location = useLocation()

  // @alpha: 切换到成员视角时，强制跳转到工作台
  useEffect(() => {
    if (viewRole === 'member' && location.pathname !== '/admin/workspace') {
      navigate('/admin/workspace', { replace: true })
    }
  }, [viewRole, location.pathname, navigate])

  const handleRoleSwitch = () => {
    const next: ViewRole = viewRole === 'admin' ? 'member' : 'admin'
    setViewRole(next)
    if (next === 'member') {
      navigate('/admin/workspace', { replace: true })
    } else {
      navigate('/admin', { replace: true })
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        viewRole={viewRole}
      />
      <div className={`admin-main ${sidebarCollapsed ? 'admin-main--sidebar-collapsed' : 'admin-main--sidebar-expanded'}`}>
        <AdminTopBar onHamburgerClick={() => setMobileOpen(prev => !prev)} />
        <div className="admin-content">
          {viewRole === 'admin' ? (
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="network" element={<NetworkPage />} />
              <Route path="workers" element={<WorkersPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="workspace" element={<WorkspacePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="developers" element={<DevelopersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="workspace" element={<WorkspacePage />} />
              <Route path="*" element={<Navigate to="/admin/workspace" replace />} />
            </Routes>
          )}
        </div>
      </div>

      {/* @alpha: 浮动角色切换按钮 */}
      <button
        className="role-switcher"
        onClick={handleRoleSwitch}
        title={viewRole === 'admin' ? '切换为普通用户视角' : '切换为管理员视角'}
      >
        <span className="role-switcher__icon">{viewRole === 'admin' ? '🛡️' : '👤'}</span>
        <span className="role-switcher__label">
          {viewRole === 'admin' ? '管理员' : '成员'}
        </span>
      </button>
    </div>
  )
}
