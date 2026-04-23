import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicApi, getFileUrl } from '../utils/api';
import './BaseDetail.css';

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconLocation = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffb800" stroke="#ffb800" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconService = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default function BaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [base, setBase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAppointment, setShowAppointment] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', type: '采摘体验', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchBases();
  }, [id]);

  const fetchBases = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getBases();
      const list = res.list || [];
      const found = list.find(b => b.id === Number(id));
      setBase(found || null);
    } catch (e) {
      console.error('Failed to fetch bases:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (error) {
      alert('预约失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-loading-spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!base) {
    return (
      <div className="pd-not-found">
        <p>基地不存在</p>
        <button onClick={() => navigate(-1)}>返回</button>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* 顶部导航栏 */}
      <div className="pd-nav">
        <div className="container">
          <div className="pd-nav-inner">
            <button className="pd-back-btn" onClick={() => navigate(-1)}>
              <IconArrowLeft />
              <span>返回</span>
            </button>
            <div className="pd-breadcrumb">
              <Link to="/bases">基地</Link>
              <span className="pd-breadcrumb-sep">/</span>
              <span>{base.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container">
        <div className="pd-main base-detail-main">
          {/* 左侧：基地信息 */}
          <div className="pd-left">
            <div className="pd-base-image">
              {base.image ? (
                <img src={getFileUrl(base.image)} alt={base.name} />
              ) : (
                <div className="pd-base-image-placeholder">
                  <span>🌴</span>
                </div>
              )}
            </div>
            
            <div className="pd-body-section">
              <h2 className="pd-section-title">基地介绍</h2>
              <div className="pd-description">
                {base.description ? (
                  <ReactMarkdown
                    components={{
                      img: ({ ...props }) => (
                        <img {...props} style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0', display: 'block' }} />
                      ),
                      p: ({ children }) => <p style={{ lineHeight: 1.8, marginBottom: 16 }}>{children}</p>,
                    }}
                  >{base.description}</ReactMarkdown>
                ) : (
                  <p>暂无详细介绍</p>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：信息面板 */}
          <div className="pd-right">
            <div className="pd-info-card">
              <h1 className="pd-title">{base.name}</h1>
              
              <div className="pd-location">
                <IconLocation />
                <span>{base.location || '海南'}</span>
              </div>
              
              {base.rating && (
                <div className="pd-rating">
                  <IconStar /> {Number(base.rating).toFixed(1)}
                </div>
              )}
              
              {/* 特色服务 */}
              {base.features && (
                <div className="pd-features-tags">
                  {base.features.split(',').filter(Boolean).map((feat, idx) => (
                    <span key={idx} className="pd-feature-tag-inline">
                      <IconService /> {feat.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="pd-meta">
                <div className="pd-meta-item">
                  <span className="pd-meta-label">状态</span>
                  <span className="pd-meta-value">{base.status || '正常'}</span>
                </div>
              </div>
              
              <div className="pd-actions">
                <button className="pd-action-btn pd-action-primary" onClick={() => setShowAppointment(true)}>
                  <IconCalendar /> 预约体验
                </button>
                <button className="pd-action-btn" onClick={() => navigate('/bases')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  <span>返回列表</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 预约弹窗 */}
      {showAppointment && (
        <div className="pd-modal-overlay" onClick={() => setShowAppointment(false)}>
          <div className="pd-appointment-modal" onClick={e => e.stopPropagation()}>
            <button className="pd-modal-close" onClick={() => setShowAppointment(false)}>×</button>
            
            {submitted ? (
              <div className="pd-appointment-success">
                <div className="pd-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#E8F5E9"/>
                    <path d="M8 12l3 3 5-6" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>预约成功</h2>
                <p>我们将尽快与您联系确认预约详情</p>
                <button className="pd-action-btn pd-action-primary" onClick={() => { setShowAppointment(false); navigate('/bases'); }}>关闭</button>
              </div>
            ) : (
              <>
                <div className="pd-appointment-header">
                  <h2>预约体验</h2>
                  <p>请填写预约信息</p>
                </div>
                <form onSubmit={handleAppointment} className="pd-appointment-form">
                  <div className="pd-form-group">
                    <label>您的姓名</label>
                    <input
                      type="text"
                      placeholder="请输入姓名"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="pd-form-group">
                    <label>联系电话</label>
                    <input
                      type="tel"
                      placeholder="请输入手机号"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="pd-form-row">
                    <div className="pd-form-group">
                      <label>预约类型</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="采摘体验">采摘体验</option>
                        <option value="研学教育">研学教育</option>
                        <option value="观光游览">观光游览</option>
                      </select>
                    </div>
                    <div className="pd-form-group">
                      <label>预约日期</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="pd-form-group">
                    <label>备注</label>
                    <textarea
                      placeholder="如有特殊需求请备注"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="pd-action-btn pd-action-primary pd-btn-block" disabled={submitting}>
                    {submitting ? '提交中...' : '确认预约'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
