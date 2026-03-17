// @alpha: 路由重构 — 新页面结构
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import TechnologyPage from './pages/TechnologyPage'
import EcosystemPage from './pages/EcosystemPage'
import DeveloperPage from './pages/DeveloperPage'
import AdminLayout from './admin/layout/AdminLayout'

function App() {
  const location = useLocation()
  // @alpha: admin 路由使用独立布局，不渲染官网 Navbar/Footer
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/technology" element={<TechnologyPage />} />
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          {/* 旧路由重定向 */}
          <Route path="/desk" element={<Navigate to="/products" replace />} />
          <Route path="/enterprise" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
