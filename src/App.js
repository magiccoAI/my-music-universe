import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoadingScreen from './components/LoadingScreen';

import MusicUniverse from './MusicUniverse';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-music-universe" element={<MusicUniverse />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/archive" element={<ArchivePage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
