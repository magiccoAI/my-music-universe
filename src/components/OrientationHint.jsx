import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DevicePhoneMobileIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useIsMobile from '../hooks/useIsMobile';
import { useLocation } from 'react-router-dom';

const OrientationHint = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isPortrait, setIsPortrait] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isWeChat, setIsWeChat] = useState(false);

  useEffect(() => {
    // 检测是否为微信浏览器
    const ua = navigator.userAgent.toLowerCase();
    setIsWeChat(ua.includes('micromessenger'));

    const checkOrientation = () => {
      // 简单判断：高度大于宽度即为竖屏
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // 只在音乐宇宙相关页面显示
  const isMusicUniverse = location.pathname.startsWith('/music-universe');

  // 进入该页面时重置显示状态 (如果之前被自动关闭了，重新进入应该再次提醒)
  useEffect(() => {
    if (isMusicUniverse) {
      setIsVisible(true);
    }
  }, [isMusicUniverse]);

  // 自动隐藏逻辑：8秒后自动消失
  useEffect(() => {
    if (isVisible && isMusicUniverse) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMusicUniverse]);

  // 如果不是移动端、或者不在音乐宇宙页面、或者不可见，则不渲染
  if (!isMobile || !isMusicUniverse || !isVisible) {
    return null;
  }

  // 如果已经是横屏，且不是微信浏览器（微信浏览器通常强制竖屏，所以需要一直提示直到去外部浏览器），则不需要提示
  if (!isPortrait && !isWeChat) {
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
        <div className={`backdrop-blur-md border rounded-xl p-4 shadow-2xl flex items-center gap-4 relative overflow-hidden group transition-colors duration-300 ${
          isWeChat 
            ? 'bg-orange-900/40 border-orange-500/30 text-orange-50' 
            : 'bg-white/10 border-white/20 text-white'
        }`}>
          
          {/* 动态背景光效 */}
          <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isWeChat ? 'from-orange-500/20 to-red-500/20' : 'from-indigo-500/20 to-purple-500/20'
          }`} />

          {/* 图标区 */}
          <div className="relative shrink-0 w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
             {isWeChat ? (
                <ExclamationTriangleIcon className="w-7 h-7 text-orange-300" />
             ) : (
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
             )}
          </div>

          {/* 文本内容 */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm ${isWeChat ? 'text-orange-200' : 'text-indigo-100'}`}>
              {isWeChat ? '微信暂不支持横屏浏览' : '建议横屏浏览'}
            </h4>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              {isWeChat 
                ? '请点击右上角 "..." 选择 "在浏览器打开" 以获得最佳体验。' 
                : '转动手机，探索更广阔、清晰的音乐宇宙视觉。'}
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
