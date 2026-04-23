import { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, message, Avatar } from 'antd';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { adminApi } from '../utils/api';

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setData(res.list || []);
    } catch (e) {
      message.error('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '用户信息',
      key: 'user',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={r.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#1B5E20' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{r.name || r.username}</div>
            <div style={{ fontSize: 12, color: '#999' }}>@{r.username}</div>
          </div>
        </div>
      )
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130, render: t => t || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s) => <Tag color={s === '正常' ? 'green' : 'red'}>{s}</Tag>
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (t) => t?.split('T')[0] || '-'
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20' }}>用户管理</h1>
          <p style={{ color: '#666', margin: 0 }}>查看平台注册用户信息</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }}>刷新</Button>
      </div>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} />
      </Card>
    </div>
  );
}
