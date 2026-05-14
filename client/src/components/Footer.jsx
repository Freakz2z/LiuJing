import { Link } from 'react-router-dom';
import './Footer.css';

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wrapper">
        {/* 主体内容 */}
        <div className="footer-main">
          
          {/* 品牌区域 */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="榴镜自贸" width="48" height="48" style={{ borderRadius: 12 }} />
              <div className="footer-logo-text">
                <span className="footer-logo-title">榴镜自贸</span>
                <span className="footer-logo-sub">乡链视界</span>
              </div>
            </div>
            <p className="footer-slogan">
              聚焦海南自贸港榴莲产业<br />
              助力乡村产业振兴
            </p>
            
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <IconClock />
                <span>周一至周五 9:00-18:00</span>
              </div>
            </div>
          </div>

          {/* 链接区域 */}
          <div className="footer-nav">
            <div className="footer-nav-section">
              <h4 className="footer-nav-title">关于我们</h4>
              <p className="footer-company-intro">
                专注于海南自贸港榴莲产业，聚焦种植、加工、销售全产业链，致力于推动热带水果产业品牌化、溯源化、国际化发展。
              </p>
            </div>

            <div className="footer-nav-section">
              <h4 className="footer-nav-title">帮助支持</h4>
              <nav className="footer-nav-links">
                <Link to="/terms">服务条款</Link>
                <Link to="/privacy">隐私政策</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="footer-bottom">
          <div className="footer-bottom-line"></div>
          <div className="footer-copyright">
            <p>© 2026 榴镜自贸·乡链视界 All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
