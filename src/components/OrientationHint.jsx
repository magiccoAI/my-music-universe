import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useIsMobile from '../hooks/useIsMobile';

const OrientationHint = () => {
  const isMobile = useIsMobile();
  const [isPortrait, setIsPortrait] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      // 简单判断：高度大于宽度即为竖屏
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // 如果不是移动端、不是竖屏、或者用户已经手动关闭了，就不显示
  if (!isMobile || !isPortrait || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl p-4 shadow-2xl flex items-center gap-4 relative overflow-hidden group">
          
          {/* 动态背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* 旋转手机动画图标 */}
          <div className="relative shrink-0 w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
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
                <DevicePhoneMobileIcon className="w-7 h-7 text-indigo-300" />
             </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-indigo-100">建议横屏浏览</h4>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              转动手机，探索更广阔、清晰的音乐宇宙视觉。
            </p>
          </div>

          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
            aria-label="关闭提示"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrientationHint;
