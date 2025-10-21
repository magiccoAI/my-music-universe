import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const UniverseNavigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
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
};

export default UniverseNavigation;