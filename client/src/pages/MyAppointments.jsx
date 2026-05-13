import { useState, useEffect } from 'react';
import { userApi } from '../utils/api';
import './Orders.css';

const statusColors = {
  '待消费': 'orange',
  '已完成': 'green',
  '已取消': 'default',
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

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
    fetchAppointments();
  }, []);

  return (
    <div className="orders-page">
      <h2 className="orders-title">我的预约</h2>

      {loading ? (
        <div className="orders-loading">加载中...</div>
      ) : appointments.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">--</div>
          <p>暂无预约记录</p>
        </div>
      ) : (
        <div className="orders-list">
          {appointments.map(item => (
            <div key={item.id} className="order-card">
              <div className="order-card-header">
                <span className="order-no">{item.type}</span>
                <span className={`order-status status-${statusColors[item.status] || 'default'}`}>
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
