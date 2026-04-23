import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { useNavigate } from 'react-router-dom';
import { publicApi, getFileUrl } from '../utils/api';
import './Products.css';

const IconStore = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const typeColors = {
  '本地榴莲': '#2E7D32',
  '进口榴莲': '#1565C0',
  '文创产品': '#E65100',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('全部');
  const gridRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await publicApi.getProducts();
      setProducts(res.list || []);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filterType === '全部'
    ? products
    : products.filter(p => p.type === filterType);

  const types = ['全部', '本地榴莲', '进口榴莲', '文创产品'];

  return (
    <div className="products-page">
      <div className="container"><div className="category-tabs">
          {types.map(type => (
            <button
              key={type}
              className={`category-tab ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>暂无商品</p>
          </div>
        ) : (
          <div className="products-grid" ref={gridRef}>
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card" 
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="product-image">
                  {product.image ? (
                    <img src={getFileUrl(product.image)} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <span>🥭</span>
                    </div>
                  )}
                  <span
                    className="product-type-badge"
                    style={{ backgroundColor: typeColors[product.type] || '#666', color: '#fff' }}
                  >
                    {product.type || '文创产品'}
                  </span>
                </div>
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description?.substring(0, 40) || '优质商品'}...</p>
                  <div className="product-footer">
                    <div className="product-price">¥{Number(product.price).toFixed(2)}</div>
                    <div className="product-sales">销量 {product.sales || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
