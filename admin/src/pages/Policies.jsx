import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Form, Input, Popconfirm, Card, message, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { adminApi, getFileUrl, uploadApi } from '../utils/api';
import CustomModal from '../components/CustomModal';
import ImageUpload from '../components/ImageUpload';
import MediaLibrary from './MediaLibrary';
import '../components/CustomModal.css';
import '../../../client/src/pages/Policy.css';
import dayjs from 'dayjs';

export default function Policies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [contentData, setContentData] = useState({ content: '', interpretation: '' });
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPolicies();
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (t) => <Tag>{t}</Tag> },
    { title: '来源', dataIndex: 'source', key: 'source', width: 150 },
    { title: '浏览量', dataIndex: 'views', key: 'views', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => <Tag color={v === '已发布' ? 'green' : 'orange'}>{v}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => { setViewRecord(record); setIsViewOpen(true); }} style={{ color: '#1890ff' }}>查看</Button>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} style={{ color: '#52c41a' }}>编辑信息</Button>
          <Button type="text" icon={<FileTextOutlined />} size="small" onClick={() => handleEditContent(record)} style={{ color: '#fa8c16' }}>编辑内容</Button>
          <Button type="text" icon={<FileTextOutlined />} size="small" onClick={() => handleEditInterpretation(record)} style={{ color: '#722ed1' }}>编辑解读</Button>
          <Popconfirm title="确认删除" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const handleEdit = (record) => {
    setEditingRecord(record);
form.setFieldsValue({ ...record, published_at: record.published_at ? dayjs(record.published_at) : null });
    setIsModalOpen(true);
  };

  const handleEditContent = (record) => {
    setEditingRecord(record);
    setContentData({ mode: 'content', value: record.content || '', content: record.content || '', interpretation: record.interpretation || '' });
    setIsContentModalOpen(true);
  };

  const handleEditInterpretation = (record) => {
    setEditingRecord(record);
    setContentData({ mode: 'interpretation', value: record.interpretation || '', content: record.content || '', interpretation: record.interpretation || '' });
    setIsContentModalOpen(true);
  };

  const handleContentSave = async () => {
    try {
      const payload = {
        content: contentData.content,
        interpretation: contentData.interpretation,
      };
      if (contentData.mode === 'content') {
        payload.content = contentData.value;
      } else {
        payload.interpretation = contentData.value;
      }
      await adminApi.updatePolicy(editingRecord.id, payload);
      message.success('保存成功');
      setIsContentModalOpen(false);
      fetchData();
    } catch (e) {
      message.error('保存失败: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deletePolicy(id);
      message.success('删除成功');
      fetchData();
    } catch (e) { message.error('删除失败'); }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, published_at: values.published_at?.format('YYYY-MM-DD') };
      if (editingRecord) {
        await adminApi.updatePolicy(editingRecord.id, payload);
      } else {
        await adminApi.createPolicy(payload);
      }
      message.success(editingRecord ? '修改成功' : '添加成功');
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      if (e.errorFields) return;
      message.error('操作失败: ' + e.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20' }}>政策管理</h1>
          <p style={{ color: '#666', margin: 0 }}>管理海南自贸港榴莲跨境贸易相关政策</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); form.resetFields(); setIsModalOpen(true); }} style={{ borderRadius: 8 }}>添加政策</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }}>刷新</Button>
        </div>
      </div>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} />
      </Card>

      <CustomModal showHeader={false}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={editingRecord ? '编辑政策' : '添加政策'}
        width={580}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }} className="optimized-form">
          <Form.Item label="政策标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入政策标题" />
          </Form.Item>
          <Form.Item label="政策类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              {['法规', '通知', '办法', '政策'].map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="来源" name="source">
            <Input placeholder="如：海南省人民政府" />
          </Form.Item>
          <Form.Item label="发布时间" name="published_at">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="草稿">
            <Select>
              <Select.Option value="已发布">已发布</Select.Option>
              <Select.Option value="草稿">草稿</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </CustomModal>

      {/* 内容/解读编辑弹窗 */}
      <CustomModal showHeader={false}
        open={isContentModalOpen}
        onCancel={() => setIsContentModalOpen(false)}
        title={contentData.interpretation !== undefined && contentData.content === '' ? '编辑政策解读' : '编辑政策内容'}
        width={1000}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => setIsContentModalOpen(false)} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleContentSave} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>保存</Button>
          </div>
        }
      >
        <div style={{ marginTop: 16, display: 'flex', gap: 16, height: 500 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>编辑区</div>
            <Input.TextArea
              style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
              value={contentData.value}
              onChange={(e) => {
                setContentData({ ...contentData, value: e.target.value });
              }}
              placeholder="请输入Markdown内容..."
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 500, marginBottom: 8, color: '#333' }}>预览区</div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#fafafa', borderRadius: 8, border: '1px solid #d9d9d9' }}>
              <div className="markdown-body" style={{ fontSize: 14, lineHeight: 1.8 }}>
                <ReactMarkdown>{contentData.value || '*暂无内容*'}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      {/* 政策详情弹窗 - 与客户端样式一致 */}
      {isViewOpen && viewRecord && (
        <div className="policy-modal-overlay" onClick={() => setIsViewOpen(false)}>
          <div className="policy-modal-container" onClick={e => e.stopPropagation()}>
            <div className="policy-modal-header">
              {viewRecord.cover && (
                <img src={getFileUrl(viewRecord.cover)} alt="封面" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '12px 12px 0 0', marginBottom: 16 }} />
              )}
              <div className="policy-modal-title-wrap">
                <span className="policy-modal-type">{viewRecord.type}</span>
                <h2 className="policy-modal-title">{viewRecord.title}</h2>
              </div>
              <button className="policy-modal-close" onClick={() => setIsViewOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="policy-modal-meta">
              <div className="policy-meta-item">
                <span className="meta-label">来源</span>
                <span className="meta-value">{viewRecord.source}</span>
              </div>
              <div className="policy-meta-item">
                <span className="meta-label">浏览</span>
                <span className="meta-value">{viewRecord.views?.toLocaleString() || 0}</span>
              </div>
              <div className="policy-meta-item">
                <span className="meta-label">发布时间</span>
                <span className="meta-value">{viewRecord.published_at?.split('T')[0]}</span>
              </div>
            </div>

            <div className="policy-modal-body">
              {viewRecord.content && (
                <div className="markdown-body policy-markdown">
                  <ReactMarkdown>{viewRecord.content}</ReactMarkdown>
                </div>
              )}
              {viewRecord.interpretation && (
                <>
                  <div className="interpretation-header">
                    <span>政策解读</span>
                  </div>
                  <div className="markdown-body policy-markdown interpretation-markdown">
                    <ReactMarkdown>{viewRecord.interpretation}</ReactMarkdown>
                  </div>
                </>
              )}
              {!viewRecord.content && !viewRecord.interpretation && (
                <div className="empty-state">暂无详细内容</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
