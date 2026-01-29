import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UniverseProvider } from './UniverseContext';
import { LoadingScreen } from './components/LoadingScreen';
import { GlobalSuspenseFallback } from './components/GlobalSuspenseFallback';
import OrientationHint from './components/OrientationHint';
import { motion, AnimatePresence } from 'framer-motion';
import UniverseNavigation from './components/UniverseNavigation'; // 导入导航组件
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
    // Set default language for Lighthouse and accessibility
    document.documentElement.lang = 'zh-CN';

    // 更加智能的预加载策略：优先预加载最可能的下一个页面
    const timer = setTimeout(() => {
      // 只有 MusicUniverse 是最高优先级的，它是“封面墙”
      MusicUniverse.preload?.();
      
      // 其他页面在更晚的时间点预加载，或者不预加载以节省资源
      const secondaryTimer = setTimeout(() => {
        ArchivePage.preload?.();
        AboutPage.preload?.();
      }, 2000);

      return () => clearTimeout(secondaryTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <UniverseProvider>
      {/* 1. 首次加载屏幕 (Boot Screen) */}
      {isInitialLoading && (
        <LoadingScreen onFinished={() => setIsInitialLoading(false)} />
      )}

      {/* 全局渐变背景层 */}
      <div className="global-background"></div>
      
      {/* 移动端横屏提示 */}
      <OrientationHint />
      
      {/* 2. 主应用内容 */}
      <div className={`App transition-all duration-700 ease-out ${isInitialLoading ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 blur-0'}`}>
        
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

      {/* 导航组件放在 App 容器外，且在 DOM 顺序最后，确保 z-index 生效且不被 transform 影响 */}
      <UniverseNavigation />
    </UniverseProvider>
  );
}

export default App;
