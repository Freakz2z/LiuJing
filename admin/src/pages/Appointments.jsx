import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card, message, Select, Badge } from 'antd';
import { ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { adminApi } from '../utils/api';

const statusMap = {
  '待消费': { color: 'processing', text: '待消费' },
  '已完成': { color: 'success', text: '已完成' },
  '已取消': { color: 'default', text: '已取消' },
};

const typeMap = {
  '采摘体验': 'green',
  '文创产品': 'orange',
  '研学教育': 'blue',
};

export default function Appointments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAppointments();
      setData(res.list || []);
    } catch (e) {
      message.error('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateAppointmentStatus(id, status);
      message.success('状态更新成功');
      fetchData();
    } catch (e) {
      message.error('更新失败: ' + e.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '预约类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (t) => <Tag color={typeMap[t] || 'default'}>{t}</Tag>
    },
    { title: '预约标题', dataIndex: 'title', key: 'title', render: (t) => <span style={{ fontWeight: 500 }}>{t}</span> },
    { title: '用户', dataIndex: 'user_name', key: 'user', width: 100, render: (t, r) => t || r.username || '-' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '预约日期', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => {
        const map = statusMap[s] || { color: 'default', text: s };
        return <Badge status={map.color} text={map.text} />;
      }
    },
    {
      title: '预约时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (t) => t?.split('T')[0] || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status === '待消费' && (
            <>
              <Button type="text" size="small" icon={<CheckOutlined />} onClick={() => updateStatus(record.id, '已完成')} style={{ color: '#52c41a' }}>完成</Button>
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => updateStatus(record.id, '已取消')} style={{ color: '#ff4d4f' }}>取消</Button>
            </>
          )}
          {record.status === '已完成' && <Tag color="green">已完成</Tag>}
          {record.status === '已取消' && <Tag>已取消</Tag>}
        </Space>
      )
    },
  ];

  const filteredData = filterStatus ? data.filter(d => d.status === filterStatus) : data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20' }}>预约管理</h1>
          <p style={{ color: '#666', margin: 0 }}>管理用户的体验预约和文创产品预约</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }}>刷新</Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Space>
          <span style={{ color: '#666' }}>筛选状态：</span>
          <Select placeholder="全部状态" allowClear style={{ width: 140 }}
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v || '')}>
            <Select.Option value="待消费">待消费</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
            <Select.Option value="已取消">已取消</Select.Option>
          </Select>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={filteredData} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} />
      </Card>
    </div>
  );
}
