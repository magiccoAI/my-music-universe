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
    { path: '/music-universe', label: '封面星系' },
    { path: '/music-universe/connections', label: '音乐风格' },
    { path: '/music-universe/search', label: '搜索' },
    { path: '/archive', label: '我的音乐时光机' },
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
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl p-4 ${className}`}>
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <Logo className="w-8 h-8 text-cyan-400" />
          <span className="text-white text-lg font-bold tracking-wider font-sans">Music Collection 🎶</span>
        </Link>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white p-2 text-xl"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      
      {menuOpen && (
        <motion.div 
          className="mt-4 pb-2 flex flex-col space-y-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              path={item.path}
              label={item.label}
              onClick={() => setMenuOpen(false)}
              isMobile={true}
            />
          ))}
        </motion.div>
      )}
    </nav>
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