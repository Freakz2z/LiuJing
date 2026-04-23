import { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children, homePage }) {
  const location = useLocation();
  const contentRef = useRef(null);

  // 路由切换时页面内容淡入
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return (
    <div className="layout">
      <Header />
      <main
        ref={contentRef}
        className={"main-content page-content " + (homePage ? "home-page" : "")}
        style={{ opacity: 0 }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
