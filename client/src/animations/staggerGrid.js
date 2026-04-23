import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useStaggerGrid - 为网格元素添加依次进场的动画
 * @param {object} opts
 * @param {string|Element} opts.container - 网格容器选择器或 Ref
 * @param {string} opts.selector - 子元素选择器，默认 '.stagger-item'
 * @param {object} opts.from - 起始状态，默认 { opacity: 0, y: 40 }
 * @param {number} opts.stagger - 每个元素间隔（秒），默认 0.08
 * @param {string} opts.start - ScrollTrigger start，默认 top 85%
 */
export function useStaggerGrid({
  container,
  selector = '.stagger-item',
  from = { opacity: 0, y: 40 },
  stagger = 0.08,
  start = 'top 85%',
} = {}) {
  const ref = useRef(null);
  const resolvedContainer = container || ref;

  useEffect(() => {
    const el = typeof resolvedContainer === 'string'
      ? document.querySelector(resolvedContainer)
      : resolvedContainer?.current;

    if (!el) return;

    const items = el.querySelectorAll(selector);
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, ...from },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      }
    );
  }, []);

  return resolvedContainer;
}
