import React, { createContext, useState, useEffect } from 'react';

export const UniverseContext = createContext();

export const UniverseProvider = ({ children }) => {
  const [isConnectionsPageActive, setIsConnectionsPageActive] = useState(false);
  const [musicData, setMusicData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMusicData(data);
      } catch (error) {
        console.error("Error fetching music data in UniverseContext:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <UniverseContext.Provider value={{ 
      isConnectionsPageActive, 
      setIsConnectionsPageActive,
      musicData
    }}>
      {children}
    </UniverseContext.Provider>
  );
};