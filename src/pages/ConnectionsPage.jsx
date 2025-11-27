import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from 'react';
import MusicUniverse from '../MusicUniverse';
import { UniverseContext } from '../UniverseContext';
import { Link } from 'react-router-dom';
import UniverseNavigation from '../components/UniverseNavigation';
import TagButton from '../components/TagButton';
import MusicCard from '../components/MusicCard';
import { getOptimizedImagePath } from '../utils/imageUtils';
import useMusicData from '../hooks/useMusicData';
import usePianoSounds from '../hooks/usePianoSounds';

const ConnectionsPage = () => {
  const { setIsConnectionsPageActive } = useContext(UniverseContext);
  // ... 其他逻辑保持不变
  const [selectedTag, setSelectedTag] = useState('');
  const [hovered, setHovered] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [relatedTags, setRelatedTags] = useState([]);
  const [error, setError] = useState(null);
  const { playPianoSound } = usePianoSounds();

  const { musicData, tagCounts, tagRelationships, loading: isLoading } = useMusicData();


  const splitNote = (note) => {
    if (!note) return [];
    return note.split(/\s*[,;\/]\s*|\s+and\s+/);
  };

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

  useEffect(() => {
    console.log("ConnectionsPage: musicData", musicData);
    console.log("ConnectionsPage: filtered", filtered);
  }, [musicData, filtered]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl mb-4">页面加载失败</h2>
          <p className="text-red-400 mb-4">错误信息: {error.message}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-900 text-white relative overflow-hidden">
      
      {/* 增强的动态背景层 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-indigo-900/40" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-blue-900/10 to-transparent animate-pulse" />
        </div>
        <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none">
          <MusicUniverse />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-cyan-500/10 to-transparent" />
      </div>

      {/* 导航栏 */}
      <UniverseNavigation className="border-b border-slate-700/50" />
      {/* 主要内容区域 */}
      <main className="relative z-10 container mx-auto p-4 pt-24">
        
        {!selectedTag ? (
          // 标签选择区域
          <div className="pt-12">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                音乐风格
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                探索音乐风格的无限可能，每个标签都是一个独特的星系
              </p>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
              {(isExpanded ? sortedTags : sortedTags.slice(0, 20)).map(([tag, count], index) => {
                return (
                  <button
                    key={tag}
                    className={`
                      relative group
                      p-3 pr-5 min-h-[56px]
                      flex justify-center items-center
                      rounded-lg
                      transition-all duration-300 ease-out
                      bg-slate-800/50
                      hover:bg-cyan-900/40
                      border border-slate-700/50 hover:border-cyan-600/50
                      backdrop-blur-sm
                      shadow-md hover:shadow-cyan-500/10
                    `}
                    onClick={() => {
                      setSelectedTag(tag);
                      playPianoSound();
                    }}
                    onMouseEnter={() => playPianoSound()}
                    aria-label={`筛选标签: ${tag}，包含 ${count} 首音乐`}
                  >
                    {/* 新增：流光效果 */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg">
                      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-45 group-hover:left-[150%] transition-all duration-700" />
                    </div>

                    <span className="relative z-10 text-slate-200 group-hover:text-white text-center text-sm font-medium transition-colors">
                      {tag}
                    </span>
                    <span className="absolute bottom-1 right-2 text-xs font-bold text-cyan-300/70 group-hover:text-cyan-300 transition-colors">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            {sortedTags.length > 20 && (
              <div className="text-center mt-8">
                <button
                  className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                  onClick={() => {
                  setIsExpanded(!isExpanded);
                  playPianoSound();
                }}
                  aria-label={isExpanded ? '收起星图' : '探索更多音乐风格'}
                >
                  {isExpanded ? '收起星图 ⇧' : '探索更多音乐风格 ⇩'}
                </button>
              </div>
            )}
          </div>
        ) : (
          // 筛选结果区域
          <div className="pt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-2">
                  标签: <span className="text-cyan-400">"{selectedTag}"</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  发现 <span className="text-cyan-300 font-semibold">{filtered.length}</span> 首相关音乐
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
                "
                onClick={() => {
                setSelectedTag('');
                playPianoSound();
              }}
                aria-label="返回标签探索页面"
              >
                <span>←</span>
                返回探索
              </button>
            </div>

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
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.music} - ${item.artist}，专辑：${item.album}`}
                  onClick={() => { /* handle click if needed */ }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      // Simulate click for keyboard activation
                      e.currentTarget.click();
                    }
                  }}
                >
                  {/* 专辑封面容器 */}
                  <div className="relative overflow-hidden">
                    <img
                      src={`${process.env.PUBLIC_URL}/optimized-images/${item.cover.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '')}.webp`}
                      alt={`${item.album} - ${item.artist}`}
                      className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${process.env.PUBLIC_URL}/${item.cover}`;
                        console.error('Optimized image failed to load, falling back to original:', e.target.src);
                      }}
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