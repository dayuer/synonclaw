import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer" data-testid="footer">
      <div className="container">
        <div className="footer__inner">
          <div>
            <div className="navbar__logo" style={{ fontSize: '1.1rem' }}>
              <span className="navbar__logo-icon" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>SC</span>
              SynonClaw
            </div>
            <p className="footer__brand-desc">
              软硬一体的本地数字员工终端。数据不出域，算力全掌控。
            </p>
          </div>

          <div>
            <h4 className="footer__column-title">产品</h4>
            <Link to="/desk" className="footer__link">个人版 Desk</Link>
            <Link to="/enterprise" className="footer__link">企业版 Enterprise</Link>
            <Link to="/ecosystem" className="footer__link">软件生态</Link>
          </div>

          <div>
            <h4 className="footer__column-title">开发者</h4>
            <Link to="/developer" className="footer__link">培训认证</Link>
            <Link to="/developer" className="footer__link">任务大厅</Link>
            <Link to="/developer" className="footer__link">技术文档</Link>
          </div>

          <div>
            <h4 className="footer__column-title">联系我们</h4>
            <span className="footer__link">contact@synonclaw.com</span>
            <span className="footer__link">商务合作</span>
            <span className="footer__link">媒体问询</span>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 SynonClaw. All rights reserved.</span>
          <span>粤ICP备XXXXXXXX号</span>
        </div>
      </div>
    </footer>
  )
}
