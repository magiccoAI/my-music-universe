import React, { createContext, useState, useEffect } from 'react';

export const UniverseContext = createContext();

export const UniverseProvider = ({ children }) => {
  const [isConnectionsPageActive, setIsConnectionsPageActive] = useState(false);
  

  return (
    <UniverseContext.Provider value={{ 
      isConnectionsPageActive, 
      setIsConnectionsPageActive,
      
    }}>
      {children}
    </UniverseContext.Provider>
  );
};