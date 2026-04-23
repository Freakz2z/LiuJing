import { useState } from 'react';
import './About.css';

const faqData = [
  {
    category: '关于平台',
    questions: [
      {
        q: '榴镜自贸·乡链视界是什么平台？',
        a: '我们是专注于海南自贸港榴莲产业的内容平台，通过纪录片、短剧等内容形式展现榴莲产业链，同时提供榴莲产品购买服务。每笔消费都将部分用于公益助农事业。',
      },
      {
        q: '平台上的榴莲产品是正品吗？',
        a: '是的，我们与海南本地正规榴莲种植基地合作，所有产品均来自源头直采，经过严格品控筛选，确保品质正宗。',
      },
      {
        q: '如何成为注册用户？',
        a: '您可以通过手机号注册账号，也可以使用微信直接登录。注册后可以享受更多会员权益。',
      },
    ],
  },
  {
    category: '购物相关',
    questions: [
      {
        q: '榴莲的发货时间是多长？',
        a: '我们承诺在订单支付成功后24小时内发货。由于榴莲是生鲜产品，具体配送时间根据地区而定，一般省内1-2天，省外2-4天。',
      },
      {
        q: '收到的榴莲有问题怎么办？',
        a: '如收到商品有质量问题，请在签收后24小时内联系客服处理，提供照片凭证。我们将为您提供退换货服务。',
      },
      {
        q: '支持哪些支付方式？',
        a: '目前支持微信支付、支付宝支付。',
      },
      {
        q: '如何查看订单物流信息？',
        a: '登录后进入"我的订单"页面，点击对应订单即可查看物流信息。',
      },
    ],
  },
  {
    category: '会员与积分',
    questions: [
      {
        q: '什么是会员积分？',
        a: '每笔消费都可获得积分，积分可在下次购物时抵扣部分金额。1积分=1分钱。',
      },
      {
        q: '如何升级会员等级？',
        a: '累计消费金额达到一定额度即可升级会员等级。会员等级越高，享受的折扣和权益越大。',
      },
    ],
  },
  {
    category: '公益与助农',
    questions: [
      {
        q: '每笔消费会有多少用于公益？',
        a: '平台每笔订单捐出1%用于"榴链乡村"公益计划，您可以在公益进展页面查看资金使用情况。',
      },
      {
        q: '如何参与志愿者活动？',
        a: '您可以联系我们报名参加线下公益活动，也可以关注我们的社交媒体获取活动信息。',
      },
    ],
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">常见问题</span>
          <h1 className="page-title">FAQ</h1>
          <p className="page-subtitle">遇到问题？这里可能有答案</p>
        </div>

        <div className="faq-list">
          {faqData.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2 className="faq-category-title">{category.category}</h2>
              <div className="faq-items">
                {category.questions.map((item, qIndex) => {
                  const globalIndex = `${catIndex}-${qIndex}`;
                  return (
                    <div
                      key={qIndex}
                      className={`faq-item ${openIndex === globalIndex ? 'open' : ''}`}
                    >
                      <div className="faq-question" onClick={() => toggleQuestion(globalIndex)}>
                        <span>{item.q}</span>
                        <span className="faq-icon">{openIndex === globalIndex ? '−' : '+'}</span>
                      </div>
                      <div className="faq-answer">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>没有找到答案？</h3>
          <p>请联系我们的客服团队，我们会尽快为您解答</p>
          <a href="/contact" className="contact-btn">联系我们</a>
        </div>
      </div>
    </div>
  );
}
