import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicApi, getFileUrl } from '../utils/api';
import './PolicyDetail.css';

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function PolicyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const data = await publicApi.getPolicyById(id);
      setPolicy(data);
    } catch (e) {
      console.error('Failed to fetch policy:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-loading-spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="pd-not-found">
        <p>政策不存在</p>
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
              <Link to="/policy">政策</Link>
              <span className="pd-breadcrumb-sep">/</span>
              <span>{policy.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container">
        <div className="pd-main">
          {/* 左侧：内容区 */}
          <div className="pd-left">
            {policy.cover && (
              <div className="pd-cover">
                <img src={getFileUrl(policy.cover)} alt={policy.title} />
              </div>
            )}
            
            {/* 正文内容 */}
            <div className="pd-body-section">
              {policy.content && (
                <div className="markdown-body pd-markdown">
                  <ReactMarkdown
                    components={{
                      img: ({ ...props }) => (
                        <img {...props} style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0', display: 'block' }} />
                      )
                    }}
                  >{policy.content}</ReactMarkdown>
                </div>
              )}
              
              {policy.interpretation && (
                <div className="pd-interpretation">
                  <div className="pd-interpretation-header">
                    <span>政策解读</span>
                  </div>
                  <div className="markdown-body pd-markdown">
                    <ReactMarkdown
                      components={{
                        img: ({ ...props }) => (
                          <img {...props} style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0', display: 'block' }} />
                        )
                      }}
                    >{policy.interpretation}</ReactMarkdown>
                  </div>
                </div>
              )}
              
              {!policy.content && !policy.interpretation && (
                <div className="pd-empty">暂无详细内容</div>
              )}
            </div>
          </div>

          {/* 右侧：信息面板 */}
          <div className="pd-right">
            <div className="pd-info-card">
              <span className="pd-type-badge">{policy.type}</span>
              <h1 className="pd-title">{policy.title}</h1>
              
              <div className="pd-meta">
                <div className="pd-meta-item">
                  <span className="pd-meta-label">来源</span>
                  <span className="pd-meta-value">{policy.source || '未知'}</span>
                </div>
                <div className="pd-meta-item">
                  <span className="pd-meta-label">浏览</span>
                  <span className="pd-meta-value">{policy.views?.toLocaleString() || 0}</span>
                </div>
                <div className="pd-meta-item">
                  <span className="pd-meta-label">发布时间</span>
                  <span className="pd-meta-value">{formatDate(policy.published_at)}</span>
                </div>
              </div>
              
              <div className="pd-actions">
                <button className="pd-action-btn" onClick={() => navigate('/policy')}>
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
    </div>
  );
}
