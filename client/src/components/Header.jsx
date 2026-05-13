import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/content', label: '内容' },
  { path: '/policy', label: '政策' },
  { path: '/products', label: '商品' },
  { path: '/bases', label: '基地' },
  { path: '/industry', label: '产业' },
];

const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const IconShop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconIndustry = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 20h20"/>
    <path d="M5 20V10l7-5 7 5v10"/>
    <path d="M9 20v-6h6v6"/>
  </svg>
);

const iconMap = {
  '/': IconHome,
  '/content': IconGrid,
  '/industry': IconIndustry,
  '/policy': IconFile,
  '/products': IconShop,
  '/bases': IconMap,
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('liujing_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('liujing_token');
    localStorage.removeItem('liujing_user');
    setUser(null);
    navigate('/');
  };

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !scrolled;

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${isTransparent ? 'transparent' : ''}`}>
      <div className="header-container">
        <button className="menu-btn mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="菜单">
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <Link to="/" className="logo mobile-only">
          <div className="logo-icon">
            <img src="/logo.png" alt="榴镜" width="36" height="36" style={{ borderRadius: 8 }} />
          </div>
          <span className="logo-text">榴镜</span>
        </Link>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {navItems.map((item, index) => {
            const IconComponent = iconMap[item.path];
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="nav-icon">
                  <IconComponent />
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="user-menu">
            <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="user-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="user-name">{user.name || user.username}</span>
              <svg className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {userMenuOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{user.name || user.username}</span>
                    <span className="dropdown-user-email">{user.email || '榴镜会员'}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  个人中心
                </Link>
                <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  我的订单
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            登录
          </Link>
        )}
      </div>
    </header>
  );
}