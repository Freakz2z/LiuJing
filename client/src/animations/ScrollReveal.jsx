import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollReveal - 元素进入视口时的动画封装
 * @param {object} props
 * @param {string} props.children - 子元素
 * @param {object} props.animation - GSAP 动画配置，默认 { opacity: 0, y: 30 } → { opacity: 1, y: 0 }
 * @param {string} props.className - 额外的 className
 * @param {string} props.triggerOnce - 触发一次后不再触发，默认 true
 * @param {string} props.start - ScrollTrigger start，默认 top 85%
 * @param {number} props.delay - 延迟（秒），默认 0
 */
export default function ScrollReveal({
  children,
  animation = { opacity: 0, y: 30 },
  className = '',
  triggerOnce = true,
  start = 'top 85%',
  delay = 0,
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, ...animation },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start,
          once: triggerOnce,
        },
      }
    );
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}
