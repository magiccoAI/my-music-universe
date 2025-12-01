import React, { createContext, useState, useEffect } from 'react';

export const UniverseContext = createContext();

export const UniverseProvider = ({ children }) => {
  const [isConnectionsPageActive, setIsConnectionsPageActive] = useState(false);
  
  // Persist Music Universe state
  const [universeState, setUniverseState] = useState({
    positionedMusicData: null, // Stores the music data with 3D positions
    currentTheme: 'night',
    isLoaded: false
  });

  // Global music data cache to avoid refetching across pages
  const [globalMusicCache, setGlobalMusicCache] = useState(null);

  return (
    <UniverseContext.Provider value={{ 
      isConnectionsPageActive, 
      setIsConnectionsPageActive,
      universeState,
      setUniverseState,
      globalMusicCache,
      setGlobalMusicCache
    }}>
      {children}
    </UniverseContext.Provider>
  );
};