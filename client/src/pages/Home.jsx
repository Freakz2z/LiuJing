import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicApi, getFileUrl } from '../utils/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import './Home.css';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [latestContents, setLatestContents] = useState([]);
  const [latestPolicies, setLatestPolicies] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // GSAP refs
  const contentGridRef = useRef(null);
  const policiesGridRef = useRef(null);
  const productsGridRef = useRef(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // GSAP: banner text animation on slide change
  useEffect(() => {
    const bannerEl = document.querySelector('.banner');
    if (!bannerEl) return;
    const textEls = bannerEl.querySelectorAll('.banner-text-animate');
    gsap.fromTo(textEls,
      { opacity: 0, x: 28 },
      { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07, clearProps: 'all' }
    );
  }, [currentBanner]);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  // GSAP ScrollTrigger: section and card entrance animations
  useEffect(() => {
    if (loading) return;

    const fromVars = { opacity: 0, y: 28 };

    // Section headers
    document.querySelectorAll('.section-header').forEach(el => {
      gsap.fromTo(el, fromVars,
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
    });

    // Content cards
    if (contentGridRef.current) {
      gsap.fromTo(
        contentGridRef.current.querySelectorAll('.latest-content-card'),
        fromVars,
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07,
          scrollTrigger: { trigger: contentGridRef.current, start: 'top 85%', once: true } }
      );
    }

    // Policy cards
    if (policiesGridRef.current) {
      gsap.fromTo(
        policiesGridRef.current.querySelectorAll('.latest-policy-card'),
        fromVars,
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: policiesGridRef.current, start: 'top 85%', once: true } }
      );
    }

    // Product cards
    if (productsGridRef.current) {
      gsap.fromTo(
        productsGridRef.current.querySelectorAll('.latest-product-card'),
        fromVars,
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: productsGridRef.current, start: 'top 85%', once: true } }
      );
    }

    // Hover: scale cards on mouse enter/leave
    const allCards = document.querySelectorAll(
      '.latest-content-card, .latest-policy-card, .latest-product-card'
    );
    allCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.03, y: -4, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [loading]);

  const fetchHomeData = async () => {
    try {
      const [homeData, contentsData, policiesData, productsData] = await Promise.all([
        publicApi.getHomeData(),
        publicApi.getContents(),
        publicApi.getPolicies(),
        publicApi.getProducts()
      ]);
      setBanners(homeData.banners || []);
      setLatestContents(contentsData.list?.slice(0, 6) || []);
      setLatestPolicies(policiesData.list?.slice(0, 3) || []);
      setLatestProducts(productsData.list?.slice(0, 4) || []);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '8px' }}>榴镜</div>
          <div style={{ color: 'var(--text-secondary)' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* 轮播图 */}
      <section className="banner-section">
        <div className="banner">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner-slide ${index === currentBanner ? 'active' : ''}`}
              style={{ backgroundImage: `url(${getFileUrl(banner.image)})` }}
            >
              <div className="banner-overlay" />
              <div className="banner-content">
                <span className="banner-tag banner-text-animate">{banner.tag}</span>
                <h1 className="banner-text-animate">{banner.title}</h1>
                <p className="banner-text-animate">{banner.subtitle}</p>
              </div>
              <div className="banner-progress">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    className={`progress-dot ${idx === currentBanner ? 'active' : ''}`}
                    onClick={() => setCurrentBanner(idx)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 最新内容 */}
      {latestContents.length > 0 && (
        <section className="latest-content-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">最新内容</h2></div>
            <div className="latest-content-grid" ref={contentGridRef}>
              {latestContents.map((content, index) => (
                <Link
                  to={`/content/${content.id}`}
                  key={content.id}
                  className="latest-content-card"
                >
                  <div className="latest-content-image">
                    <img
                      src={content.cover ? getFileUrl(content.cover) : `https://picsum.photos/400/225?random=${content.id}`}
                      alt={content.title}
                    />
                    <span className="latest-content-duration">{content.duration || '--:--'}</span>
                    {content.featured === 1 && <span className="latest-content-featured">精选</span>}
                    <div className="latest-content-overlay">
                      <div className="latest-play-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="latest-content-info">
                    <span className="latest-content-category">{content.category}</span>
                    <h3 className="latest-content-title">{content.title}</h3>
                    <div className="latest-content-meta">
                      <span>{content.author || '未知作者'}</span>
                      <span>{content.views > 10000 ? (content.views / 10000).toFixed(1) + 'w' : content.views} 浏览</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 最新政策 */}
      {latestPolicies.length > 0 && (
        <section className="latest-policies-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">最新政策</h2></div>
            <div className="latest-policies-grid" ref={policiesGridRef}>
              {latestPolicies.map((policy, index) => (
                <Link
                  to={`/policy/${policy.id}`}
                  key={policy.id}
                  className="latest-policy-card"
                >
                  <div className="policy-card-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div className="policy-card-content">
                    <span className="policy-card-type">{policy.type}</span>
                    <h3 className="policy-card-title">{policy.title}</h3>
                    <div className="policy-card-meta">
                      <span>{policy.source}</span>
                      <span>{policy.published_at?.split('T')[0]}</span>
                    </div>
                  </div>
                  <div className="policy-card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 最新商品 */}
      {latestProducts.length > 0 && (
        <section className="latest-products-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">热门商品</h2>
            </div>
            <div className="latest-products-grid" ref={productsGridRef}>
              {latestProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="latest-product-card"
                >
                  <div className="latest-product-image">
                    <img
                      src={product.image ? getFileUrl(product.image) : `https://picsum.photos/300/300?random=${product.id}`}
                      alt={product.name}
                    />
                    {product.status === 1 && <span className="latest-product-status">在售</span>}
                  </div>
                  <div className="latest-product-info">
                    <span className="latest-product-category">{product.type || '文创产品'}</span>
                    <h3 className="latest-product-title">{product.name}</h3>
                    <p className="latest-product-desc">{product.description?.slice(0, 40) || '优质榴莲产品'}</p>
                    <div className="latest-product-footer">
                      <span className="latest-product-price">¥{Number(product.price).toFixed(2)}</span>
                      <span className="latest-product-sales">{product.sales || 0}人购买</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}