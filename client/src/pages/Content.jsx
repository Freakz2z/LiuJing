import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { useNavigate } from 'react-router-dom';
import { publicApi, userApi, getFileUrl } from '../utils/api';
import './Content.css';

const categoryMap = {
  '全部': null,
  '助农短片': '助农短片',
  '产业纪录片': '产业纪录片',
  '产业短剧': '产业短剧','图文': '图文',
  '自有IP内容': '自有IP内容',
};

const IconPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const IconPlayDoc = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconHeartOutline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconEmpty = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);

export default function Content() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [favorites, setFavorites] = useState(new Set());
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const categories = ['全部', '助农短片', '产业纪录片', '产业短剧', '图文', '自有IP内容'];

  useEffect(() => {
    fetchContents();
  }, [activeCategory]);

  useEffect(() => {
    // 只有登录用户才加载收藏状态，避免未登录时重定向到登录页
    if (localStorage.getItem('liujing_token')) {
      loadFavorites();
    }
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await userApi.getFavorites();
      const ids = new Set((res.list || []).map(item => item.content_id));
      setFavorites(ids);
    } catch (e) {}
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== '全部' && categoryMap[activeCategory]) {
        params.category = categoryMap[activeCategory];
      }
      const res = await publicApi.getContents(params);
      setContents(res.list || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error('Failed to fetch contents:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      if (favorites.has(id)) {
        await userApi.deleteFavorite(id);
        setFavorites(prev => { const s = new Set(prev); s.delete(id); return s; });
        setContents(prev => prev.map(c => c.id === id ? { ...c, likes: Math.max(0, (c.likes || 0) - 1) } : c));
      } else {
        await userApi.addFavorite(id);
        setFavorites(prev => new Set([...prev, id]));
        setContents(prev => prev.map(c => c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c));
      }
    } catch (e) {
      alert('请先登录后再收藏');
    }
  };

  const openPlayer = async (content) => {
    try {
      await publicApi.incrementContentView(content.id);
      setContents(prev => prev.map(c => c.id === content.id ? { ...c, views: (c.views || 0) + 1 } : c));
    } catch (e) {}
    navigate('/content/' + content.id);
  };

  return (
    <div className="content-page">
      <div className="container"><div className="category-tabs">
          {categories.map(cat => (
            <button key={cat} className={`category-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>加载中...</div>
        ) : (
          <div className="content-grid">
            {contents.map((content, index) => (
              <div key={content.id} className="content-card" style={{ cursor: "pointer" }} onClick={() => openPlayer(content)}>
                {content.cover ? (
                  <div className="content-image">
                    <img src={getFileUrl(content.cover)} alt={content.title} />
                    {content.video_url && content.duration && <span className="content-duration">{content.duration}</span>}
                    {content.featured === 1 && <span className="content-featured">精选</span>}
                    <div className="content-overlay">
                      {content.video_url ? (
                        <button className="play-btn"><IconPlay /></button>
                      ) : (
                        <button className="play-btn" style={{ background: 'rgba(27,94,32,0.8)' }}><IconPlayDoc /></button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="content-image content-image-no-cover">
                    <div className="content-no-cover-badge">
                      {content.video_url ? <IconPlay /> : <IconPlayDoc />}
                      <span>{content.video_url ? '视频' : '图文'}</span>
                    </div>
                  </div>
                )}
                <div className="content-info">
                  <span className="content-category">{content.category}</span>
                  <h3 className="content-title">{content.title}</h3>
                  <p className="content-author">{content.author || '未知作者'}</p>
                  <div className="content-meta">
                    <span className="meta-item"><IconEye />{content.views > 10000 ? (content.views / 10000).toFixed(1) + 'w' : content.views}</span>
                    <span className="meta-item"><IconHeart />{content.likes > 10000 ? (content.likes / 10000).toFixed(1) + 'w' : content.likes}</span>
                  </div>
                </div>
                <div className="content-actions" onClick={e => e.stopPropagation()}>
                  <button className={`action-btn ${favorites.has(content.id) ? 'active' : ''}`} onClick={() => toggleFavorite(content.id)}>
                    {favorites.has(content.id) ? <><IconHeart />已收藏</> : <><IconHeartOutline />收藏</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && contents.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><IconEmpty /></div>
            <p>暂无相关内容</p>
            <span>请选择其他分类浏览</span>
          </div>
        )}

        {!loading && contents.length > 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            共 {total} 条内容
          </div>
        )}
      </div>
    </div>
  );
}

