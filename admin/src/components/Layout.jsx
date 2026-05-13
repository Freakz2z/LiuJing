import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, message, Badge, Avatar } from 'antd';
import { LogoutOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';
import {
  HomeOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin', icon: <HomeOutlined />, label: '首页概览' },
  { key: '/admin/banners', icon: <PictureOutlined />, label: '轮播图管理' },
  { key: '/admin/contents', icon: <FileTextOutlined />, label: '内容管理' },
  { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/admin/bases', icon: <EnvironmentOutlined />, label: '基地管理' },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: '商品管理' },
  { key: '/admin/appointments', icon: <CalendarOutlined />, label: '预约管理' },
  { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/admin/policies', icon: <FileTextOutlined />, label: '政策管理' },
  { key: '/admin/industry', icon: <AppstoreOutlined />, label: '产业管理' },
  { key: '/admin/media', icon: <PictureOutlined />, label: '媒体库' },
];

// 获取用户头像 initials
const getInitials = (name) => {
  if (!name) return 'A';
  return name.charAt(0).toUpperCase();
};

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('liujing_admin_user');
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('liujing_admin_token');
    localStorage.removeItem('liujing_admin_user');
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 500 }}>{adminUser?.name || '管理员'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>@{adminUser?.username || 'admin'}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        collapsedWidth={80}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: 'linear-gradient(180deg, #1B5E20 0%, #0D3311 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="榴镜" width="28" height="28" style={{ borderRadius: 6 }} />
          </div>
          {!collapsed && (
            <span style={{
              marginLeft: 12,
              color: 'white',
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: '-0.3px',
            }}>
              榴镜管理后台
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
          className="custom-sidebar-menu"
        />
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 10,
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.3s',
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.3s', background: '#f5f6f8' }}>
        <Header style={{
          background: 'white',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, color: '#333', fontWeight: 500 }}>管理后台</span>

          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* 通知图标 */}
            <Badge count={3} size="small" offset={[-2, 2]}>
              <div style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}>
                <BellOutlined style={{ fontSize: 18, color: '#666' }} />
              </div>
            </Badge>

            {/* 用户下拉菜单 */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => { if (key === 'logout') handleLogout(); }
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px',
                background: '#fafafa',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                <Avatar
                  size={32}
                  style={{ backgroundColor: '#1B5E20', fontWeight: 600, fontSize: 14 }}
                >
                  {getInitials(adminUser?.name)}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#333', lineHeight: 1.3 }}>
                    {adminUser?.name || '管理员'}
                  </span>
                  <span style={{ fontSize: 11, color: '#999', lineHeight: 1.3 }}>
                    {adminUser?.role === 'admin' ? '超级管理员' : '普通用户'}
                  </span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{
          padding: 24,
          minHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}