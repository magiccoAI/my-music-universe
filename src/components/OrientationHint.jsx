import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { DevicePhoneMobileIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
// import useIsMobile from '../hooks/useIsMobile';
// import { useLocation } from 'react-router-dom';

const OrientationHint = () => {
  // const isMobile = useIsMobile();
  // const location = useLocation();
  // const [isPortrait, setIsPortrait] = useState(false);
  // const [isVisible, setIsVisible] = useState(true);
  // const [isWeChat, setIsWeChat] = useState(false);

  // useEffect(() => {
  //   // 检测是否为微信浏览器
  //   const ua = navigator.userAgent.toLowerCase();
  //   setIsWeChat(ua.includes('micromessenger'));

  //   const checkOrientation = () => {
  //     // 简单判断：高度大于宽度即为竖屏
  //     setIsPortrait(window.innerHeight > window.innerWidth);
  //   };

  //   checkOrientation();
  //   window.addEventListener('resize', checkOrientation);
  //   return () => window.removeEventListener('resize', checkOrientation);
  // }, []);

  // // 只在音乐宇宙相关页面显示
  // const isMusicUniverse = location.pathname.startsWith('/music-universe');

  // // 进入该页面时重置显示状态 (如果之前被自动关闭了，重新进入应该再次提醒)
  // useEffect(() => {
  //   if (isMusicUniverse) {
  //     setIsVisible(true);
  //   }
  // }, [isMusicUniverse]);

  // // 自动隐藏逻辑：8秒后自动消失
  // useEffect(() => {
  //   if (isVisible && isMusicUniverse) {
  //     const timer = setTimeout(() => {
  //       setIsVisible(false);
  //     }, 8000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isVisible, isMusicUniverse]);

  // 如果不是移动端、或者不在音乐宇宙页面、或者不可见，则不渲染
  // User feedback: "I worry that reminding mobile users to browse in landscape mode right from the start might not be the best browsing effect"
  // So we disable this hint for now.
  return null;

  /*
  if (!isMobile || !isMusicUniverse || !isVisible) {
    return null;
  }

  // 如果已经是横屏，则不需要提示
  if (!isPortrait) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-40 left-1/2 -translate-x-1/2 z-[9999] w-auto max-w-[90%] pointer-events-none"
        role="alert"
        aria-live="polite"
      >
        <div className="pointer-events-auto backdrop-blur-md border border-white/20 bg-black/60 text-white rounded-full p-3 pl-4 shadow-2xl flex items-center gap-4 relative overflow-hidden group transition-all duration-300">
          
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative shrink-0 flex items-center justify-center">
             <motion.div
                animate={{ rotate: [0, 90, 90, 0] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  times: [0, 0.3, 0.7, 1],
                  ease: "easeInOut",
                  repeatDelay: 1
                }}
              >
                 <DevicePhoneMobileIcon className="w-6 h-6 text-sky-300" />
              </motion.div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-medium text-sm text-sky-100 whitespace-nowrap">
              建议横屏浏览
            </h4>
            <p className="text-[11px] text-gray-300 leading-tight opacity-90 whitespace-nowrap">
              浏览器打开，转动手机体验更佳
            </p>
          </div>

          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 -mr-1"
            aria-label="关闭提示"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
  */
};

export default OrientationHint;
