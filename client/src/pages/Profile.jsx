import { useState, useEffect, useRef } from 'react';
import { userApi, getFileUrl } from '../utils/api';
import gsap from 'gsap';
import './Profile.css';

const IconUser = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const avatarRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, favRes] = await Promise.all([
        userApi.getProfile().catch(() => null),
        userApi.getFavorites().catch(() => ({ list: [] })),
      ]);
      if (profileRes) {
        setUser(profileRes);
        setForm({ name: profileRes.name || '', phone: profileRes.phone || '' });
      }
      setFavorites(favRes.list || []);
    } catch (e) {
      console.error('Failed to load profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  // GSAP: avatar hover rotation + card entrance animations
  useEffect(() => {
    if (loading) return;

    // Avatar hover: gentle rotation
    const avatar = avatarRef.current;
    if (avatar) {
      const parent = avatar.closest('.profile-avatar');
      if (parent) {
        parent.style.cursor = 'pointer';
        parent.addEventListener('mouseenter', () => {
          gsap.to(parent, { rotate: 5, scale: 1.08, duration: 0.3, ease: 'power2.out' });
        });
        parent.addEventListener('mouseleave', () => {
          gsap.to(parent, { rotate: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
        });
      }
    }

    // Card and tab entrance
    const layout = document.querySelector('.profile-layout');
    if (layout) {
      gsap.fromTo(layout.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.1 }
      );
    }

    // Favorite/appointment cards hover
    const allCards = document.querySelectorAll('.favorite-card, .appointment-card');
    allCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', duration: 0.25, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, boxShadow: 'none', duration: 0.25, ease: 'power2.out' });
      });
    });
  }, [loading]);

  const handleSave = async () => {
    try {
      const updated = await userApi.updateProfile(form);
      setUser(updated);
      localStorage.setItem('liujing_user', JSON.stringify(updated));
      setEditing(false);
    } catch (e) {
      alert('保存失败');
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">

        <div className="profile-layout">
          {/* 用户信息卡片 */}
          <div className="profile-card">
            <div className="profile-avatar" ref={avatarRef}>
              <IconUser />
            </div>
            <div className="profile-info">
              <h2>{user?.name || user?.username}</h2>
              <p>@{user?.username}</p>
              {user?.phone && <p className="phone">{user.phone}</p>}
            </div>
            {!editing ? (
              <button className="btn-edit" onClick={() => setEditing(true)}>
                <IconEdit />编辑资料
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSave}>保存</button>
                <button className="btn-cancel" onClick={handleCancel}>取消</button>
              </div>
            )}

            {editing && (
              <div className="edit-form">
                <div className="form-group">
                  <label>姓名</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="form-group">
                  <label>手机号</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="请输入手机号"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 标签页 */}
          <div className="profile-content">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <IconHeart />我的收藏 ({favorites.length})
              </button>
            </div>

            {/* 收藏列表 */}
            {activeTab === 'favorites' && (
              <div className="favorites-list">
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <p>暂无收藏内容</p>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {favorites.map((item) => (
                      <div key={item.id} className="favorite-card">
                        <div className="favorite-cover">
                          <img
                            src={item.cover ? getFileUrl(item.cover) : `https://picsum.photos/300/200?random=${item.content_id}`}
                            alt={item.title}
                          />
                          <button className="play-btn"><IconPlay /></button>
                        </div>
                        <div className="favorite-info">
                          <span className="favorite-category">{item.category}</span>
                          <h4>{item.title}</h4>
                          <span className="favorite-author">{item.author || '未知作者'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}