import { useState, useEffect, useRef } from 'react';
import { Table, Button, Tag, Space, Form, Input, Select, message, Popconfirm, Card, Switch, Radio, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { adminApi, uploadApi, getFileUrl } from '../utils/api';
import MediaLibrary from './MediaLibrary';
import ImageUpload from '../components/ImageUpload';
import CustomModal from '../components/CustomModal';
import '../components/CustomModal.css';

const categories = ['助农短片', '产业纪录片', '产业短剧', '图文', '自有IP内容'];

export default function Contents() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [mediaSelectorVisible, setMediaSelectorVisible] = useState(false);
  const [mediaSelectorType, setMediaSelectorType] = useState('');
  const [contentType, setContentType] = useState('video');
  const [bodyValue, setBodyValue] = useState('');
  const bodyTextRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getContents();
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
      title: '封面',
      key: 'cover',
      width: 80,
      render: (_, r) => r.cover ? (
        <img src={getFileUrl(r.cover)} alt="封面" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PictureOutlined style={{ color: '#999' }} />
        </div>
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    { title: '分类', dataIndex: 'category', key: 'category', width: 120 },
    {
      title: '类型',
      dataIndex: 'video_url',
      key: 'type',
      width: 80,
      render: (v) => <Tag color={v ? 'blue' : 'green'}>{v ? '视频' : '图文'}</Tag>
    },
    { title: '作者', dataIndex: 'author', key: 'author', width: 100 },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 80,
      render: (v) => <span style={{ color: '#666' }}>{v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === '已发布' ? 'green' : 'orange'} style={{ borderRadius: 12 }}>
          {status}
        </Tag>
      )
    },
    { title: '日期', dataIndex: 'created_at', key: 'date', width: 100, render: (_, r) => r.created_at?.split('T')[0] },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} style={{ color: '#1890ff' }}>
            查看
          </Button>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} style={{ color: '#52c41a' }}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除内容"${record.title}"吗？`}
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

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setContentType('video');
    setBodyValue('');
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    const isVideo = !!record.video_url;
    setContentType(isVideo ? 'video' : 'image');
    form.setFieldsValue({
      ...record,
      status: record.status === '已发布',
      featured: record.featured === 1,
    });
    setBodyValue(record.body || '');
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setViewRecord(record);
    setIsViewOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteContent(id);
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败: ' + e.message);
    }
  };

  const openMediaSelector = (type) => {
    setMediaSelectorType(type);
    setMediaSelectorVisible(true);
  };

  const handleMediaSelect = (url) => {
    if (mediaSelectorType === 'cover') {
      form.setFieldsValue({ cover: url });
    } else if (mediaSelectorType === 'body_image') {
      // Insert markdown image at cursor position
      const textarea = bodyTextRef.current?.resizableTextArea?.textArea || bodyTextRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = form.getFieldValue('body') || '';
        const before = currentValue.substring(0, start);
        const after = currentValue.substring(end);
        const markdown = `![图片](${url})`;
        const newValue = before + markdown + after;
        form.setFieldsValue({ body: newValue });
        setBodyValue(newValue);
        // Set cursor after inserted text
        setTimeout(() => {
          const pos = start + markdown.length;
          textarea.selectionStart = pos;
          textarea.selectionEnd = pos;
        }, 0);
      } else {
        // Fallback: append to end
        const currentValue = form.getFieldValue('body') || '';
        form.setFieldsValue({ body: currentValue + `\n![图片](${url})` });
      }
    } else {
      form.setFieldsValue({ video_url: url });
    }
    setMediaSelectorVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        status: values.status ? '已发布' : '草稿',
        featured: values.featured ? 1 : 0,
      };
      if (editingRecord) {
        await adminApi.updateContent(editingRecord.id, payload);
        message.success('修改成功');
      } else {
        await adminApi.createContent(payload);
        message.success('添加成功');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      if (e.errorFields) return;
      message.error('操作失败: ' + e.message);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const filteredData = data.filter(item => {
    const matchKeyword = !searchKeyword || item.title?.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchCategory = !filterCategory || item.category === filterCategory;
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchKeyword && matchCategory && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20', fontWeight: 600 }}>内容管理</h1>
          <p style={{ color: '#666', margin: 0 }}>管理平台所有内容资产</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<PlusOutlined />} onClick={handleAdd} style={{ borderRadius: 8 }}>
            添加内容
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} style={{ borderRadius: 8 }}>
            刷新
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 16, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="搜索内容标题..."
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            style={{ width: 240, borderRadius: 8 }}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            allowClear
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 140 }}
            value={filterCategory || undefined}
            onChange={v => setFilterCategory(v || '')}
          >
            {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 120 }}
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v || '')}
          >
            <Select.Option value="已发布">已发布</Select.Option>
            <Select.Option value="草稿">草稿</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
      </Card>

      <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 添加/编辑弹窗 */}
      <CustomModal showHeader={false}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={editingRecord ? '编辑内容' : '添加内容'}
        width={800}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleSubmit} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="optimized-form">
          {/* 内容类型切换 */}
          <Form.Item label="内容类型" required>
            <Radio.Group
              value={contentType}
              onChange={e => {
                setContentType(e.target.value);
                form.setFieldsValue({ video_url: undefined, body: undefined, duration: undefined });
              }}
              buttonStyle="solid"
            >
              <Radio.Button value="video">视频内容</Radio.Button>
              <Radio.Button value="image">图文内容</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入内容标题" />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择分类">
              {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="作者" name="author">
            <Input placeholder="请输入作者名称" />
          </Form.Item>

          {/* 封面上传 - 两者都有 */}
          <Form.Item label="封面图片" name="cover" valuePropName="value" getValueFromEvent={e => e}>
            <ImageUpload
              accept="image/*"
              uploadApi={uploadApi.uploadImage}
              maxSize={5 * 1024 * 1024 * 1024}
              hint="支持 JPG/PNG/GIF 格式"
              sizeLabel="5GB"
              onMediaSelect={() => openMediaSelector('cover')}
            />
          </Form.Item>

          {/* 视频内容专用 */}
          {contentType === 'video' && (
            <>
              <Form.Item label="视频" name="video_url" valuePropName="value" getValueFromEvent={e => e}>
                <ImageUpload
                  accept="video/*"
                  uploadApi={uploadApi.uploadVideo}
                  maxSize={5 * 1024 * 1024 * 1024}
                  hint="支持 MP4/WebM 格式"
                  sizeLabel="5GB"
                  onMediaSelect={() => openMediaSelector('video')}
                />
              </Form.Item>
              <Form.Item label="时长" name="duration">
                <Input placeholder="如: 15:30" style={{ width: 120 }} />
              </Form.Item>
            </>
          )}

          {/* 图文内容专用 */}
          {contentType === 'image' && (
            <>
              <Form.Item label="正文内容" name="body">
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
                          onClick={() => openMediaSelector('body_image')}
                          style={{ fontSize: 14 }}
                        />
                      </Tooltip>
                      <div style={{ width: 1, background: '#ccc', margin: '4px 4px' }} />
                      <Tooltip title="加粗">
                        <Button type="text" size="small"
                          onClick={() => {
                            const ta = bodyTextRef.current;
                            if (!ta) return;
                            const start = ta.selectionStart, end = ta.selectionEnd;
                            const v = form.getFieldValue('body') || '';
                            const newV = v.substring(0, start) + '**' + v.substring(start, end) + '**' + v.substring(end);
                            form.setFieldsValue({ body: newV });
                            setTimeout(() => { ta.selectionStart = start + 2; ta.selectionEnd = end + 2; ta.focus(); }, 0);
                          }}
                          style={{ fontWeight: 700, fontSize: 14 }}>B</Button>
                      </Tooltip>
                      <Tooltip title="斜体">
                        <Button type="text" size="small"
                          onClick={() => {
                            const ta = bodyTextRef.current;
                            if (!ta) return;
                            const start = ta.selectionStart, end = ta.selectionEnd;
                            const v = form.getFieldValue('body') || '';
                            const newV = v.substring(0, start) + '*' + v.substring(start, end) + '*' + v.substring(end);
                            form.setFieldsValue({ body: newV });
                            setTimeout(() => { ta.selectionStart = start + 1; ta.selectionEnd = end + 1; ta.focus(); }, 0);
                          }}
                          style={{ fontStyle: 'italic', fontSize: 14 }}>I</Button>
                      </Tooltip>
                      <Tooltip title="链接">
                        <Button type="text" size="small"
                          onClick={() => {
                            const ta = bodyTextRef.current;
                            if (!ta) return;
                            const start = ta.selectionStart, end = ta.selectionEnd;
                            const v = form.getFieldValue('body') || '';
                            const selected = v.substring(start, end) || '链接文字';
                            const newV = v.substring(0, start) + `[${selected}](url)` + v.substring(end);
                            form.setFieldsValue({ body: newV });
                            setTimeout(() => {
                              const urlStart = start + selected.length + 3;
                              ta.selectionStart = urlStart;
                              ta.selectionEnd = urlStart + 3;
                              ta.focus();
                            }, 0);
                          }}
                          style={{ fontSize: 14 }}>Link</Button>
                      </Tooltip>
                    </div>
                    <Input.TextArea
                      value={bodyValue}
                      onChange={(e) => { setBodyValue(e.target.value); form.setFieldsValue({ body: e.target.value }); }}
                      ref={bodyTextRef}
                      name="body"
                      placeholder="使用 Markdown 编写正文内容，支持标题、列表、链接等格式。点击上方图片按钮可插入媒体库图片。"
                      rows={10}
                      style={{ borderRadius: '0 0 8px 8px', fontFamily: 'monospace', fontSize: 13 }}
                    />
                  </div>
              </Form.Item>
            </>
          )}

          <Form.Item label="状态" name="status" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
          </Form.Item>
          <Form.Item label="推荐" name="featured" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </CustomModal>

      {/* 查看详情弹窗 */}
      <CustomModal showHeader={false}
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        title="内容详情"
        width={800}
        footer={null}
      >
        {viewRecord && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {viewRecord.cover && (
                <img src={getFileUrl(viewRecord.cover)} alt="封面" style={{ width: 200, height: 120, borderRadius: 8, objectFit: 'cover' }} />
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#1B5E20', marginBottom: 8 }}>{viewRecord.title}</h2>
                <div style={{ display: 'flex', gap: 12, color: '#666', fontSize: 13 }}>
                  <Tag>{viewRecord.category}</Tag>
                  <Tag color={viewRecord.video_url ? 'blue' : 'green'}>
                    {viewRecord.video_url ? '视频' : '图文'}
                  </Tag>
                  <span>浏览：{viewRecord.views}</span>
                  <span>点赞：{viewRecord.likes}</span>
                  <Tag color={viewRecord.status === '已发布' ? 'green' : 'orange'}>{viewRecord.status}</Tag>
                </div>
              </div>
            </div>

            {viewRecord.video_url && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: 8 }}>视频</div>
                <div style={{ background: '#f0f0f0', borderRadius: 8, padding: 16, textAlign: 'center', color: '#666' }}>
                  视频内容，请点击"播放"查看完整视频
                </div>
              </div>
            )}

            {viewRecord.body && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: 8 }}>正文内容</div>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}>
                  <ReactMarkdown className="markdown-body">
                    {viewRecord.body}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </CustomModal>

      {/* 媒体库选择器 */}
      <MediaLibrary
        visible={mediaSelectorVisible}
        selectMode
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
