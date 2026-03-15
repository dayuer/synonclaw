// @alpha: Admin 顶栏

interface AdminTopBarProps {
  onHamburgerClick: () => void
}

export default function AdminTopBar({ onHamburgerClick }: AdminTopBarProps) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar__left">
        <button className="admin-topbar__hamburger" onClick={onHamburgerClick} title="切换侧边栏">
          ☰
        </button>
        <span className="admin-topbar__title">管理后台</span>
      </div>
      <div className="admin-topbar__right">
        <div className="admin-topbar__user">
          <div className="admin-topbar__avatar">A</div>
          <span>管理员</span>
        </div>
        <button className="admin-topbar__logout" onClick={() => window.location.href = '/'}>
          退出
        </button>
      </div>
    </header>
  )
}
