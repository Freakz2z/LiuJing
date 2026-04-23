import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicApi, getFileUrl } from '../utils/api';
import './ProductDetail.css';

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const typeColors = {
  '本地榴莲': '#2E7D32',
  '进口榴莲': '#1565C0',
  '文创产品': '#E65100',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [_products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [id]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getProducts();
      const list = res.list || [];
      setProducts(list);
      const found = list.find(p => p.id === Number(id));
      setProduct(found || null);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
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

  if (!product) {
    return (
      <div className="pd-not-found">
        <p>商品不存在</p>
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
              <Link to="/products">商品</Link>
              <span className="pd-breadcrumb-sep">/</span>
              <span>{product.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container">
        <div className="pd-main product-detail-main">
          {/* 左侧：商品图片 */}
          <div className="pd-left product-detail-left">
            <div className="pd-product-image">
              {product.image ? (
                <img src={getFileUrl(product.image)} alt={product.name} />
              ) : (
                <div className="pd-product-image-placeholder">
                  <span>🥭</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：商品信息 */}
          <div className="pd-right product-detail-right">
            <div className="pd-info-card">
              <span 
                className="pd-type-badge" 
                style={{ backgroundColor: typeColors[product.type] || '#666', color: '#fff' }}
              >
                {product.type || '文创产品'}
              </span>
              <h1 className="pd-title">{product.name}</h1>
              
              <div className="pd-price">¥{Number(product.price).toFixed(2)}</div>
              
              <div className="pd-meta">
                <div className="pd-meta-item">
                  <span className="pd-meta-label">库存</span>
                  <span className="pd-meta-value">{product.stock || 0}</span>
                </div>
                <div className="pd-meta-item">
                  <span className="pd-meta-label">销量</span>
                  <span className="pd-meta-value">{product.sales || 0}</span>
                </div>
              </div>
              
              <div className="pd-description">
                <h3>商品描述</h3>
                <p>{product.description || '暂无描述'}</p>
              </div>
              
              <div className="pd-actions">
                <button className="pd-action-btn pd-action-primary">
                  <IconCart /> 加入购物车
                </button>
                <button className="pd-action-btn" onClick={() => navigate('/products')}>
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
