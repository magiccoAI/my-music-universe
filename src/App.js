import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UniverseProvider } from './UniverseContext';
// import MusicUniverse from './MusicUniverse';
// import HomePage from './pages/HomePage';
// import ArchivePage from './pages/ArchivePage';
// import ConnectionsPage from './pages/ConnectionsPage';
// import SearchPage from './pages/SearchPage';

const MusicUniverse = lazy(() => import('./MusicUniverse'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const ConnectionsPage = lazy(() => import('./pages/ConnectionsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

function App() {
  return (
    <UniverseProvider>
      <div className="App">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/music-universe" element={<MusicUniverse />} />
            <Route path="/music-universe/connections" element={<ConnectionsPage />} />
            <Route path="/music-universe/search" element={<SearchPage />} />
            <Route path="/archive" element={<ArchivePage />} />
          </Routes>
        </Suspense>
      </div>
    </UniverseProvider>
  );
}

export default App;
