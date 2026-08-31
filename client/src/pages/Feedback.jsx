import { useState } from 'react';
import './About.css';

const feedbackTypes = [
  { value: '功能建议', label: '功能建议', icon: '💡' },
  { value: '问题反馈', label: '问题反馈', icon: '🐛' },
  { value: '内容投诉', label: '内容投诉', icon: '📢' },
  { value: '合作洽谈', label: '合作洽谈', icon: '🤝' },
  { value: '其他', label: '其他', icon: '📝' },
];

export default function Feedback() {
  const [formData, setFormData] = useState({
    type: '功能建议',
    content: '',
    contact: '',
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
          <span className="section-label">意见反馈</span>
          <h1 className="page-title">Feedback</h1>
          <p className="page-subtitle">您的每一条反馈，都是我们进步的动力</p>
        </div>

        <div className="feedback-content">
          <div className="feedback-intro">
            <h2>我们重视每一位用户的声音</h2>
            <p>
              无论是产品建议、功能需求，还是使用过程中遇到的问题，您都可以通过以下方式反馈给我们。我们会认真对待每一条反馈，不断优化产品体验。
            </p>
          </div>

          <div className="feedback-types">
            {feedbackTypes.map((type) => (
              <div
                key={type.value}
                className={`feedback-type-item ${formData.type === type.value ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, type: type.value })}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="submit-success">
              <div className="success-icon">✓</div>
              <h3>反馈已提交</h3>
              <p>感谢您对平台的支持，我们会认真评估您的反馈并尽快处理。</p>
              <button onClick={() => setSubmitted(false)}>继续反馈</button>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>反馈类型</label>
                <div className="type-tags">
                  {feedbackTypes.map((type) => (
                    <span
                      key={type.value}
                      className={`type-tag ${formData.type === type.value ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                    >
                      {type.icon} {type.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>反馈内容</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="请详细描述您的问题或建议..."
                  rows={6}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>联系方式（选填）</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="手机号或邮箱，方便我们回复您"
                />
                <span className="form-hint">提供联系方式后，我们会在3个工作日内回复您</span>
              </div>

              <button type="submit" className="submit-btn">提交反馈</button>
            </form>
          )}

          <div className="feedback-other">
            <h3>其他反馈渠道</h3>
            <div className="other-channels">
              <div className="channel-item">
                <span className="channel-icon">📞</span>
                <div>
                  <h4>客服热线</h4>
                  <p>请通过在线留言联系客服（工作日 9:00-18:00）</p>
                </div>
              </div>
              <div className="channel-item">
                <span className="channel-icon">✉️</span>
                <div>
                  <h4>邮箱地址</h4>
                  <p>请通过在线留言联系客服</p>
                </div>
              </div>
              <div className="channel-item">
                <span className="channel-icon">💬</span>
                <div>
                  <h4>微信公众号</h4>
                  <p>搜索"榴镜自贸"关注留言</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
