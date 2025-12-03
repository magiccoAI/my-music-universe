import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UniverseProvider } from './UniverseContext';
import { LoadingScreen } from './components/LoadingScreen';
import { GlobalSuspenseFallback } from './components/GlobalSuspenseFallback';
import { motion, AnimatePresence } from 'framer-motion';
import './transitions.css';

// Lazy Loading 页面组件
const MusicUniverse = lazy(() => import('./MusicUniverse'));
MusicUniverse.preload = () => import('./MusicUniverse');
const HomePage = lazy(() => import('./pages/HomePage'));
HomePage.preload = () => import('./pages/HomePage');
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
ArchivePage.preload = () => import('./pages/ArchivePage');
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
ConnectionsPage.preload = () => import('./pages/ConnectionsPage');
const SearchPage = lazy(() => import('./pages/SearchPage'));
SearchPage.preload = () => import('./pages/SearchPage');
const AboutPage = lazy(() => import('./pages/AboutPage'));
AboutPage.preload = () => import('./pages/AboutPage');

// 页面切换动画配置
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
  },
  out: { 
    opacity: 0, 
    y: -8, 
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } 
  }
};

function App() {
  const location = useLocation();
  // 添加状态：控制是否处于“首次启动加载”阶段
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // 预加载页面资源，提升后续点击体验
    // 注意：这会增加首屏后的网络消耗，但在音乐/视觉类应用中是值得的
    const preloadComponents = [HomePage, MusicUniverse, ArchivePage, ConnectionsPage, SearchPage, AboutPage];
    preloadComponents.forEach(component => component.preload?.());
  }, []);

  return (
    <UniverseProvider>
      {/* 1. 首次加载屏幕 (Boot Screen) 
          onFinished 回调会在动画结束后触发，将 isInitialLoading 设为 false
      */}
      {isInitialLoading && (
        <LoadingScreen onFinished={() => setIsInitialLoading(false)} />
      )}

      {/* 全局渐变背景层 */}
      <div className="global-background"></div>
      
      {/* 2. 主应用内容
          使用 opacity 控制显隐，确保加载动画结束时内容已经准备好了，实现无缝过渡 
      */}
      <div className={`App transition-opacity duration-1000 ${isInitialLoading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* 使用深色 Loading 占位符防止页面切换白屏 */}
        <Suspense fallback={<GlobalSuspenseFallback />}> 
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              className="page-content"
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/music-universe" element={<MusicUniverse />} />
                <Route path="/music-universe/connections" element={<ConnectionsPage />} />
                <Route path="/music-universe/search" element={<SearchPage />} />
                <Route path="/archive" element={<ArchivePage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </UniverseProvider>
  );
}

export default App;