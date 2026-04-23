import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { userApi } from '../utils/api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  // GSAP: form elements float in on mount
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(card,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.05 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('两次密码输入不一致');
          setLoading(false);
          return;
        }
        await userApi.register({ username: form.username, password: form.password });
        const res = await userApi.login({ username: form.username, password: form.password });
        localStorage.setItem('liujing_token', res.token);
        localStorage.setItem('liujing_user', JSON.stringify(res.user));
        navigate('/');
      } else {
        const res = await userApi.login({ username: form.username, password: form.password });
        localStorage.setItem('liujing_token', res.token);
        localStorage.setItem('liujing_user', JSON.stringify(res.user));
        navigate('/');
      }
    } catch (e) {
      setError(e.message || (mode === 'register' ? '注册失败' : '登录失败，请检查用户名和密码'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setForm({ username: '', password: '', confirmPassword: '', phone: '', email: '' });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card" ref={cardRef} >
          <div className="login-header">
            <div className="login-logo">
              <img src="/logo.png" alt="榴镜自贸" />
            </div>
            <h1>榴镜自贸·乡链视界</h1>
          </div>

          <div className="login-tabs">
            <button 
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              登录
            </button>
            <button 
              className={`login-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              注册
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="请输入用户名"
                required
                autoComplete="username"
              />
            </div>
            
            {mode === 'register' && (
              <div className="form-row">
                <div className="form-group">
                  <label>手机号 <span className="optional">(可选)</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="请输入手机号"
                    autoComplete="tel"
                  />
                </div>
                <div className="form-group">
                  <label>邮箱 <span className="optional">(可选)</span></label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="请输入邮箱"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="请输入密码"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            
            {mode === 'register' && (
              <div className="form-group">
                <label>确认密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
            </button>
          </form>

          <div className="login-footer">
            <button className="back-btn" onClick={() => navigate('/')}>
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
