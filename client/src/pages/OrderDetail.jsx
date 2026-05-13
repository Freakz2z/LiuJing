import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../utils/api';
import { getFileUrl } from '../utils/api';
import './OrderDetail.css';

const statusColors = {
  '待支付': 'orange',
  '已支付': 'blue',
  '已完成': 'green',
  '已取消': 'default',
  '已退款': 'red',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await userApi.getOrderDetail(id);
        setOrder(res.order);
        setItems(res.items || []);
      } catch (e) {
        alert(e.message);
        navigate('/orders');
      }
    };
    fetch();
  }, [id]);

  const handlePay = async () => {
    if (!confirm('确认支付？')) return;
    setLoading(true);
    try {
      await userApi.payOrder(id);
      alert('支付成功！');
      const res = await userApi.getOrderDetail(id);
      setOrder(res.order);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('确认取消？')) return;
    setLoading(true);
    try {
      await userApi.cancelOrder(id);
      alert('已取消');
      const res = await userApi.getOrderDetail(id);
      setOrder(res.order);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="order-detail-page">
      <h2 className="od-title">订单详情</h2>

      <div className="od-section">
        <div className="od-section-title">订单信息</div>
        <div className="od-info-grid">
          <div className="od-info-item">
            <span className="od-label">订单号</span>
            <span className="od-value mono">{order.order_no}</span>
          </div>
          <div className="od-info-item">
            <span className="od-label">状态</span>
            <span className={`od-value status-badge ${statusColors[order.status]}`}>{order.status}</span>
          </div>
          <div className="od-info-item">
            <span className="od-label">下单时间</span>
            <span className="od-value">{new Date(order.created_at).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

      <div className="od-section">
        <div className="od-section-title">收货信息</div>
        <div className="od-info-grid">
          <div className="od-info-item">
            <span className="od-label">收货人</span>
            <span className="od-value">{order.receiver_name}</span>
          </div>
          <div className="od-info-item">
            <span className="od-label">电话</span>
            <span className="od-value">{order.phone}</span>
          </div>
          <div className="od-info-item" style={{ gridColumn: '1/-1' }}>
            <span className="od-label">地址</span>
            <span className="od-value">{order.address}</span>
          </div>
          {order.remark && (
            <div className="od-info-item" style={{ gridColumn: '1/-1' }}>
              <span className="od-label">备注</span>
              <span className="od-value">{order.remark}</span>
            </div>
          )}
        </div>
      </div>

      <div className="od-section">
        <div className="od-section-title">商品清单</div>
        <div className="od-items">
          {items.map(item => (
            <div key={item.id} className="od-item">
              <img
                src={getFileUrl(item.product_image)}
                alt={item.product_name}
                className="od-item-img"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="od-item-info">
                <div className="od-item-name">{item.product_name}</div>
                <div className="od-item-price">¥{parseFloat(item.price).toFixed(2)} × {item.quantity}</div>
              </div>
              <div className="od-item-subtotal">
                ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="od-total-row">
          订单总额：<span className="od-total-amount">¥{parseFloat(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="od-actions">
        <button className="od-back-btn" onClick={() => navigate('/orders')}>返回订单列表</button>
        {order.status === '待支付' && (
          <>
            <button className="od-cancel-btn" onClick={handleCancel} disabled={loading}>取消订单</button>
            <button className="od-pay-btn" onClick={handlePay} disabled={loading}>
              {loading ? '处理中...' : '立即支付'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
