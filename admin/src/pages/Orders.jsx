import { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, message, Select, Space } from 'antd';
import { adminApi } from '../utils/api';

const { Option } = Select;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders(status || undefined);
      setOrders(res.list || []);
      if (res.stats) setStats(res.stats);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const handleViewDetail = async (order) => {
    try {
      const res = await adminApi.getOrderDetail(order.id);
      setCurrentOrder(res.order);
      setDetailItems(res.items || []);
      setDetailModal(true);
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      message.success('状态更新成功');
      fetchOrders(statusFilter);
    } catch (e) {
      message.error(e.message);
    }
  };

  const statusColors = {
    '待支付': 'orange',
    '已支付': 'blue',
    '已完成': 'green',
    '已取消': 'default',
    '已退款': 'red',
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 180,
      render: (text) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
    },
    {
      title: '用户',
      key: 'user',
      render: (_, r) => r.username || r.user_name || `ID:${r.user_id}`,
    },
    {
      title: '收货人',
      dataIndex: 'receiver_name',
      key: 'receiver_name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '收货地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v) => `¥${parseFloat(v).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t) => t ? new Date(t).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetail(r)}>详情</Button>
          <Select
            size="small"
            value={r.status}
            onChange={(val) => handleUpdateStatus(r.id, val)}
            style={{ width: 100 }}
          >
            <Option value="待支付">待支付</Option>
            <Option value="已支付">已支付</Option>
            <Option value="已完成">已完成</Option>
            <Option value="已取消">已取消</Option>
            <Option value="已退款">已退款</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          placeholder="筛选状态"
          style={{ width: 120 }}
        >
          <Option value="待支付">待支付</Option>
          <Option value="已支付">已支付</Option>
          <Option value="已完成">已完成</Option>
          <Option value="已取消">已取消</Option>
          <Option value="已退款">已退款</Option>
        </Select>
      </div>

      {stats && Object.keys(stats).length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Tag color="default">全部 {stats.total}</Tag>
          <Tag color="orange">待支付 {stats.pending}</Tag>
          <Tag color="blue">已支付 {stats.paid}</Tag>
          <Tag color="green">已完成 {stats.completed}</Tag>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`订单详情 - ${currentOrder?.order_no || ''}`}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={700}
      >
        {currentOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><b>收货人：</b>{currentOrder.receiver_name}</div>
              <div><b>电话：</b>{currentOrder.phone}</div>
              <div style={{ gridColumn: '1/-1' }}><b>地址：</b>{currentOrder.address}</div>
              <div><b>金额：</b>¥{parseFloat(currentOrder.total_amount).toFixed(2)}</div>
              <div><b>状态：</b><Tag color={statusColors[currentOrder.status]}>{currentOrder.status}</Tag></div>
              <div style={{ gridColumn: '1/-1' }}><b>备注：</b>{currentOrder.remark || '无'}</div>
              <div><b>下单时间：</b>{new Date(currentOrder.created_at).toLocaleString('zh-CN')}</div>
            </div>
            <h4>商品清单</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ textAlign: 'left', padding: 8 }}>商品</th>
                  <th style={{ textAlign: 'center', padding: 8 }}>单价</th>
                  <th style={{ textAlign: 'center', padding: 8 }}>数量</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>小计</th>
                </tr>
              </thead>
              <tbody>
                {detailItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 8 }}>
                      <div>{item.product_name}</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: 8 }}>¥{parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ textAlign: 'center', padding: 8 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: 8 }}>¥{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
