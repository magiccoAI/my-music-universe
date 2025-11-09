import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UniverseProvider } from './UniverseContext';
import LoadingScreen from './components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import './transitions.css';

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

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8, // 轻微的下移，更自然
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1], // 优雅的缓动函数
    }
  },
  out: {
    opacity: 0,
    y: -8, // 轻微的上移
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

function App() {
  const location = useLocation();

  useEffect(() => {
    // 预加载页面 
    [HomePage, MusicUniverse, ArchivePage, ConnectionsPage, SearchPage].forEach(
      component => component.preload?.()
    );
    // Trigger a new deployment after workflow fix
    

