import React, { useState, useEffect } from "react";

import "./CosmicLoader.css";

const CosmicLoader = ({ loading = true, message = "CREATING YOUR MUSIC UNIVERSE" }) => {
  const [currentDot, setCurrentDot] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  // 动态点动画
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDot(prev => (prev + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 脉冲动画
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.1 : 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // 随机提示语
  const randomTips = [
    "正在调取银河系音乐数据...",
    "连接星际音乐网络...",
    "生成三维音乐空间...",
    "加载专辑封面能量...",
    "校准宇宙声波频率...",
    "初始化星空坐标..."
  ];
  
  const [currentTip, setCurrentTip] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % randomTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center
        bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800
        z-50 transition-opacity duration-1000
        ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* 增强的星空背景 */}
      <div className="absolute inset-0">
        <StarBackground />
        {/* 添加一些移动的光点 */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* 主要加载容器 */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* 外层轨道系统 */}
        <div className="relative w-48 h-48 mb-8">
          {/* 外轨道 - 缓慢旋转 */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-300/30 animate-spin-slow"></div>
          
          {/* 中轨道 - 反向旋转 */}
          <div className="absolute inset-6 rounded-full border-2 border-purple-400/50 animate-spin-slower reverse-spin"></div>
          
          {/* 内轨道 - 行星点 */}
          <div className="absolute inset-12 rounded-full border-1 border-cyan-300/70 animate-spin-normal">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>
          </div>

          {/* 中心脉冲球体 */}
          <div 
            className="absolute inset-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg"
            style={{
              transform: `scale(${pulseScale})`,
              transition: 'transform 1.5s ease-in-out',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)'
            }}
          ></div>
        </div>

        {/* 加载文字和动画 */}
        <div className="text-center space-y-4">
          {/* 主标题 */}
          <h2 className="text-white text-2xl font-bold tracking-widest mb-2 cosmic-text">
            {message}
          </h2>
          
          {/* 动态点 */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentDot 
                    ? "bg-cyan-400 scale-125" 
                    : "bg-purple-400 scale-100"
                }`}
              ></div>
            ))}
          </div>

          {/* 随机提示语 */}
          <p className="text-cyan-200 text-sm font-light mt-4 min-h-[20px] tip-transition">
            {randomTips[currentTip]}
          </p>

          {/* 进度条 */}
          <div className="w-64 h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full loading-progress"
              style={{
                width: `${(currentTip + 1) * (100 / randomTips.length)}%`,
                transition: 'width 1s ease-in-out'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 底部装饰元素 */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-400 text-xs font-light">
          请耐心等待，正在为您构建独特的音乐宇宙...
        </p>
      </div>
    </div>
  );
};

export default CosmicLoader;