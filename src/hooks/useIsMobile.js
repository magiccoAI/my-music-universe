import { useState, useEffect, useCallback } from 'react';

const useIsMobile = (breakpoint = 768) => {
  // 初始化时直接检查，避免 SSR 不匹配（虽然这里是 CSR）
  const checkMobile = useCallback(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    // 更加全面的移动端 UA 正则匹配
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    // 屏幕宽度检查作为辅助
    const isSmallScreen = window.innerWidth <= breakpoint;
    
    // 只要满足 UA 是移动端，或者屏幕宽度小于阈值，都视为移动模式
    // 这样能确保手机横屏（宽度可能大于 768）时依然保持移动端模式（低配渲染）
    return mobileRegex.test(userAgent) || isSmallScreen;
  }, [breakpoint]);

  const [isMobile, setIsMobile] = useState(checkMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    // 同时也监听方向变化，以防万一
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [checkMobile]);

  return isMobile;
};

export default useIsMobile;