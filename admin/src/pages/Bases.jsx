import { useState, useEffect, useRef } from 'react';
import { Table, Button, Tag, Space, Form, Input, Popconfirm, Card, message, Select, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EnvironmentOutlined, PictureOutlined } from '@ant-design/icons';
import { adminApi, uploadApi, getFileUrl } from '../utils/api';
import MediaLibrary from './MediaLibrary';
import ImageUpload from '../components/ImageUpload';
import CustomModal from '../components/CustomModal';
import '../components/CustomModal.css';

export default function Bases() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [mediaSelectorVisible, setMediaSelectorVisible] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const descriptionTextRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBases();
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
      title: '图片',
      key: 'image',
      width: 80,
      render: (_, r) => (
        r.image ? (
          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <img src={getFileUrl(r.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>无</div>
        )
      )
    },
    {
      title: '基地信息',
      key: 'base',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
            <EnvironmentOutlined /> {r.location}
          </div>
        </div>
      )
    },
    {
      title: '特色服务',
      dataIndex: 'features',
      key: 'features',
      render: (f) => (f || '').split(',').filter(Boolean).map((feat, i) => <Tag key={i} style={{ marginBottom: 2 }}>{feat}</Tag>)
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (v) => <span><span style={{ color: '#ff6b00' }}>{Number(v).toFixed(1)}</span> / 5.0</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => <Tag color={v === '正常' ? 'green' : 'red'}>{v}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} style={{ color: '#52c41a' }}>编辑</Button>
          <Popconfirm title="确认删除" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setDescriptionValue(record.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteBase(id);
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

  const insertMarkdown = (prefix, suffix = '') => {
    const ta = descriptionTextRef.current;
    if (!ta) return;
    const textarea = ta.resizableTextArea?.textArea || ta;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const v = form.getFieldValue('description') || '';
    const selected = v.substring(start, end) || '文字';
    const newV = v.substring(0, start) + prefix + selected + suffix + v.substring(end);
    form.setFieldsValue({ description: newV });
    setDescriptionValue(newV);
    setTimeout(() => {
      const pos = start + prefix.length + selected.length + suffix.length;
      textarea.selectionStart = pos;
      textarea.selectionEnd = pos;
      textarea.focus();
    }, 0);
  };

  const handleDescriptionImageSelect = () => {
    // Use media selector to insert image
    setMediaSelectorType('desc_image');
    setMediaSelectorVisible(true);
  };

  const handleMediaSelectWithType = (url) => {
    if (url) {
      if (mediaSelectorType === 'desc_image') {
        // Insert markdown image
        const ta = descriptionTextRef.current;
        if (ta) {
          const textarea = ta.resizableTextArea?.textArea || ta;
          const start = textarea.selectionStart;
          const v = form.getFieldValue('description') || '';
          const markdown = `![图片](${url})`;
          const newV = v.substring(0, start) + markdown + v.substring(start);
          form.setFieldsValue({ description: newV });
          setDescriptionValue(newV);
        }
      } else {
        form.setFieldsValue({ image: url });
      }
    }
    setMediaSelectorVisible(false);
  };

  const [mediaSelectorType, setMediaSelectorType] = useState('');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await adminApi.updateBase(editingRecord.id, values);
      } else {
        await adminApi.createBase(values);
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
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20' }}>基地管理</h1>
          <p style={{ color: '#666', margin: 0 }}>管理榴莲种植基地和文旅体验基地</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); form.resetFields(); setDescriptionValue(''); setIsModalOpen(true); }} style={{ borderRadius: 8 }}>添加基地</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }}>刷新</Button>
        </div>
      </div>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} />
      </Card>

      <CustomModal showHeader={false}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={editingRecord ? '编辑基地' : '添加基地'}
        width={680}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }} className="optimized-form">
          <Form.Item label="基地名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入基地名称" />
          </Form.Item>
          <Form.Item label="基地位置" name="location" rules={[{ required: true, message: '请输入位置' }]}>
            <Input placeholder="如：海南省三亚市吉阳区" />
          </Form.Item>
          <Form.Item label="特色服务" name="features" extra="多个服务用逗号分隔">
            <Input placeholder="如：榴莲采摘,观光游览,研学教育" />
          </Form.Item>
          <Form.Item label="基地描述" name="description">
            <div>
              {/* Markdown 工具栏 */}
              <div style={{
                display: 'flex',
                gap: 4,
                marginBottom: 8,
                padding: '6px 8px',
                background: '#f5f5f5',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #d9d9d9',
                borderBottom: 'none'
              }}>
                <Tooltip title="插入图片（从媒体库）">
                  <Button
                    type="text"
                    size="small"
                    icon={<PictureOutlined />}
                    onClick={handleDescriptionImageSelect}
                    style={{ fontSize: 14 }}
                  />
                </Tooltip>
                <div style={{ width: 1, background: '#ccc', margin: '4px 4px' }} />
                <Tooltip title="加粗">
                  <Button type="text" size="small"
                    onClick={() => insertMarkdown('**', '**')}
                    style={{ fontWeight: 700, fontSize: 14 }}>B</Button>
                </Tooltip>
                <Tooltip title="斜体">
                  <Button type="text" size="small"
                    onClick={() => insertMarkdown('*', '*')}
                    style={{ fontStyle: 'italic', fontSize: 14 }}>I</Button>
                </Tooltip>
                <Tooltip title="链接">
                  <Button type="text" size="small"
                    onClick={() => insertMarkdown('[', '](url)')}
                    style={{ fontSize: 14 }}>Link</Button>
                </Tooltip>
              </div>
              <Input.TextArea
                value={descriptionValue}
                onChange={(e) => { setDescriptionValue(e.target.value); form.setFieldsValue({ description: e.target.value }); }}
                ref={descriptionTextRef}
                name="description"
                placeholder="使用 Markdown 编写基地详细介绍，支持标题、列表、链接、图片等格式。"
                rows={8}
                style={{ borderRadius: '0 0 8px 8px', fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
          </Form.Item>
          <Form.Item label="基地图片" name="image" valuePropName="value" getValueFromEvent={e => e}>
            <ImageUpload
              accept="image/*"
              uploadApi={uploadApi.uploadImage}
              maxSize={5 * 1024 * 1024 * 1024}
              hint="支持 JPG/PNG/GIF 格式"
              sizeLabel="5GB"
              onMediaSelect={() => { setMediaSelectorType('image'); setMediaSelectorVisible(true); }}
            />
          </Form.Item>
          <Form.Item label="评分" name="rating">
            <Input type="number" placeholder="如：4.5" style={{ width: 100 }} min={0} max={5} step={0.1} />
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="正常">
            <Select>
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="停业">停业</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </CustomModal>

      <MediaLibrary
        visible={mediaSelectorVisible}
        selectMode
        onSelect={handleMediaSelectWithType}
      />
    </div>
  );
}
