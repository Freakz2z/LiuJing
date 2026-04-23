import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../utils/api';
import './Policy.css';

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function Policy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await publicApi.getPolicies();
      setPolicies(res.list || []);
    } catch (e) {
      console.error('Failed to fetch policies:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (policy) => {
    navigate(`/policy/${policy.id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="policy-page">
      <div className="container"><section className="policies-section">{loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>加载中...</span>
            </div>
          ) : policies.length === 0 ? (
            <div className="empty-state">
              <p>暂无政策内容</p>
            </div>
          ) : (
            <div className="policies-list">
              {policies.map((policy, index) => (
                <div
                  key={policy.id}
                  className="policy-item animate-fadeInUp"
                  onClick={() => handleViewDetail(policy)}
                  style={{ cursor: 'pointer', animationDelay: `${index * 0.05}s` }}
                >
                  <div className="policy-main">
                    <div className="policy-meta">
                      <span className="policy-type">{policy.type}</span>
                      <span className="policy-date">{formatDate(policy.published_at || policy.created_at)}</span>
                    </div>
                    <div className="policy-content">
                      <h3 className="policy-title">
                        <span className="policy-title-text">{policy.title}</span>
                      </h3>
                      <div className="policy-footer">
                        <span className="policy-source">{policy.source}</span>
                        <span className="policy-views"><IconEye />{policy.views?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
