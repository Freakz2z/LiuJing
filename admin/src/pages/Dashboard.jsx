import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag } from 'antd';
import {
  EyeOutlined, ShoppingOutlined, UserOutlined, FileTextOutlined,
  ReloadOutlined, BankOutlined,
  ReadOutlined, VideoCameraOutlined, 
  ShopOutlined, RightOutlined,
  BarChartOutlined, PieChartOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../utils/api';

const categoryColors = {
  '助农短片': '#52c41a',
  '产业纪录片': '#1890ff',
  '产业短剧': '#722ed1',
  '自有IP内容': '#fa8c16',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [policyList, setPolicyList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [baseList, setBaseList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, contentRes, policyRes, productRes, baseRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getContents(),
        adminApi.getPolicies(),
        adminApi.getProducts(),
        adminApi.getBases(),
      ]);
      setStats(statsRes);
      setContentList(contentRes.list || []);
      setPolicyList(policyRes.list || []);
      setProductList(productRes.list || []);
      setBaseList(baseRes.list || []);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return null;
  }

  const publishedContent = contentList.filter(c => c.status === '已发布').length;
  const draftContent = contentList.filter(c => c.status !== '已发布').length;
  const contentPieData = [
    { name: '已发布', value: publishedContent, color: '#52c41a' },
    { name: '未发布', value: draftContent, color: '#d9d9d9' },
  ].filter(d => d.value > 0);

  const publishedPolicy = policyList.filter(p => p.status === '已发布').length;
  const draftPolicy = policyList.filter(c => c.status !== '已发布').length;
  const policyStatusPieData = [
    { name: '已发布', value: publishedPolicy, color: '#1890ff' },
    { name: '草稿', value: draftPolicy, color: '#d9d9d9' },
  ].filter(d => d.value > 0);

  const listedProduct = productList.filter(p => p.status === 1 || p.status === '1').length;
  const unlistedProduct = productList.filter(p => p.status === 0 || p.status === '0').length;
  const productPieData = [
    { name: '上架', value: listedProduct, color: '#eb2f96' },
    { name: '下架', value: unlistedProduct, color: '#d9d9d9' },
  ].filter(d => d.value > 0);

  const normalBase = baseList.filter(b => b.status === '正常').length;
  const disabledBase = baseList.filter(b => b.status !== '正常').length;
  const basePieData = [
    { name: '正常', value: normalBase, color: '#52c41a' },
    { name: '已禁用', value: disabledBase, color: '#d9d9d9' },
  ].filter(d => d.value > 0);

  const categoryBarData = (stats.categoryStats || []).map(item => ({
    name: item.category || '未分类',
    count: item.count,
    fill: categoryColors[item.category] || '#999',
  }));

  const topStats = [
    { title: '用户总数', value: stats.totalUsers, suffix: '人', prefix: <UserOutlined />, link: '/admin/users' },
    { title: '内容总数', value: stats.totalContents, suffix: '条', prefix: <VideoCameraOutlined />, link: '/admin/contents' },
    { title: '商品总数', value: stats.totalProducts, suffix: '件', prefix: <ShopOutlined />, link: '/admin/products' },
    { title: '基地总数', value: stats.totalBases, suffix: '个', prefix: <BankOutlined />, link: '/admin/bases' },
    { title: '政策总数', value: stats.totalPolicies, suffix: '篇', prefix: <ReadOutlined />, link: '/admin/policies' },
    { title: '总浏览量', value: stats.totalViews || 0, suffix: '次', prefix: <EyeOutlined />, link: '/admin/contents' },
  ];

  const renderMiniPie = (data) => (
    <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={26}
            outerRadius={38}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={'cell-' + index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLatestCard = (title, icon, data, link, renderItem) => (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
        </div>
      }
      extra={<a style={{ color: '#1B5E20', fontSize: 11 }} onClick={() => window.location.href = link}>查看全部 <RightOutlined style={{ fontSize: 10 }} /></a>}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 320 }}
      styles={{ body: { padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' } }}
      hoverable
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {data.length > 0 ? data.slice(0, 5).map((item, index) => (
          <div key={item.id || index} style={{
            padding: '12px 16px',
            borderBottom: index < Math.min(data.length, 5) - 1 ? '1px solid #f0f0f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            {renderItem(item, index)}
          </div>
        )) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div>暂无数据</div>
          </div>
        )}
      </div>
    </Card>
  );

  const statusItems = [
    { label: '内容状态', data: contentPieData, total1: publishedContent, total2: draftContent, total: stats.totalContents, color: '#1890ff', icon: <VideoCameraOutlined /> },
    { label: '政策状态', data: policyStatusPieData, total1: publishedPolicy, total2: draftPolicy, total: stats.totalPolicies, color: '#fa8c16', icon: <ReadOutlined /> },
    { label: '商品状态', data: productPieData, total1: listedProduct, total2: unlistedProduct, total: stats.totalProducts, color: '#eb2f96', icon: <ShoppingOutlined /> },
    { label: '基地状态', data: basePieData, total1: normalBase, total2: disabledBase, total: stats.totalBases, color: '#52c41a', icon: <BankOutlined /> },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4, color: '#1B5E20', fontWeight: 700 }}>数据概览</h1>
          <p style={{ color: '#999', margin: 0, fontSize: 14 }}>实时掌握平台运营状况</p>
        </div>
        <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchData} loading={loading} style={{ borderRadius: 8 }}>
          刷新数据
        </Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {topStats.map((stat, i) => (
          <Col xs={12} sm={8} xl={4} key={i}>
            <Card
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', height: 120 }}
              styles={{ body: { padding: '16px', height: '100%', boxSizing: 'border-box' } }}
              hoverable
              onClick={() => window.location.href = stat.link}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#666', flexShrink: 0,
                }}>
                  {stat.prefix}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#999', fontSize: 12, marginBottom: 2 }}>{stat.title}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ color: '#333', fontSize: 24, fontWeight: 700 }}>{loading ? '-' : stat.value}</span>
                    <span style={{ color: '#bbb', fontSize: 12 }}>{stat.suffix}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined style={{ color: '#1B5E20' }} />
                <span style={{ fontWeight: 600, fontSize: 16 }}>内容分类统计</span>
              </div>
            }
            extra={<a style={{ color: '#1B5E20', fontSize: 12 }} onClick={() => window.location.href = '/admin/contents'}>查看全部 <RightOutlined style={{ fontSize: 10 }} /></a>}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 320 }}
            styles={{ body: { padding: 20, height: 'calc(100% - 57px)', boxSizing: 'border-box' } }}
          >
            <Row gutter={[16, 16]} style={{ height: '100%' }} align="middle">
              <Col xs={24} lg={14}>
                <div style={{ height: 220 }}>
                  {categoryBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryBarData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} axisLine={{ stroke: '#eee' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip 
                          formatter={(value) => [value + ' 条', '内容数量']}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '8px 12px' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {categoryBarData.map((entry, index) => (
                            <Cell key={'cell-' + index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', background: '#fafafa', borderRadius: 8 }}>
                      <FileTextOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                      <span style={{ fontSize: 14 }}>暂无内容数据</span>
                    </div>
                  )}
                </div>
              </Col>
              <Col xs={24} lg={10}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {categoryBarData.length > 0 ? categoryBarData.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: item.fill, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{item.name}</div>
                        <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: (item.count / Math.max(...categoryBarData.map(d => d.count), 1) * 100) + '%', background: item.fill, borderRadius: 3 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#333', minWidth: 30, textAlign: 'right' }}>{item.count}</span>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>暂无分类数据</div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChartOutlined style={{ color: '#1B5E20' }} />
                <span style={{ fontWeight: 600, fontSize: 16 }}>数据状态概览</span>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 320 }}
            styles={{ body: { padding: 20, height: 'calc(100% - 57px)', boxSizing: 'border-box' } }}
          >
            <Row gutter={[8, 16]} style={{ height: '100%' }} align="middle">
              {statusItems.map((item, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80 }}>
                      {renderMiniPie(item.data)}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13, color: '#666', textAlign: 'center', width: '100%' }}>{item.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#333', marginTop: 4, textAlign: 'center', width: '100%' }}>
                      {loading ? '-' : item.total1}/{item.total2}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          {renderLatestCard('最新内容', <VideoCameraOutlined style={{ color: '#1890ff' }} />, contentList, '/admin/contents', (item, index) => (
            <>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#999' }}><EyeOutlined style={{ marginRight: 2 }} />{item.views || 0}</div>
              </div>
              <Tag color={item.status === '已发布' ? 'success' : 'default'} style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>{item.status}</Tag>
            </>
          ))}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderLatestCard('最新政策', <ReadOutlined style={{ color: '#fa8c16' }} />, policyList, '/admin/policies', (item, index) => (
            <>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fa8c16', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{item.type || '通知公告'}</div>
              </div>
              <Tag color={item.status === '已发布' ? 'success' : 'default'} style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>{item.status}</Tag>
            </>
          ))}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderLatestCard('最新商品', <ShoppingOutlined style={{ color: '#eb2f96' }} />, productList, '/admin/products', (item, index) => (
            <>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fff0f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eb2f96', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>¥{item.price}</div>
              </div>
              <Tag color={item.status === 1 || item.status === '1' ? 'success' : 'default'} style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>
                {item.status === 1 || item.status === '1' ? '上架' : '下架'}
              </Tag>
            </>
          ))}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderLatestCard('最新基地', <BankOutlined style={{ color: '#52c41a' }} />, baseList, '/admin/bases', (item, index) => (
            <>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52c41a', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{item.location}</div>
              </div>
              <Tag color={item.status === '正常' ? 'success' : 'error'} style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>{item.status}</Tag>
            </>
          ))}
        </Col>
      </Row>
    </div>
  );
}
