import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../utils/api';
import './Orders.css';

const statusColors = {
  '待支付': 'orange',
  '已支付': 'blue',
  '已完成': 'green',
  '已取消': 'default',
  '已退款': 'red',
};

const appointmentStatusColors = {
  '待消费': 'orange',
  '已完成': 'green',
  '已取消': 'default',
};

export default function Orders() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await userApi.getOrders();
      setOrders(res.list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAppointments();
      setAppointments(res.list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
    else fetchAppointments();
  }, [tab]);

  const handlePay = async (orderId) => {
    if (!confirm('确认支付该订单？')) return;
    try {
      await userApi.payOrder(orderId);
      alert('支付成功！');
      fetchOrders();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('确认取消该订单？')) return;
    try {
      await userApi.cancelOrder(orderId);
      alert('订单已取消');
      fetchOrders();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="orders-page">
      <h2 className="orders-title">我的订单</h2>

      <div className="orders-tabs">
        <button
          className={`orders-tab ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          全部订单 ({orders.length})
        </button>
        <button
          className={`orders-tab ${tab === 'appointments' ? 'active' : ''}`}
          onClick={() => setTab('appointments')}
        >
          我的预约 ({appointments.length})
        </button>
      </div>

      {loading ? (
        <div className="orders-loading">加载中...</div>
      ) : tab === 'orders' ? (
        orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <p>暂无订单</p>
            <button className="orders-back-btn" onClick={() => navigate('/products')}>去购物</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-no">{order.order_no}</span>
                  <span className={`order-status status-${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-card-body">
                  <div className="order-info-row">
                    <span>收货人：{order.receiver_name}</span>
                    <span>电话：{order.phone}</span>
                  </div>
                  <div className="order-info-row">
                    <span>地址：{order.address}</span>
                  </div>
                  <div className="order-amount">
                    ¥{parseFloat(order.total_amount).toFixed(2)}
                  </div>
                  <div className="order-date">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div className="order-card-footer">
                  <button className="order-detail-btn" onClick={() => navigate(`/orders/${order.id}`)}>
                    查看详情
                  </button>
                  {order.status === '待支付' && (
                    <>
                      <button className="order-pay-btn" onClick={() => handlePay(order.id)}>支付</button>
                      <button className="order-cancel-btn" onClick={() => handleCancel(order.id)}>取消</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : appointments.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📅</div>
          <p>暂无预约记录</p>
        </div>
      ) : (
        <div className="orders-list">
          {appointments.map(item => (
            <div key={item.id} className="order-card">
              <div className="order-card-header">
                <span className="order-no">{item.type}</span>
                <span className={`order-status status-${appointmentStatusColors[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <div className="order-card-body">
                <div className="order-info-row">
                  <span>预约标题：{item.title}</span>
                </div>
                <div className="order-info-row">
                  <span>预约日期：{item.date}</span>
                  <span>电话：{item.phone || '-'}</span>
                </div>
                <div className="order-date">
                  提交时间：{new Date(item.created_at).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
