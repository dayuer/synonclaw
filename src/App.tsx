import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import DeskPage from './pages/DeskPage'
import EnterprisePage from './pages/EnterprisePage'
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
          <Route path="/desk" element={<DeskPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
