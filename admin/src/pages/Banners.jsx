import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Form, Input, Popconfirm, Card, message, Select, Switch, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { adminApi, uploadApi, getFileUrl } from '../utils/api';
import MediaLibrary from './MediaLibrary';
import ImageUpload from '../components/ImageUpload';
import CustomModal from '../components/CustomModal';
import '../components/CustomModal.css';

const statusColors = {
  '显示': 'green',
  '隐藏': 'default',
};

export default function Banners() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [mediaSelectorVisible, setMediaSelectorVisible] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBanners();
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
      title: '轮播图',
      key: 'image',
      width: 200,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {r.image ? (
            <img
              src={getFileUrl(r.image)}
              alt={r.title}
              style={{ width: 120, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #f0f0f0' }}
            />
          ) : (
            <div style={{
              width: 120,
              height: 60,
              borderRadius: 8,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #f0f0f0'
            }}>
              暂无图片
            </div>
          )}
        </div>
      )
    },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '副标题', dataIndex: 'subtitle', key: 'subtitle', ellipsis: true },
    { title: '标签', dataIndex: 'tag', key: 'tag', width: 100, render: t => t || '-' },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      render: v => <span style={{ color: '#fa8c16', fontWeight: 600 }}>{v || 0}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => (
        <Tag color={statusColors[v] || 'default'} style={{ borderRadius: 8, minWidth: 50, textAlign: 'center' }}>
          {v || '显示'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            style={{ color: '#52c41a' }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除轮播图"${record.title}"吗？`}
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="text" icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, status: record.status === '显示' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteBanner(id);
      message.success('删除成功');
      fetchData();
    } catch (e) { message.error('删除失败'); }
  };

  const handleMediaSelect = (url) => {
    if (url) {
      form.setFieldsValue({ image: url });
    }
    setMediaSelectorVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, status: values.status ? '显示' : '隐藏' };
      if (editingRecord) {
        await adminApi.updateBanner(editingRecord.id, payload);
      } else {
        await adminApi.createBanner(payload);
      }
      message.success(editingRecord ? '修改成功' : '添加成功');
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      if (e.errorFields) return;
      message.error('操作失败: ' + e.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20', fontWeight: 600 }}>轮播图管理</h1>
          <p style={{ color: '#666', margin: 0 }}>管理首页轮播图内容</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<PlusOutlined />}
            onClick={() => { setEditingRecord(null); form.resetFields(); setIsModalOpen(true); }}
            style={{ borderRadius: 8 }}
          >
            添加轮播图
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} style={{ borderRadius: 8 }}>
            刷新
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 张轮播图`,
          }}
        />
      </Card>

      <CustomModal showHeader={false}
        open={isModalOpen}
        onCancel={handleModalClose}
        title={editingRecord ? '编辑轮播图' : '添加轮播图'}
        width={640}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={handleModalClose} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入轮播图标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item label="副标题" name="subtitle">
            <Input placeholder="请输入副标题（可选）" maxLength={200} showCount />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="标签" name="tag">
                <Input placeholder="如：纪录片、政策热点、公益" maxLength={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="排序" name="sort" initialValue={0}>
                <Input type="number" min={0} placeholder="数字越大越靠前" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="跳转链接" name="link">
            <Input placeholder="点击轮播图跳转的链接（可选）" />
          </Form.Item>
          <Form.Item label="显示状态" name="status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>

          <Form.Item label="轮播图图片" name="image" valuePropName="value" getValueFromEvent={e => e} rules={[{ required: true, message: '请上传轮播图图片' }]}>
            <ImageUpload
              accept="image/*"
              uploadApi={uploadApi.uploadImage}
              maxSize={5 * 1024 * 1024 * 1024}
              hint="支持 JPG/PNG/GIF 格式，建议尺寸1200x500"
              sizeLabel="5GB"
              onMediaSelect={() => setMediaSelectorVisible(true)}
            />
          </Form.Item>
        </Form>
      </CustomModal>

      <MediaLibrary
        visible={mediaSelectorVisible}
        selectMode
        onSelect={handleMediaSelect}
      />
    </div>
  );
}