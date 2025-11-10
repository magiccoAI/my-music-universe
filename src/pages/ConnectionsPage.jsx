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
    process.env.PUBLIC_URL + '/audio/a6-82015.mp3',
    process.env.PUBLIC_URL + '/audio/b6-82017.mp3',
    process.env.PUBLIC_URL + '/audio/c6-102822.mp3',
    process.env.PUBLIC_URL + '/audio/d6-82018.mp3',
    process.env.PUBLIC_URL + '/audio/e6-82016.mp3',
    process.env.PUBLIC_URL + '/audio/f6-102819.mp3',
    process.env.PUBLIC_URL + '/audio/g6-82013.mp3',   
    process.env.PUBLIC_URL + '/audio/re-78500.mp3',
    process.env.PUBLIC_URL + '/audio/fa-78409.mp3',
    process.env.PUBLIC_URL + '/audio/sol-101774.mp3',
    process.env.PUBLIC_URL + '/audio/si-80238.mp3',
    process.env.PUBLIC_URL + '/audio/2-notes-octave-guitar-83275.mp3',
    process.env.PUBLIC_URL + '/audio/bass-guitar-three-notes-43765.mp3',
    process.env.PUBLIC_URL + '/audio/sfx-piano-bar2.mp3',
    process.env.PUBLIC_URL + '/audio/sfx-piano-effect9.mp3',
  ], []);

  const pianoSounds = useRef({});
  const audioLoadPromises = useRef({});

  const loadAudioOnDemand = useCallback(async (index) => {
    const soundFile = pianoSoundFiles[index % pianoSoundFiles.length];
    // console.log('Attempting to load audio from:', soundFile);
    
    // 如果音频已经加载，直接返回
    if (pianoSounds.current[soundFile]) {
      return pianoSounds.current[soundFile];
    }
    
    // 如果正在加载中，返回加载promise
    if (audioLoadPromises.current[soundFile]) {
      return audioLoadPromises.current[soundFile];
    }
    
    // 创建新的音频加载promise
    audioLoadPromises.current[soundFile] = new Promise((resolve, reject) => {
      const audio = new Audio(soundFile);
      
      const onCanPlayThrough = () => {
        console.log('Audio loaded and ready:', soundFile);
        pianoSounds.current[soundFile] = audio;
        delete audioLoadPromises.current[soundFile];
        resolve(audio);
      };
      
      const onError = (error) => {
        console.error('Failed to load audio:', soundFile, error, 'MediaError:', audio.error);
        delete audioLoadPromises.current[soundFile];
        reject(error);
      };
      
      audio.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
      audio.addEventListener('error', onError, { once: true });
      
      // 开始加载音频
      audio.load();
    });
    
    return audioLoadPromises.current[soundFile];
  }, [pianoSoundFiles]);

  const playPianoSound = useCallback(async (index) => {
    try {
      const soundFile = pianoSoundFiles[index % pianoSoundFiles.length];
      
      // 按需加载音频
      const audio = await loadAudioOnDemand(index);
      
      if (audio) {
        audio.currentTime = 0; // Reset to start
        audio.volume = 1;
        console.log(`Attempting to play: ${soundFile}`);
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Successfully played: ${soundFile}`);
            })
            .catch(e => {
              console.error(`Error playing sound ${soundFile}:`, e);
            });
        }
      }
    } catch (error) {
      console.error('Failed to play piano sound:', error);
    }
  }, [pianoSoundFiles, loadAudioOnDemand]);

  useEffect(() => {
    setIsConnectionsPageActive(true);
    return () => setIsConnectionsPageActive(false);
  }, [setIsConnectionsPageActive]);



  // 音频资源清理
  useEffect(() => {
    return () => {
      // 清理所有音频资源
      Object.values(pianoSounds.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
          audio.load();
        }
      });
      pianoSounds.current = {};
      audioLoadPromises.current = {};
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(process.env.PUBLIC_URL + '/data/data.json')
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
                    onMouseEnter={() => {
                      playPianoSound(index);
                    }}
                    onClick={() => {
                      setSelectedTag(tag);
                    }}
                    aria-label={`筛选标签: ${tag}，包含 ${count} 首音乐`}
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
                aria-label="返回标签探索页面"
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