import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Form, Input, Popconfirm, Card, message, Select, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, AppstoreOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { adminApi } from '../utils/api';
import CustomModal from '../components/CustomModal';

const { TextArea } = Input;
const { Option } = Select;

export default function Industry() {
  const [regions, setRegions] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [form] = Form.useForm();
  const [industryForm] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsRes, industryRes] = await Promise.all([
        adminApi.getRegions(),
        adminApi.getIndustryItems()
      ]);
      setRegions(regionsRes.list || []);
      setIndustryData(industryRes.list || []);
    } catch (e) {
      message.error('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 地区管理
  const openRegionModal = (record = null) => {
    setEditingRegion(record);
    form.setFieldsValue(record || { name: '', geo_id: '', intro: '', overview: '' });
    setIsRegionModalOpen(true);
  };

  const saveRegion = async () => {
    try {
      const values = await form.validateFields();
      if (editingRegion) {
        await adminApi.updateRegion(editingRegion.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createRegion(values);
        message.success('创建成功');
      }
      setIsRegionModalOpen(false);
      fetchData();
    } catch (e) {
      message.error(editingRegion ? '更新失败' : '创建失败');
    }
  };

  const deleteRegion = async (id) => {
    try {
      await adminApi.deleteRegion(id);
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败: ' + e.message);
    }
  };

  // 产业项目管理
  const openIndustryModal = (record = null) => {
    setEditingIndustry(record);
    industryForm.setFieldsValue(record || {
      region_id: undefined, category: undefined, name: '', position: '', area: '',
      capacity: '', varieties: '', brand: '', features: '', url: '', status: '草稿', published_at: null
    });
    setIsIndustryModalOpen(true);
  };

  const saveIndustry = async () => {
    try {
      const values = await industryForm.validateFields();
      if (editingIndustry) {
        await adminApi.updateIndustryItem(editingIndustry.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createIndustryItem(values);
        message.success('创建成功');
      }
      setIsIndustryModalOpen(false);
      fetchData();
    } catch (e) {
      message.error(editingIndustry ? '更新失败' : '创建失败');
    }
  };

  const deleteIndustry = async (id) => {
    try {
      await adminApi.deleteIndustryItem(id);
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败: ' + e.message);
    }
  };

  const regionColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '地区名称', dataIndex: 'name', key: 'name', render: (t) => <span style={{ fontWeight: 500 }}>{t}</span> },
    { title: 'GeoID', dataIndex: 'geo_id', key: 'geo_id', width: 120 },
    { title: '简介', dataIndex: 'intro', key: 'intro', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openRegionModal(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => deleteRegion(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const industryColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name', render: (t) => <span style={{ fontWeight: 500 }}>{t}</span> },
    { title: '地区', dataIndex: 'region_name', key: 'region_name', width: 140 },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (t) => {
        const colors = { '种苗繁育': 'green', '规模化种植': 'blue', '加工分选': 'orange', '文旅博览': 'purple' };
        return <Tag color={colors[t] || 'default'}>{t}</Tag>;
      }
    },
    { title: '位置', dataIndex: 'position', key: 'position', ellipsis: true },
    { title: '面积', dataIndex: 'area', key: 'area', width: 150, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (t) => <Tag color={t === '已发布' ? 'success' : 'default'}>{t}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openIndustryModal(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => deleteIndustry(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: 'regions',
      label: <span><EnvironmentOutlined /> 地区管理</span>,
      children: (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openRegionModal()}>添加地区</Button>
        </div>
      )
    },
    {
      key: 'industry',
      label: <span><AppstoreOutlined /> 产业项目管理</span>,
      children: (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openIndustryModal()}>添加产业项目</Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>产业管理</h2>
      <Tabs defaultActiveKey="industry" items={tabItems} style={{ marginBottom: 16 }} />
      
      <Card title="产业项目列表" extra={<Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>} size="small">
        <Table
          columns={industryColumns}
          dataSource={industryData}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 1000 }}
          style={{ marginBottom: 24 }}
        />
      </Card>

      <Card title="地区列表" extra={<Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>} size="small">
        <Table
          columns={regionColumns}
          dataSource={regions}
          rowKey="id"
          loading={loading}
          size="small"
        />
      </Card>

      {/* 地区弹窗 */}
      <CustomModal
        title={editingRegion ? '编辑地区' : '添加地区'}
        open={isRegionModalOpen}
        onOk={saveRegion}
        onCancel={() => setIsRegionModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="地区名称" rules={{ required: true, message: '请输入地区名称' }}>
            <Input placeholder="如：三亚市" />
          </Form.Item>
          <Form.Item name="geo_id" label="GeoID">
            <Input placeholder="如：sanya" />
          </Form.Item>
          <Form.Item name="intro" label="地区简介">
            <TextArea rows={2} placeholder="简要介绍地区情况" />
          </Form.Item>
          <Form.Item name="overview" label="产业概览">
            <TextArea rows={3} placeholder="该地区产业整体情况" />
          </Form.Item>
        </Form>
      </CustomModal>

      {/* 产业项目弹窗 */}
      <CustomModal
        title={editingIndustry ? '编辑产业项目' : '添加产业项目'}
        open={isIndustryModalOpen}
        onOk={saveIndustry}
        onCancel={() => setIsIndustryModalOpen(false)}
        width={700}
      >
        <Form form={industryForm} layout="vertical">
          <Form.Item name="region_id" label="所属地区" rules={[{ required: true, message: '请选择地区' }]}>
            <Select placeholder="选择地区">
              {regions.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="产业分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              <Option value="种苗繁育">种苗繁育</Option>
              <Option value="规模化种植">规模化种植</Option>
              <Option value="加工分选">加工分选</Option>
              <Option value="文旅博览">文旅博览</Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="企业/基地名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：海南优旗·三亚崖州种苗基地" />
          </Form.Item>
          <Form.Item name="position" label="位置">
            <Input placeholder="如：三亚市崖州区南滨农场" />
          </Form.Item>
          <Form.Item name="area" label="面积">
            <Input placeholder="如：200亩" />
          </Form.Item>
          <Form.Item name="capacity" label="产能/规模">
            <Input placeholder="如：年产20万株" />
          </Form.Item>
          <Form.Item name="varieties" label="种植品种">
            <Input placeholder="如：金枕、猫山王、黑刺" />
          </Form.Item>
          <Form.Item name="brand" label="品牌">
            <Input placeholder="如：大嘴鸟" />
          </Form.Item>
          <Form.Item name="features" label="特点">
            <TextArea rows={2} placeholder="简要描述特点" />
          </Form.Item>
          <Form.Item name="url" label="相关链接">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="已发布">已发布</Option>
              <Option value="草稿">草稿</Option>
            </Select>
          </Form.Item>
        </Form>
      </CustomModal>
    </div>
  );
}
