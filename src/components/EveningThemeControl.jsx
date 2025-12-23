import React, { useState, useEffect, useRef } from 'react';

// 预设方案定义
export const EVENING_PRESETS = {
  sunset: {
    id: 'sunset',
    name: '落日余晖',
    description: '经典的橙红暖调，适合傍晚6点左右',
    cssGradient: `linear-gradient(to bottom,
      #1e1b4b 0%,   /* Indigo 950 */
      #1e3a8a 15%,  /* Blue 900 */
      #3b82f6 30%,  /* Blue 500 */
      #fef3c7 40%,
      #fde68a 45%,
      #fb923c 50%,
      #dc2626 55%,
      #fb923c 60%,
      #fde68a 65%,
      #fef3c7 70%,
      #3b82f6 85%,
      #1e3a8a 95%,
      #1e1b4b 100%
    )`,
    textColor: 'text-orange-100',
    accentColor: 'text-orange-400',
    // 3D 场景参数
    fogColor: '#2e1065',
    ambientIntensity: 0.6,
    dirLightColor: '#fb923c',
    dirLightIntensity: 2.0,
    spotLightColor: '#ff7e5f',
    spotLightIntensity: 8,
    sparkleColor: '#ffccaa'
  },
  lateSunset: {
    id: 'lateSunset',
    name: '紫霞晚照',
    description: '柔和的紫调晚霞，色彩层次自然过渡',
    cssGradient: `linear-gradient(to bottom,
      #0f172a 0%,   /* Slate 900 - 深邃夜空基底 */
      #2e1065 15%,  /* Violet 950 - 深紫 */
      #581c87 30%,  /* Purple 900 - 醇紫 */
      #86198f 42%,  /* Fuchsia 900 - 这里的过渡更平滑 */
      #a21caf 48%,  /* Fuchsia 700 - 柔和紫红 */
      #ea580c 50%,  /* Orange 600 - 暖橙色地平线 (降低了饱和度与亮度) */
      #a21caf 52%,  /* Fuchsia 700 */
      #86198f 58%,  /* Fuchsia 900 */
      #581c87 70%,  /* Purple 900 */
      #2e1065 85%,  /* Violet 950 */
      #0f172a 100%
    )`,
    textColor: 'text-pink-100',
    accentColor: 'text-pink-400',
    // 3D 场景参数
    fogColor: '#1e1b4b', // 稍微偏蓝一点的雾气，更通透
    ambientIntensity: 0.45, // 略微降低环境光，增加对比度
    dirLightColor: '#ea580c', // 对应地平线的暖橙色
    dirLightIntensity: 1.5, // 降低主光强度，避免过曝
    spotLightColor: '#c026d3', // 稍微柔和的紫光斑
    spotLightIntensity: 5, // 降低光斑强度
    sparkleColor: '#f5d0fe' // 极浅的粉紫
  },
  twilight: {
    id: 'twilight',
    name: '蓝调时刻',
    description: '静谧的蓝紫过渡，适合日落后',
    cssGradient: `linear-gradient(to bottom,
      #0f172a 0%,   /* Slate 900 */
      #1e1b4b 20%,  /* Indigo 950 */
      #4c1d95 40%,  /* Violet 900 */
      #a78bfa 48%,  /* Violet 400 */
      #e879f9 50%,  /* Fuchsia 400 */
      #c084fc 52%,  /* Purple 400 */
      #4c1d95 60%,
      #1e1b4b 80%,
      #0f172a 100%
    )`,
    textColor: 'text-purple-100',
    accentColor: 'text-purple-400',
    // 3D 场景参数
    fogColor: '#1e1b4b',
    ambientIntensity: 0.5,
    dirLightColor: '#c084fc', // 紫色调主光
    dirLightIntensity: 1.5,
    spotLightColor: '#e879f9', // 粉紫光斑
    spotLightIntensity: 6,
    sparkleColor: '#e9d5ff', // 浅紫粒子
    showAurora: false // 默认不显示极光
  }
};

const EveningThemeControl = ({ currentConfig, onConfigChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
  const [showTutorial, setShowTutorial] = useState(false);
  const containerRef = useRef(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 检查点击是否在组件外部
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // 如果点击的是控制按钮（通常在外部），让控制按钮的逻辑处理，避免冲突
        // 但由于我们无法直接访问控制按钮的引用，这里依靠 mousedown 事件的特性
        // 如果点击了外部，就触发 onClose
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 首次使用检查
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('evening_theme_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('evening_theme_tutorial_seen', 'true');
  };

  const handlePresetSelect = (presetId) => {
    const preset = EVENING_PRESETS[presetId];
    // 重置自定义参数
    onConfigChange({
      ...preset,
      hueRotate: 0,
      saturate: 100,
      brightness: 100
    });
  };

  const handleSliderChange = (key, value) => {
    onConfigChange({
      ...currentConfig,
      [key]: value
    });
  };

  const handleReset = () => {
    handlePresetSelect('sunset');
  };

  return (
    <div 
      ref={containerRef}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-72 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 text-white"
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-bold text-lg bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
          暮色调音台
        </h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-6">
        
        {/* 选项卡切换 */}
        <div className="flex p-1 bg-black/20 rounded-lg">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'presets' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            精选方案
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'custom' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            个性微调
          </button>
        </div>

        {/* 预设列表 */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            {Object.values(EVENING_PRESETS).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`w-full group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                  currentConfig.id === preset.id 
                    ? 'border-orange-500 bg-white/5' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* 预览背景 */}
                <div 
                  className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                  style={{ background: preset.cssGradient }}
                />
                
                <div className="relative p-3 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm shadow-black drop-shadow-md">{preset.name}</span>
                    {currentConfig.id === preset.id && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-200/80 line-clamp-1 shadow-black drop-shadow-md">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 自定义滑块 */}
        {activeTab === 'custom' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>色相偏移</span>
                <span>{currentConfig.hueRotate}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={currentConfig.hueRotate || 0}
                onChange={(e) => handleSliderChange('hueRotate', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>饱和度</span>
                <span>{currentConfig.saturate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={currentConfig.saturate ?? 100}
                onChange={(e) => handleSliderChange('saturate', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>亮度</span>
                <span>{currentConfig.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={currentConfig.brightness ?? 100}
                onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
              />
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2 mt-2 text-xs text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-lg transition-colors"
            >
              恢复默认
            </button>
          </div>
        )}
      </div>

      {/* 教程遮罩 */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-12 h-12 mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h4 className="text-lg font-bold mb-2">欢迎使用调色台</h4>
          <p className="text-sm text-gray-300 mb-6">
            这里可以切换不同的傍晚氛围，或者微调各项参数来创造属于你的独特色调。
          </p>
          <button
            onClick={handleTutorialClose}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full font-medium text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95"
          >
            开始体验
          </button>
        </div>
      )}
    </div>
  );
};

export default EveningThemeControl;
