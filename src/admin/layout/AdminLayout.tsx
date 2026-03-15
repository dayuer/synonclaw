// @alpha: Admin 主布局 — 侧边栏 + 顶栏 + Outlet
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'
import DashboardPage from '../pages/DashboardPage'
import DevicesPage from '../pages/DevicesPage'
import CustomersPage from '../pages/CustomersPage'
import OrdersPage from '../pages/OrdersPage'
import DevelopersPage from '../pages/DevelopersPage'
import SettingsPage from '../pages/SettingsPage'
import '../styles/admin.css'

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`admin-main ${sidebarCollapsed ? 'admin-main--sidebar-collapsed' : 'admin-main--sidebar-expanded'}`}>
        <AdminTopBar onHamburgerClick={() => setMobileOpen(prev => !prev)} />
        <div className="admin-content">
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="developers" element={<DevelopersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
