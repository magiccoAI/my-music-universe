import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2 animate-pulse">
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <div className="w-2 h-2 bg-white rounded-full"></div>
      <span className="sr-only">加载中...</span>
    </div>
  );
};

export default LoadingSpinner;