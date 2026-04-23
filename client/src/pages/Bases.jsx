import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { useNavigate } from 'react-router-dom';
import { publicApi, getFileUrl } from '../utils/api';
import './Bases.css';

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

export default function Bases() {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBases();
  }, []);

  const fetchBases = async () => {
    try {
      const res = await publicApi.getBases();
      setBases(res.list || []);
    } catch (e) {
      console.error('Failed to fetch bases:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bases-page">
      <div className="container">{loading ? (
          <div className="loading-state">加载中...</div>
        ) : bases.length === 0 ? (
          <div className="empty-state">
            <p>暂无基地信息</p>
          </div>
        ) : (
          <div className="bases-grid" ref={gridRef}>
            {bases.map(base => (
              <div 
                key={base.id} 
                className="base-card"
                onClick={() => navigate(`/bases/${base.id}`)}
              >
                <div className="base-image">
                  {base.image ? (
                    <img src={getFileUrl(base.image)} alt={base.name} />
                  ) : (
                    <div className="base-image-placeholder">
                      <span>🌴</span>
                    </div>
                  )}
                  <div className="base-rating">
                    <IconStar /> {Number(base.rating || 0).toFixed(1)}
                  </div>
                </div>
                <div className="base-content">
                  <h3 className="base-name">{base.name}</h3>
                  <div className="base-location">
                    <IconLocation />
                    <span>{base.location || '海南'}</span>
                  </div>
                  {base.features && (
                    <div className="base-features">
                      {base.features.split(',').filter(Boolean).slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="feature-tag">
                          <IconService /> {feat.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {base.description && (
                    <p className="base-desc">{base.description.substring(0, 60)}...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
