import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UniverseProvider } from './UniverseContext';
import MusicUniverse from './MusicUniverse';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import ConnectionsPage from './pages/ConnectionsPage';
import SearchPage from './pages/SearchPage';
// import WordCloudDisplayContainer from './components/WordCloudDisplayContainer';

function App() {
  return (
    <UniverseProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/music-universe" element={<MusicUniverse />} />
          <Route path="/music-universe/connections" element={<ConnectionsPage />} />
          <Route path="/music-universe/search" element={<SearchPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          {/* <Route path="/music-wordcloud" element={<WordCloudDisplayContainer />} /> */}
        </Routes>
      </div>
    </UniverseProvider>
  );
}

export default App;
