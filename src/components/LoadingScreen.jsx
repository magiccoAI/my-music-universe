import React from 'react';

const LoadingScreen = () => {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center  
        bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800  
        z-50 transition-opacity duration-1000 opacity-100"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-300/30 animate-spin-slow"></div>
          <div className="absolute inset-6 rounded-full border-2 border-purple-400/50 animate-spin-slower reverse-spin"></div>
          <div className="absolute inset-12 rounded-full border-1 border-cyan-300/70 animate-spin-normal">  
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>
          </div>
          <div  
            className="absolute inset-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg"
            style={{transform: 'scale(1)', transition: 'transform 1.5s ease-in-out', boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)'}}
          ></div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-white text-2xl font-bold tracking-widest mb-2 cosmic-text">
            CREATING YOUR MUSIC UNIVERSE
          </h2>
          
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 rounded-full transition-all duration-300 bg-cyan-400 scale-125"></div>
            <div className="w-2 h-2 rounded-full transition-all duration-300 bg-purple-400 scale-100"></div>
            <div className="w-2 h-2 rounded-full transition-all duration-300 bg-purple-400 scale-100"></div>
          </div>

          <p className="text-cyan-200 text-sm font-light mt-4 min-h-[20px] tip-transition">
            正在调取银河系音乐数据...
          </p>
          
          {/* 进度条已删除 */}
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-gray-400 text-xs font-light">
          请耐心等待，正在为您构建独特的音乐宇宙...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;