import './About.css';

const charityProjects = [
  {
    title: '榴链乡村·教育扶持计划',
    desc: '为偏远地区榴莲种植户的子女提供教育资助，帮助他们获得更好的学习资源。',
    raised: 128500,
    goal: 200000,
    donors: 1268,
  },
  {
    title: '技术下乡·智慧农业培训',
    desc: '组织农业技术专家下乡，为农户提供榴莲种植技术培训和现场指导。',
    raised: 85600,
    goal: 100000,
    donors: 892,
  },
  {
    title: '温暖过冬·困难农户慰问',
    desc: '冬季为困难农户送去生活物资和保暖设备，传递社会温暖。',
    raised: 45200,
    goal: 60000,
    donors: 567,
  },
];

const charityRecords = [
  { date: '2024.06.01', event: '六一儿童节，为三亚偏远地区20名学子发放助学金' },
  { date: '2024.08.15', event: '中科院专家赴乐东基地开展榴莲种植技术培训' },
  { date: '2024.10.20', event: '重阳节慰问保亭县30户困难农户' },
  { date: '2024.12.25', event: '冬季送温暖活动，发放棉被、粮油等物资' },
  { date: '2025.01.15', event: '春节前为5所乡村小学捐赠图书和学习用品' },
  { date: '2025.03.10', event: '邀请省农科院专家开展春季榴莲管护培训' },
];

export default function Charity() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">公益进展</span>
          <h1 className="page-title">榴链乡村公益计划</h1>
          <p className="page-subtitle">每一步前行，都为乡村发展贡献一份力量</p>
        </div>

        {/* 公益理念 */}
        <section className="about-section">
          <h2 className="section-title">公益理念</h2>
          <div className="about-content">
            <p>
              "榴链乡村"公益计划是我们平台发起的公益项目，旨在通过内容传播和电商赋能，帮助海南榴莲产区的农户增收致富，同时开展教育扶持、技术下乡、困难慰问等公益活动。
            </p>
            <p>
              我们承诺：平台每售出一件商品，将捐出1%用于公益事业。您在购买榴莲产品时的每一笔消费，都在为乡村发展贡献一份力量。
            </p>
          </div>
        </section>

        {/* 公益项目 */}
        <section className="about-section">
          <h2 className="section-title">进行中的项目</h2>
          <div className="charity-projects">
            {charityProjects.map((project, index) => {
              const percent = Math.round((project.raised / project.goal) * 100);
              return (
                <div key={index} className="charity-card">
                  <h3>{project.title}</h3>
                  <p className="charity-desc">{project.desc}</p>
                  <div className="charity-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="progress-info">
                      <span>已筹 ¥{project.raised.toLocaleString()}</span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                  <div className="charity-meta">
                    <span>目标 ¥{project.goal.toLocaleString()}</span>
                    <span>{project.donors} 人参与</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 公益足迹 */}
        <section className="about-section">
          <h2 className="section-title">公益足迹</h2>
          <div className="timeline">
            {charityRecords.map((record, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-year">{record.date}</div>
                <div className="timeline-dot"></div>
                <div className="timeline-content">{record.event}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 参与方式 */}
        <section className="about-section">
          <h2 className="section-title">参与方式</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🛒</div>
              <h3>消费捐赠</h3>
              <p>每笔消费自动捐赠1%，您无需额外操作</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>志愿者报名</h3>
              <p>加入我们的志愿者团队，参与线下公益活动</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📢</div>
              <h3>内容传播</h3>
              <p>转发分享公益内容，让更多人了解乡村故事</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>建议反馈</h3>
              <p>提出您的公益建议，帮助我们做得更好</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
