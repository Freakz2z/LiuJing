import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Form, Input, InputNumber, Popconfirm, Card, message, Select, Switch, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined, PictureOutlined } from '@ant-design/icons';
import { adminApi, uploadApi, getFileUrl } from '../utils/api';
import MediaLibrary from './MediaLibrary';
import ImageUpload from '../components/ImageUpload';
import CustomModal from '../components/CustomModal';
import '../components/CustomModal.css';

const productTypes = ['全部', '本地榴莲', '进口榴莲', '文创产品'];

const typeColors = {
  '本地榴莲': 'green',
  '进口榴莲': 'blue',
  '文创产品': 'orange',
};

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [filterType, setFilterType] = useState('全部');
  const [mediaSelectorVisible, setMediaSelectorVisible] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts();
      setData(res.list || []);
    } catch (e) {
      message.error('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = filterType === '全部'
    ? data
    : data.filter(item => item.type === filterType);

  const columns = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 100, render: v => v || '-' },
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '商品信息',
      key: 'product',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {r.image ? (
            <img
              src={getFileUrl(r.image)}
              alt={r.name}
              style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid #f0f0f0' }}
            />
          ) : (
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #f0f0f0'
            }}>
              <PictureOutlined style={{ fontSize: 20, color: '#ccc' }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#999', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.description || '暂无描述'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (t) => (
        <Tag color={typeColors[t] || 'default'} style={{ borderRadius: 6 }}>
          {t || '文创产品'}
        </Tag>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v) => <span style={{ color: '#ff6b00', fontWeight: 600, fontSize: 15 }}>¥{Number(v).toFixed(2)}</span>
    },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 80 },
    { title: '销量', dataIndex: 'sales', key: 'sales', width: 80, render: v => v || 0 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => (
        <Tag color={v === 1 ? 'green' : 'red'} style={{ borderRadius: 8, minWidth: 50, textAlign: 'center' }}>
          {v === 1 ? '上架' : '下架'}
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
            description={`确定要删除商品"${record.name}"吗？`}
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
    form.setFieldsValue({ ...record, status: record.status === 1 });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteProduct(id);
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
      const payload = { ...values, status: values.status ? 1 : 0 };
      if (editingRecord) {
        await adminApi.updateProduct(editingRecord.id, payload);
      } else {
        await adminApi.createProduct(payload);
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
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20', fontWeight: 600 }}>商品管理</h1>
          <p style={{ color: '#666', margin: 0 }}>管理本地榴莲、进口榴莲及文创产品</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<PlusOutlined />}
            onClick={() => { setEditingRecord(null); form.resetFields(); setIsModalOpen(true); }}
            style={{ borderRadius: 8 }}
          >
            添加商品
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} style={{ borderRadius: 8 }}>刷新</Button>
        </div>
      </div>

      <Card style={{ borderRadius: 16, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <FilterOutlined style={{ color: '#999' }} />
          <span style={{ color: '#666', fontSize: 14 }}>筛选类型：</span>
          {productTypes.map(type => (
            <Button
              key={type}
              type={filterType === type ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilterType(type)}
              style={{ borderRadius: 6 }}
            >
              {type}
            </Button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#999', fontSize: 13 }}>
            共 <strong style={{ color: '#1B5E20' }}>{filteredData.length}</strong> 件商品
          </span>
        </div>
      </Card>

      <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 件商品`,
          }}
        />
      </Card>

      <CustomModal showHeader={false}
        open={isModalOpen}
        onCancel={handleModalClose}
        title={editingRecord ? '编辑商品' : '添加商品'}
        width={640}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={handleModalClose} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item label="产品编码" name="code">
            <Input placeholder="请输入产品溯源码" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="商品类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
                <Select placeholder="请选择类型">
                  <Select.Option value="本地榴莲">本地榴莲</Select.Option>
                  <Select.Option value="进口榴莲">进口榴莲</Select.Option>
                  <Select.Option value="文创产品">文创产品</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="价格（元）" name="price" rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入价格" prefix="¥" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="商品描述" name="description">
            <Input.TextArea placeholder="请输入商品描述" rows={3} showCount maxLength={500} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="库存" name="stock" rules={[{ required: true, message: '请输入库存' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="上架状态" name="status" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="上架" unCheckedChildren="下架" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="商品图片" name="image" valuePropName="value" getValueFromEvent={e => e}>
            <ImageUpload
              accept="image/*"
              uploadApi={uploadApi.uploadImage}
              maxSize={5 * 1024 * 1024 * 1024}
              hint="支持 JPG/PNG/GIF 格式"
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