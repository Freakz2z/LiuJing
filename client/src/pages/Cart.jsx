import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../utils/api';
import { getFileUrl } from '../utils/api';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ receiver_name: '', phone: '', address: '', remark: '' });
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await userApi.getCart();
      setItems(res.list || []);
      setTotal(parseFloat(res.total || 0));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await userApi.removeFromCart(productId);
      fetchCart();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await userApi.updateCartItem(productId, quantity);
      fetchCart();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCheckout = async () => {
    if (!orderInfo.receiver_name || !orderInfo.phone || !orderInfo.address) {
      alert('请填写完整的收货信息');
      return;
    }
    setLoading(true);
    try {
      const res = await userApi.createOrder(orderInfo);
      alert('订单创建成功！');
      navigate('/orders');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <h2 className="cart-title">我的购物车</h2>

      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <p>购物车是空的</p>
          <button className="cart-back-btn" onClick={() => navigate('/products')}>去逛逛</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={getFileUrl(item.image)}
                  alt={item.product_name}
                  className="cart-item-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product_name}</div>
                  <div className="cart-item-price">¥{parseFloat(item.price).toFixed(2)}</div>
                  <div className="cart-item-stock">库存: {item.stock}</div>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => handleUpdateQty(item.product_id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-subtotal">
                    ¥{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                  <button className="cart-remove-btn" onClick={() => handleRemove(item.product_id)}>删除</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              共 {items.reduce((s, i) => s + i.quantity, 0)} 件商品，
              合计: <span className="cart-total-price">¥{total.toFixed(2)}</span>
            </div>
            <button className="cart-checkout-btn" onClick={() => setShowCheckout(true)}>
              结算
            </button>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-modal-content">
            <h3>确认订单信息</h3>
            <div className="checkout-form">
              <div className="form-group">
                <label>收货人姓名 *</label>
                <input
                  type="text"
                  value={orderInfo.receiver_name}
                  onChange={e => setOrderInfo({ ...orderInfo, receiver_name: e.target.value })}
                  placeholder="请输入收货人姓名"
                />
              </div>
              <div className="form-group">
                <label>联系电话 *</label>
                <input
                  type="tel"
                  value={orderInfo.phone}
                  onChange={e => setOrderInfo({ ...orderInfo, phone: e.target.value })}
                  placeholder="请输入联系电话"
                />
              </div>
              <div className="form-group">
                <label>收货地址 *</label>
                <input
                  type="text"
                  value={orderInfo.address}
                  onChange={e => setOrderInfo({ ...orderInfo, address: e.target.value })}
                  placeholder="请输入详细收货地址"
                />
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={orderInfo.remark}
                  onChange={e => setOrderInfo({ ...orderInfo, remark: e.target.value })}
                  placeholder="备注信息（可选）"
                  rows={2}
                />
              </div>
              <div className="checkout-summary">
                <div>商品总额: <b>¥{total.toFixed(2)}</b></div>
              </div>
              <div className="checkout-actions">
                <button className="checkout-cancel-btn" onClick={() => setShowCheckout(false)}>取消</button>
                <button className="checkout-confirm-btn" onClick={handleCheckout} disabled={loading}>
                  {loading ? '提交中...' : `确认下单 (¥${total.toFixed(2)})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
