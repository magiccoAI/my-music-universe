import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';

const UniverseNavigation = ({ className = '' }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 导航项配置 - 统一管理
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/music-universe', label: '音乐封面宇宙' },
    { path: '/music-universe/connections', label: '音乐风格' },
    { path: '/music-universe/search', label: '搜索' },
    { path: '/archive', label: '我的音乐时光机' },
    { 
      path: '/about', 
      label: (
        <span className="flex items-center opacity-80 hover:opacity-100" title="关于这个宇宙">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </span>
      ) 
    },
  ];

  // 优化响应式检测 - 使用防抖
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // 菜单关闭时恢复滚动
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  // 导航链接组件 - 复用逻辑
  const NavLink = ({ path, label, onClick, isMobile = false }) => {
    const active = isActive(path);
    
    if (isMobile) {
      return (
        <Link
          to={path}
          className={`${active ? 'text-blue-400' : 'text-white'} px-2 py-3 hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 block`}
          onClick={onClick}
        >
          {label}
        </Link>
      );
    }
    
    return (
      <Link
        to={path}
        className={`relative group ${active ? 'text-blue-400' : 'text-white'}`}
      >
        <motion.span
          className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {label}
        </motion.span>
        {active && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
            layoutId="underline"
          />
        )}
      </Link>
    );
  };

  // 移动端导航
  const MobileNavigation = () => (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-filter backdrop-blur-xl p-4 border-b border-white/10 ${className}`}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 no-underline group">
            <Logo className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-white/90 text-lg font-bold tracking-wider font-sans group-hover:text-white transition-colors">Music Universe</span>
          </Link>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/80 p-2 hover:text-white transition-colors focus:outline-none"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* 全屏移动菜单 */}
      {menuOpen && (
        <motion.div 
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col space-y-8 text-center w-full px-8">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      block text-xl font-sans font-medium tracking-wider py-2
                      transition-all duration-300 relative
                      ${active 
                        ? 'text-cyan-400 font-bold scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' 
                        : 'text-gray-300 hover:text-white hover:scale-105'
                      }
                    `}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        layoutId="mobileUnderline"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );

  // 桌面端导航
  const DesktopNavigation = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-20 backdrop-filter backdrop-blur-xl ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              path={item.path}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </nav>
  );

  return isMobile ? <MobileNavigation /> : <DesktopNavigation />;
};

export default UniverseNavigation;