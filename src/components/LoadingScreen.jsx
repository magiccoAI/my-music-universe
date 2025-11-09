import React, { useEffect } from 'react';

const LoadingScreen = () => {
  useEffect(() => {
    const initialLoadingScreen = document.getElementById('initial-loading-screen');
    if (initialLoadingScreen) {
      initialLoadingScreen.style.display = 'none';
    }
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 z-50">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-300/30 animate-spin-slow"></div>
          <div className="absolute inset-4 rounded-full border-2 border-purple-400/50 animate-spin-slower reverse-spin"></div>
          <div className="absolute inset-8 rounded-full border-1 border-cyan-300/70 animate-spin-normal">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>
          </div>
        </div>
        <p className="text-cyan-200 text-sm">加载中...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;