import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import MusicUniverse from '../MusicUniverse';
import { UniverseContext } from '../UniverseContext';
import UniverseNavigation from '../components/UniverseNavigation';
import useMusicData from '../hooks/useMusicData';
import useSamplePlayer from '../hooks/useSamplePlayer';

// Construct paths using PUBLIC_URL to ensure they are correct in any environment
const publicUrl = process.env.PUBLIC_URL;
const pianoNotes = [
  `${publicUrl}/piano-mp3/C3.mp3`,
  `${publicUrl}/piano-mp3/D3.mp3`,
  `${publicUrl}/piano-mp3/E3.mp3`,
  `${publicUrl}/piano-mp3/G3.mp3`,
  `${publicUrl}/piano-mp3/A3.mp3`,
  `${publicUrl}/piano-mp3/B3.mp3`,
  `${publicUrl}/piano-mp3/bass-guitar-three-notes-43765.mp3`,
];

// 添加自定义动画样式
const customStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes float-fast {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }
  .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
  .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
  .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
`;

const ConnectionsPage = () => {
  const { setIsConnectionsPageActive } = useContext(UniverseContext);
  const [selectedTag, setSelectedTag] = useState('');
  const [hovered, setHovered] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [relatedTags, setRelatedTags] = useState([]); // 保留原有状态，尽管此处未深入使用
  const [error, setError] = useState(null);
  
  const { playSound: playPianoSound, isLoaded: areSoundsLoaded } = useSamplePlayer(pianoNotes);
  const { musicData, tagCounts, tagRelationships, loading: isLoading } = useMusicData();

  const splitNote = (note) => {
    if (!note) return [];
    return note.split(/\s*[,;\/]\s*|\s+and\s+/);
  };

  // 保留原有的逻辑
  const findRelatedTags = useCallback((hoveredTag) => {
    if (!hoveredTag) {
      setRelatedTags([]);
      return;
    }
    const related = tagRelationships.get(hoveredTag);
    setRelatedTags(related ? Array.from(related) : []);
  }, [tagRelationships]);



  useEffect(() => {
    setIsConnectionsPageActive(true);
    return () => setIsConnectionsPageActive(false);
  }, [setIsConnectionsPageActive]);

  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);

  const filtered = useMemo(() => {
    return selectedTag
      ? musicData.filter((item) => item.tags.includes(selectedTag))
      : musicData;
  }, [selectedTag, musicData]);

  // 辅助函数：根据歌曲数量决定视觉权重 (大小和颜色强度)
  const getTagVisualWeight = (count, maxCount) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return { size: 'text-xl px-8 py-4', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]', border: 'border-indigo-400/50' };
    if (ratio > 0.5) return { size: 'text-lg px-6 py-3', glow: 'shadow-[0_0_20px_rgba(129,140,248,0.3)]', border: 'border-indigo-400/40' };
    return { size: 'text-sm px-5 py-2', glow: 'shadow-none', border: 'border-slate-600/30' };
  };

  // 辅助函数：获取随机浮动动画类
  const getFloatAnimation = (index) => {
    const animations = ['animate-float-slow', 'animate-float-medium', 'animate-float-fast'];
    return animations[index % 3];
  };

  const mapIndexToNote = (index) => {
    return pianoNotes[index % pianoNotes.length];
  };

  if (error) {
    // ... 错误处理代码保持不变 ...
    return <div className="text-white">Error: {error.message}</div>; 
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      {/* 注入自定义动画样式 */}
      <style>{customStyles}</style>

      {/* ================================================================== */}
      {/* 终极背景方案：固定视差星空 + 宇宙光晕蒙版                       */}
      {/* ================================================================== */}
      <div className="fixed inset-0 z-0">
         {/* 1. 深空底色 */}
         <div className="absolute inset-0 bg-slate-950" />
         
         {/* 2. 动态星空 (固定不随页面滚动) */}
         <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none">
           <MusicUniverse isInteractive={false} showNavigation={false} />
         </div>
         
         {/* 3. 宇宙光晕 (Vignette) - 柔和暗角，聚焦中心 */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,theme(colors.slate.950)_120%)] pointer-events-none" />
      </div>

      <UniverseNavigation className="relative z-20 border-b border-slate-800/50 backdrop-blur-sm" />

      <main className="relative z-10 container mx-auto p-4 pt-24">
        
        {!selectedTag ? (
          // =================================================================
          // 重新设计的标签选择区域 (Music Tags)
          // =================================================================
          <div className="pt-8 min-h-[60vh] flex flex-col justify-center">
            <div className="text-center mb-16 relative">
              {/* 标题背后的装饰光晕 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent tracking-widest drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                风格图谱
              </h1>
              <p className="text-slate-300/80 text-lg max-w-2xl mx-auto font-light tracking-wide">
                基于个人理解构建的音乐风格图谱。探索 <span className="text-indigo-300 font-bold">{musicData.length}</span> 首曲目在不同流派中的分布与关联。
              </p>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            )}

            {/* 标签云布局：使用 wrap 和 justify-center，配合 gap 实现云状分布 */}
            <div id="tag-cloud-container" className="flex flex-wrap justify-center items-center gap-x-4 gap-y-6 max-w-7xl mx-auto px-4">
              {(isExpanded ? sortedTags : sortedTags.slice(0, 25)).map(([tag, count], index) => {
                const maxCount = sortedTags[0] ? sortedTags[0][1] : 1;
                const visual = getTagVisualWeight(count, maxCount);
                const animationClass = getFloatAnimation(index);
                
                return (
                  <button
                    key={tag}
                    className={`
                      group relative
                      rounded-full 
                      ${visual.size}
                      ${visual.border}
                      border backdrop-blur-md
                      bg-white/5 hover:bg-white/10
                      transition-all duration-500 ease-out
                      ${visual.glow}
                      hover:scale-110 hover:shadow-[0_0_40px_rgba(129,140,248,0.5)]
                      hover:border-indigo-300
                      active:scale-95
                      ${animationClass}
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900
                    `}
                    style={{
                      // 添加随机延迟，让动画看起来更自然不整齐
                      animationDelay: `${index * 0.1}s` 
                    }}
                    onClick={() => {
                      setSelectedTag(tag);
                      playPianoSound(mapIndexToNote(index));
                    }}
                    onMouseEnter={() => {
                      playPianoSound(mapIndexToNote(index));
                    }}
                    aria-label={`筛选风格：${tag}，包含 ${count} 首曲目`}
                    aria-pressed={selectedTag === tag}
                  >
                    {/* 内部流光 */}
                    <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent transform -skew-x-12 animate-pulse" />
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className={`
                        font-medium tracking-wide text-slate-200 group-hover:text-white transition-colors
                        ${count > 10 ? 'font-bold text-shadow-lg' : ''}
                      `}>
                        {tag}
                      </span>
                      <span className="text-xs font-light text-indigo-300/60 group-hover:text-indigo-200">
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center mt-20">
               {sortedTags.length > 20 && (
                  <button
                    onClick={() => {
                      setIsExpanded(!isExpanded);
                      if (areSoundsLoaded) playPianoSound(pianoNotes[3]); // Play a fixed note (G4)
                    }}
                    className="
                      group inline-flex items-center gap-2 px-6 py-2 rounded-full
                      text-sm text-slate-400 hover:text-indigo-300
                      border border-transparent hover:border-indigo-500/30 hover:bg-indigo-950/30
                      transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900
                    "
                    aria-expanded={isExpanded}
                    aria-controls="tag-cloud-container"
                  >
                    <span>{isExpanded ? '收起' : '展开完整图谱'}</span>
                    <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                      ⇩
                    </span>
                  </button>
               )}
            </div>
          </div>
        ) : (
          // =================================================================
          // 筛选结果区域 (保留原样)
          // =================================================================
          <div className="pt-12 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-2">
                  标签: <span className="text-indigo-400">"{selectedTag}"</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  发现 <span className="text-indigo-300 font-semibold">{filtered.length}</span> 首相关音乐
                </p>
              </div>
              
              <button
                className="
                  flex items-center gap-2 px-6 py-3 rounded-xl
                  bg-gradient-to-r from-slate-700 to-slate-800
                  hover:from-slate-600 hover:to-slate-700
                  border border-slate-600 hover:border-slate-500
                  text-white font-medium transition-all duration-300
                  shadow-lg hover:shadow-cyan-500/10
                  min-w-[140px] justify-center
                  group
                "
                onClick={() => {
                  setSelectedTag('');
                  if (areSoundsLoaded) playPianoSound(pianoNotes[0]); // Play a fixed note (C4)
                }}
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                返回星图
              </button>
            </div>

            {/* 卡片网格 - 保持不变 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="
                    relative group overflow-hidden
                    rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90
                    border border-slate-700/50 hover:border-indigo-500/30
                    transition-all duration-500 ease-out
                    shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10
                    hover:scale-[1.02]
                  "
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  role="button"
                  tabIndex={0}
                  onClick={() => { /* handle click */ }}
                >
                  {/* 专辑封面 */}
                  <div className="relative overflow-hidden">
                     {/* 图片逻辑保持原样，为了演示简洁我省略了 onError 的详细部分，请保留你原有的 */}
                    <img
                      src={`${process.env.PUBLIC_URL}/optimized-images/${item.cover.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '')}.webp`}
                      alt={`${item.album} - ${item.artist}`}
                      className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${process.env.PUBLIC_URL}/${item.cover}`;
                      }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent" />
                    
                    {/* 悬停信息 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="text-slate-200 text-sm mb-2">分享于 {item.date}</div>
                      <div className="text-slate-300 text-xs">
                        {splitNote(item.note).slice(0, 3).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {/* 卡片底部信息 */}
                  <div className="relative p-4">
                    <div className="font-bold text-lg mb-1 text-white leading-tight">{item.music}</div>
                    <div className="text-indigo-200 font-medium text-sm mb-2">{item.artist}</div>
                    <div className="text-slate-300 text-xs">{item.album}</div>
                    <div className="absolute bottom-3 right-3 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>

             {/* 空状态提示 */}
             {filtered.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold text-slate-300 mb-2">暂无相关音乐</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConnectionsPage;
