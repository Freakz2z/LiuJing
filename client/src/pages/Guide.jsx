import './About.css';

const guideSteps = [
  {
    step: '01',
    title: '注册账号',
    desc: '点击首页右上角"登录"，使用手机号或微信快速注册',
    icon: '👤',
  },
  {
    step: '02',
    title: '浏览内容',
    desc: '在内容库浏览纪录片、短剧等精彩内容，发现榴莲背后的故事',
    icon: '🎬',
  },
  {
    step: '03',
    title: '选购商品',
    desc: '进入榴莲商城，选择心仪的榴莲产品，支持基地直发',
    icon: '🛒',
  },
  {
    step: '04',
    title: '完成支付',
    desc: '确认订单信息，选择支付方式完成付款',
    icon: '💳',
  },
  {
    step: '05',
    title: '物流配送',
    desc: '等待新鲜榴莲送达，签收时请检查商品状态',
    icon: '📦',
  },
  {
    step: '06',
    title: '评价分享',
    desc: '收到商品后欢迎评价，您的反馈是我们进步的动力',
    icon: '⭐',
  },
];

const tips = [
  {
    title: '榴莲保存方法',
    content: '未开封的榴莲可放在阴凉通风处保存，夏季一般可存2-3天。已开封的榴莲肉应放入保鲜盒，冷藏可保存3-5天，冷冻可保存1个月以上。',
  },
  {
    title: '如何判断榴莲成熟度',
    content: '成熟的榴莲会发出浓郁香味，果刺按压有弹性，轻微摇动能听到果肉晃动的声音。如需催熟，可与苹果、香蕉一起放入塑料袋中。',
  },
  {
    title: '榴莲食用禁忌',
    content: '榴莲性热，不宜与酒同食；糖尿病患者、肾功能不全者慎食；每天食用不超过200克为宜；吃完榴莲后多喝水有助于消化。',
  },
];

export default function Guide() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">用户指南</span>
          <h1 className="page-title">新手引导</h1>
          <p className="page-subtitle">快速上手，轻松体验</p>
        </div>

        {/* 购物流程 */}
        <section className="about-section">
          <h2 className="section-title">购物流程</h2>
          <div className="guide-steps">
            {guideSteps.map((item, index) => (
              <div key={index} className="guide-step">
                <div className="step-icon">{item.icon}</div>
                <div className="step-num">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                {index < guideSteps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* 购物小贴士 */}
        <section className="about-section">
          <h2 className="section-title">购物小贴士</h2>
          <div className="tips-grid">
            {tips.map((tip, index) => (
              <div key={index} className="tip-card">
                <h3>{tip.title}</h3>
                <p>{tip.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 会员权益 */}
        <section className="about-section">
          <h2 className="section-title">会员权益</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎫</div>
              <h3>专属优惠</h3>
              <p>会员专享折扣，不定期领取优惠券</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎁</div>
              <h3>积分兑换</h3>
              <p>消费获积分，可抵扣现金或兑换礼品</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>优先发货</h3>
              <p>会员订单优先处理，快速发货</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💁</div>
              <h3>专属客服</h3>
              <p>会员专线客服，快速响应您的需求</p>
            </div>
          </div>
        </section>

        {/* 配送说明 */}
        <section className="about-section">
          <h2 className="section-title">配送说明</h2>
          <div className="about-content">
            <p><strong>配送范围：</strong>全国大部分地区均可配送，新疆、西藏、内蒙古等偏远地区暂不支持。</p>
            <p><strong>配送时间：</strong>省内1-2天，省外2-4天（偏远地区5-7天）</p>
            <p><strong>配送费用：</strong>单笔订单满99元免运费，不满99元收取10元运费</p>
            <p><strong>生鲜保冷：</strong>夏季高温期间，我们采用专业冷链配送，确保榴莲新鲜到手</p>
          </div>
        </section>
      </div>
    </div>
  );
}
