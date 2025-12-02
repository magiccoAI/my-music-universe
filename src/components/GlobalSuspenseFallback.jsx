import React from 'react';

export const GlobalSuspenseFallback = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[9998] bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800">
      {/* 装饰性背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-150"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        {/* 旋转的核心动画 */}
        <div className="relative w-48 h-48 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-300/30 animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-6 rounded-full border-2 border-purple-400/50 animate-[spin_4s_linear_infinite_reverse]"></div>
          <div className="absolute inset-12 rounded-full border border-cyan-300/70 animate-[spin_2s_linear_infinite]">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
          </div>
          
          <div 
            className="absolute inset-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg opacity-80 animate-pulse"
            style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
          ></div>
        </div>

        {/* 文字区域 */}
        <div className="text-center space-y-4 z-10">
          <h2 className="text-white text-xl font-bold tracking-[0.2em] mb-2 drop-shadow-lg">
            LOADING UNIVERSE
          </h2>
          
          {/* 加载点动画 */}
          <div className="flex justify-center space-x-2 h-4">
             <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
             <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></span>
             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
