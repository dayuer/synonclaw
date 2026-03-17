// @alpha: 官网 Footer — 重构版
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer" data-testid="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="navbar__logo" style={{ fontSize: '1.1rem' }}>
              <span className="navbar__logo-icon" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>SC</span>
              SynonClaw
            </div>
            <p className="footer__brand-desc">
              安全本地智能基础设施。数据不出域，算力全掌控。
            </p>
          </div>

          <div>
            <h4 className="footer__column-title">产品</h4>
            <Link to="/products" className="footer__link">Desk 桌面版</Link>
            <Link to="/products" className="footer__link">Rack 企业版</Link>
            <Link to="/products" className="footer__link">产品对比</Link>
          </div>

          <div>
            <h4 className="footer__column-title">技术</h4>
            <Link to="/technology" className="footer__link">安全架构</Link>
            <Link to="/technology" className="footer__link">方案对比</Link>
            <Link to="/ecosystem" className="footer__link">软件生态</Link>
          </div>

          <div>
            <h4 className="footer__column-title">开发者</h4>
            <Link to="/developer" className="footer__link">技术文档</Link>
            <Link to="/developer" className="footer__link">培训认证</Link>
            <a href="https://github.com" className="footer__link" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>

          <div>
            <h4 className="footer__column-title">公司</h4>
            <span className="footer__link">contact@synonclaw.com</span>
            <span className="footer__link">商务合作</span>
            <Link to="/admin" className="footer__link">管理控制台</Link>
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
