import './About.css';

const teamMembers = [
  {
    name: '张明',
    role: '项目发起人',
    desc: '海南本地创业者，深耕农业电商领域多年，致力于推动海南特色农产品走向全国市场。',
  },
  {
    name: '李婷',
    role: '内容负责人',
    desc: '资深媒体人，专注三农内容创作，希望通过镜头记录乡村故事，传递助农正能量。',
  },
  {
    name: '王强',
    role: '技术负责人',
    desc: '全栈工程师，热爱技术公益，希望用互联网技术赋能乡村产业发展。',
  },
  {
    name: '陈芳',
    role: '运营负责人',
    desc: '新媒体运营专家，擅长品牌营销与用户增长，专注于农产品上行赛道。',
  },
];

const milestones = [
  { year: '2023.06', event: '项目启动，开始前期调研' },
  { year: '2023.09', event: '完成首部榴莲产业纪录片' },
  { year: '2023.12', event: '平台正式上线，累计用户破万' },
  { year: '2024.03', event: '与三亚、乐东等地建立合作基地' },
  { year: '2024.06', event: '发起"榴链乡村"公益计划' },
  { year: '2024.09', event: '平台累计播放量突破500万' },
  { year: '2024.12', event: '获得海南省农业科技创新支持' },
  { year: '2026.04', event: '平台全新改版升级' },
];

export default function About() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">关于我们</span>
          <h1 className="page-title">榴镜自贸·乡链视界</h1>
          <p className="page-subtitle">聚焦海南自贸港榴莲全产业链数字化赋能，打造"内容—品牌—平台—文旅"服务体系</p>
        </div>

        {/* 项目介绍 */}
        <section className="about-section">
          <h2 className="section-title">项目介绍</h2>
          <div className="about-content">
            <p>
              破解本土榴莲品牌薄弱痛点，推动热带水果产业品牌化、溯源化、国际化发展，兼顾商业与社会价值，助力乡村振兴。
            </p>
          </div>
        </section>

        {/* 核心价值 */}
        <section className="about-section">
          <h2 className="section-title">核心价值</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎬</div>
              <h3>内容赋能</h3>
              <p>用镜头记录产业故事，用内容传递乡村声音</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>产业振兴</h3>
              <p>助力海南榴莲品牌建设，推动产业升级发展</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💚</div>
              <h3>公益助农</h3>
              <p>每笔消费都为乡村发展贡献一份力量</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>合作共赢</h3>
              <p>与农户、基地、企业建立长期稳定合作关系</p>
            </div>
          </div>
        </section>

        {/* 团队成员 */}
        <section className="about-section">
          <h2 className="section-title">核心团队</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  {member.name.charAt(0)}
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 发展历程 */}
        <section className="about-section">
          <h2 className="section-title">发展历程</h2>
          <div className="timeline">
            {milestones.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-dot"></div>
                <div className="timeline-content">{item.event}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 合作基地 */}
        <section className="about-section">
          <h2 className="section-title">合作基地</h2>
          <div className="bases-list">
            <div className="base-item">
              <h3>三亚福返榴莲基地</h3>
              <p>位于三亚市吉阳区，专注有机榴莲种植</p>
            </div>
            <div className="base-item">
              <h3>乐东万冲榴莲庄园</h3>
              <p>乐东黎族苗族自治县，农旅融合示范点</p>
            </div>
            <div className="base-item">
              <h3>保亭呀诺达榴莲谷</h3>
              <p>保亭县，生态榴莲种植与研学基地</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
