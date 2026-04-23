import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';

/**
 * usePageTransition - 路由切换时给页面内容加淡入动画
 * 用法：在每个页面组件里调用 const animate = usePageTransition()
 * 然后用 <div ref={animate.ref}> 包裹页面内容
 */
export function usePageTransition() {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!ref.current) return;

    // 页面切换时先快速淡出再淡入
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return ref;
}

/**
 * initPageTransitions - 全局页面过渡初始化（给 Layout 用）
 * 给 .page-content 添加统一的入场动画
 */
export function initPageTransitions() {
  // 监听路由变化给 body 下的直接子元素加动画
  document.querySelectorAll('.page-content').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  });
}
