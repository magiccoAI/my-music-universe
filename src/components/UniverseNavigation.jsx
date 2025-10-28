import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const UniverseNavigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端导航
  const MobileNavigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-white text-lg font-bold">音乐宇宙</span>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white p-2"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      
      {menuOpen && (
        <div className="mt-4 pb-2 flex flex-col space-y-4">
          <Link
            to="/"
            className={`${isActive('/') ? 'text-blue-400' : 'text-white'} px-2 py-3`}
            onClick={() => setMenuOpen(false)}
          >
            首页
          </Link>
          <Link
            to="/music-universe"
            className={`${isActive('/music-universe') ? 'text-blue-400' : 'text-white'} px-2 py-3`}
            onClick={() => setMenuOpen(false)}
          >
            音乐封面宇宙
          </Link>
          <Link
            to="/music-universe/connections"
            className={`${isActive('/music-universe/connections') ? 'text-blue-400' : 'text-white'} px-2 py-3`}
            onClick={() => setMenuOpen(false)}
          >
            音乐风格
          </Link>
          <Link
            to="/music-universe/search"
            className={`${isActive('/music-universe/search') ? 'text-blue-400' : 'text-white'} px-2 py-3`}
            onClick={() => setMenuOpen(false)}
          >
            搜索
          </Link>
          <Link
            to="/archive"
            className={`${isActive('/archive') ? 'text-blue-400' : 'text-white'} px-2 py-3`}
            onClick={() => setMenuOpen(false)}
          >
            我的音乐时光机
          </Link>
        </div>
      )}
    </nav>
  );

  // 桌面端导航
  const DesktopNavigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-20 backdrop-filter backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 space-x-8">
          <Link
            to="/"
            className={`relative group ${isActive('/') ? 'text-blue-400' : 'text-white'}`}
          >
            <motion.span
              className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              首页
            </motion.span>
            {isActive('/') && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                layoutId="underline"
              />
            )}
          </Link>

          <Link
            to="/music-universe"
            className={`relative group ${isActive('/music-universe') ? 'text-blue-400' : 'text-white'}`}
          >
            <motion.span
              className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              音乐封面宇宙
            </motion.span>
            {isActive('/music-universe') && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                layoutId="underline"
              />
            )}
          </Link>

          <Link
            to="/music-universe/connections"
            className={`relative group ${isActive('/music-universe/connections') ? 'text-blue-400' : 'text-white'}`}
          >
            <motion.span
              className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              音乐风格
            </motion.span>
            {isActive('/music-universe/connections') && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                layoutId="underline"
              />
            )}
          </Link>

          <Link
            to="/music-universe/search"
            className={`relative group ${isActive('/music-universe/search') ? 'text-blue-400' : 'text-white'}`}
          >
            <motion.span
              className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              搜索
            </motion.span>
            {isActive('/music-universe/search') && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                layoutId="underline"
              />
            )}
          </Link>

          <Link
            to="/archive"
            className={`relative group ${isActive('/archive') ? 'text-blue-400' : 'text-white'}`}
          >
            <motion.span
              className="text-lg font-semibold transition-colors duration-300 group-hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              我的音乐时光机
            </motion.span>
            {isActive('/archive') && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                layoutId="underline"
              />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );

  return isMobile ? <MobileNavigation /> : <DesktopNavigation />;
};

export default UniverseNavigation;