import { useState } from 'react';
import './About.css';

const contactInfo = [
  {
    icon: '📍',
    title: '地址',
    content: '海南省（详见部署配置）',
  },
  {
    icon: '📞',
    title: '电话',
    content: '请通过在线留言联系客服',
  },
  {
    icon: '✉️',
    title: '邮箱',
    content: 'contact@example.invalid',
  },
  {
    icon: '⏰',
    title: '工作时间',
    content: '周一至周五 9:00-18:00（节假日除外）',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: '合作咨询',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">联系我们</span>
          <h1 className="page-title">contact</h1>
          <p className="page-subtitle">有任何问题或建议，欢迎与我们联系</p>
        </div>

        <div className="contact-layout">
          {/* 联系信息 */}
          <div className="contact-info">
            <h2 className="section-title">联系方式</h2>
            <div className="info-list">
              {contactInfo.map((info, index) => (
                <div key={index} className="info-item">
                  <span className="info-icon">{info.icon}</span>
                  <div className="info-content">
                    <h4>{info.title}</h4>
                    <p>{info.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-map">
              <div className="map-placeholder">
                <span>📍</span>
                <p>海南省海口市</p>
              </div>
            </div>
          </div>

          {/* 联系表单 */}
          <div className="contact-form-wrapper">
            <h2 className="section-title">在线留言</h2>
            {submitted ? (
              <div className="submit-success">
                <div className="success-icon">✓</div>
                <h3>提交成功</h3>
                <p>感谢您的留言，我们将在1-3个工作日内回复您。</p>
                <button onClick={() => setSubmitted(false)}>继续留言</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>您的姓名</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>联系电话</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="请输入您的手机号"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>电子邮箱</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="请输入您的邮箱地址"
                  />
                </div>
                <div className="form-group">
                  <label>咨询类型</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="合作咨询">合作咨询</option>
                    <option value="产品问题">产品问题</option>
                    <option value="物流配送">物流配送</option>
                    <option value="售后服务">售后服务</option>
                    <option value="投诉建议">投诉建议</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>留言内容</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="请输入您的留言内容..."
                    rows={5}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">提交留言</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
