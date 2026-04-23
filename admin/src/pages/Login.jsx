import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { adminApi } from '../utils/api';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await adminApi.login(values);
      localStorage.setItem('liujing_admin_token', res.token);
      localStorage.setItem('liujing_admin_user', JSON.stringify(res.user));
      message.success('登录成功');
      window.location.href = '/';
    } catch (e) {
      message.error(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)' }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8, color: '#1B5E20' }}>🌿</div>
          <h1 style={{ fontSize: 24, color: '#1B5E20', marginBottom: 4 }}>榴镜管理后台</h1>
          <p style={{ color: '#999', margin: 0 }}>海南自贸港榴莲产业平台</p>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined style={{ color: '#999' }} />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#999' }} />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ borderRadius: 8, height: 44 }}>
              登录
            </Button>
          </Form.Item>
        </Form>

      </Card>
    </div>
  );
}
