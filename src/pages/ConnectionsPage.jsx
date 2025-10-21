import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from 'react';
import MusicUniverse from '../MusicUniverse';
import { UniverseContext } from '../UniverseContext';
import { Link } from 'react-router-dom';
import UniverseNavigation from '../components/UniverseNavigation';
import MouseParticleEffect from '../components/MouseParticleEffect';

// 标签分割函数保持不变
const splitNote = (note) => {
  if (!note) return [];
  return note
    .split(/[,，/\s.?!;:\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t === 'graphic background music' ? 'motion' : (t === '循环过' ? '循环' : t)));
};

const ConnectionsPage = () => {
  const { setIsConnectionsPageActive } = useContext(UniverseContext);
  const [musicData, setMusicData] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [selectedTag, setSelectedTag] = useState('');
  const [hovered, setHovered] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const pianoSoundFiles = useMemo(() => [
    '/audio/a6-82015.mp3',
    '/audio/b6-82017.mp3',
    '/audio/c6-102822.mp3',
    '/audio/d6-82018.mp3',
    '/audio/e6-82016.mp3',
    '/audio/f6-102819.mp3',
    '/audio/g6-82013.mp3',
    '/audio/do-80236.mp3',
    '/audio/re-78500.mp3',
    '/audio/fa-78409.mp3',
    '/audio/sol-101774.mp3',
    '/audio/si-80238.mp3',
    '/audio/piano-g-6200.mp3',
  ], []);

  const pianoSounds = useRef({});

  useEffect(() => {
    pianoSoundFiles.forEach(file => {
      pianoSounds.current[file] = new Audio(file);
    });
  }, [pianoSoundFiles]);

  const playPianoSound = useCallback((index) => {
    const soundFile = pianoSoundFiles[index % pianoSoundFiles.length];
    if (pianoSounds.current[soundFile]) {
      pianoSounds.current[soundFile].currentTime = 0; // Reset to start
      pianoSounds.current[soundFile].play();
    }
  }, [pianoSoundFiles]);

  useEffect(() => {
    setIsConnectionsPageActive(true);
    return () => setIsConnectionsPageActive(false);
  }, [setIsConnectionsPageActive]);

  useEffect(() => {
    setIsLoading(true);
    fetch('/data/data.json')
      .then((res) => res.json())
      .then((data) => {
        setMusicData(data);
        const counts = {};
        data.forEach((item) => {
          const tags = splitNote(item.note);
          tags.forEach((tag) => {
            counts[tag] = (counts[tag] || 0) + 1;
          });
        });
        setTagCounts(counts);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);

  const filtered = selectedTag
    ? musicData.filter((item) => splitNote(item.note).includes(selectedTag))
    : [];

  return (
    // 全新的宇宙深空背景 - 更丰富的渐变和深度
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-900 text-white relative overflow-hidden">
      
      {/* 增强的动态背景层 */}
      <div className="absolute inset-0 z-0">
        {/* 多层背景增强深度感 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-indigo-900/40" />
        
        {/* 动态星空效果层 */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-blue-900/10 to-transparent animate-pulse" />
        </div>
        
        {/* MusicUniverse 组件 - 调整透明度和混合模式 */}
        <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none">
          <MusicUniverse />
        </div>
        
        {/* 顶部光晕效果 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-cyan-500/10 to-transparent" />
      </div>
      
      {/* 鼠标粒子效果 */}
      {/* <MouseParticleEffect /> */}

      {/* 导航栏 */}
      <UniverseNavigation className="fixed top-0 left-0 right-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-slate-700/50" />

      {/* 主要内容区域 */}
      <main className="relative z-10 container mx-auto p-4 pt-24">
        
        {!selectedTag ? (
          // 1. 标签选择区域 - 全新设计
          <div className="pt-12">
            {/* 增强的主标题 */}
            <div className="text-center mb-16">
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                音乐风格
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                探索音乐风格的无限可能，每个标签都是一个独特的星系
              </p>
            </div>

            {/* 加载状态 */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            )}

            {/* 重新设计的标签云 */}
            <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
              {sortedTags.map(([tag, count], index) => {
                return (
                  <button
                    key={tag}
                    className={`
                      relative group overflow-hidden
                      border border-slate-600/50 rounded-2xl py-3 px-6
                      transition-all duration-500 ease-out
                      bg-gradient-to-br from-slate-800/60 to-slate-900/80
                      hover:from-cyan-900/40 hover:to-blue-900/40
                      hover:border-cyan-400/30 hover:scale-105
                      backdrop-blur-sm
                      shadow-lg hover:shadow-cyan-500/20
                    `}
                    onMouseEnter={() => playPianoSound(index)}
                    onClick={() => {
                      setSelectedTag(tag);
                    }}
                  >
                    {/* 悬停光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    <span className="relative z-10 text-slate-200 group-hover:text-white font-medium transition-colors">
                      {tag} 
                      <span className="text-cyan-300/80 ml-2 font-semibold">
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // 2. 筛选结果区域 - 大幅改进的可读性
          <div className="pt-12">
            {/* 结果标题区域 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-2">
                  标签: <span className="text-cyan-400">"{selectedTag}"</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  发现 <span className="text-cyan-300 font-semibold">{filtered.length}</span> 首相关音乐
                </p>
              </div>
              
              {/* 返回按钮 */}
              <button
                className="
                  flex items-center gap-2 px-6 py-3 rounded-xl
                  bg-gradient-to-r from-slate-700 to-slate-800
                  hover:from-slate-600 hover:to-slate-700
                  border border-slate-600 hover:border-slate-500
                  text-white font-medium transition-all duration-300
                  shadow-lg hover:shadow-cyan-500/10
                  min-w-[140px] justify-center
                "
                onClick={() => setSelectedTag('')}
              >
                <span>←</span>
                返回探索
              </button>
            </div>

            {/* 改进的专辑卡片网格 - 大幅提升可读性 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="
                    relative group overflow-hidden
                    rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90
                    border border-slate-700/50 hover:border-cyan-500/30
                    transition-all duration-500 ease-out
                    shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10
                    hover:scale-[1.02]
                  "
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* 专辑封面容器 */}
                  <div className="relative overflow-hidden">
                    <img
                      src={`/covers/${item.cover.split('/').pop()}`}
                      alt={item.album}
                      className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* 顶部渐变遮罩 - 确保标题在任何背景下都清晰 */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
                    
                    {/* 底部渐变遮罩 - 增强文字可读性 */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent" />
                    
                    {/* 悬停信息层 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="text-slate-200 text-sm mb-2">
                        分享于 {item.date}
                      </div>
                      <div className="text-slate-300 text-xs">
                        {splitNote(item.note).slice(0, 3).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {/* 关键改进：始终清晰可见的文字信息 */}
                  <div className="relative p-4">
                    {/* 音乐标题 - 高对比度确保可读性 */}
                    <div className="font-bold text-lg mb-1 text-white leading-tight">
                      {item.music}
                    </div>
                    
                    {/* 艺术家信息 */}
                    <div className="text-cyan-200 font-medium text-sm mb-2">
                      {item.artist}
                    </div>
                    
                    {/* 专辑信息 */}
                    <div className="text-slate-300 text-xs">
                      {item.album}
                    </div>
                    
                    {/* 装饰性元素 */}
                    <div className="absolute bottom-3 right-3 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态提示 */}
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold text-slate-300 mb-2">
                  暂无相关音乐
                </h3>
                <p className="text-slate-400">
                  尝试选择其他标签来探索更多音乐
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConnectionsPage;