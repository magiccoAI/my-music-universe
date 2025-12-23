import React, { useEffect, useState, useRef, useMemo } from 'react';
import UniverseNavigation from '../components/UniverseNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import MouseParticleEffect from '../components/MouseParticleEffect';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/CustomSelect';
import { useMusicSearch } from '../hooks/useMusicSearch';
import { getOptimizedImagePath } from '../utils/imageUtils';
import useMusicData from '../hooks/useMusicData';
import MusicCard from '../components/MusicCard';



import { pinyin } from 'pinyin-pro';

const SearchPage = () => {
  const { musicData, loading: musicDataLoading, error: musicDataError } = useMusicData();
  const {
    isLoading,
    error,
    query,
    setQuery,
    artistFilter,
    setArtistFilter,
    results,
    globalResults,
    isSearchingGlobal,
    artists,
    artistsByName,
    resetSearch
  } = useMusicSearch(musicData);

  const [selected, setSelected] = useState(null);
  const [playingCardId, setPlayingCardId] = useState(null);
  const [visibleBackgroundImages, setVisibleBackgroundImages] = useState(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [sortMethod, setSortMethod] = useState('count'); // 'count' | 'name'

  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);
  const backgroundCoverRefs = useRef([]);

  // 使用 IntersectionObserver 监控背景图片
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleBackgroundImages(prev => new Set([...prev, entry.target.dataset.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    // 确保在观察之前元素已经存在
    backgroundCoverRefs.current.forEach(el => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      backgroundCoverRefs.current.forEach(el => {
        if (el) {
          observer.unobserve(el);
        }
      });
    };
  }, [results]); // 依赖 results，当 results 变化时重新观察

  // 搜索建议
  useEffect(() => {
    if (query.trim()) {
      const suggestions = artists
        .filter(([name]) => 
          name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map(([name]) => name);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
    setFocusedSuggestionIndex(-1);
  }, [query, artists]);

  // Group artists by first letter (optimized for Chinese)
  const groupedArtists = useMemo(() => {
    if (sortMethod !== 'name') return null;
    
    const groups = {};
    artistsByName.forEach(([name, count]) => {
      let firstChar = name.charAt(0).toUpperCase();
      
      // Check if it's an English letter
      if (!/^[A-Z]/.test(firstChar)) {
        // Try to convert Chinese to pinyin first letter
        try {
           const pinyinResult = pinyin(name.charAt(0), { pattern: 'first', toneType: 'none', type: 'array' });
           if (pinyinResult && pinyinResult.length > 0) {
             firstChar = pinyinResult[0].toUpperCase();
           }
        } catch (e) {
           // Fallback to # if conversion fails
           firstChar = '#';
        }
      }

      // Final check if it is a letter after conversion
      const key = /^[A-Z]/.test(firstChar) ? firstChar : '#';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push({ name, count });
    });
    
    // Sort keys: # at the end
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
    });

    // Sort artists within each group
    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    });

    return { groups, sortedKeys };
  }, [artistsByName, sortMethod]);

  // 处理搜索建议点击
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // 处理搜索建议键盘导航
  const handleSearchKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        if (focusedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(searchSuggestions[focusedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // 处理结果项键盘导航
  const handleResultKeyDown = (e, item) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelected(item);
        break;
      case 'Escape':
        if (selected) {
          e.preventDefault();
          setSelected(null);
        }
        break;
      default:
        break;
    }
  };

  const floatVariants = {
    initial: { opacity: 0, scale: 0.8, y: '100vh', rotate: 0 },
    animate: (i) => ({
      opacity: 0.1,
      scale: 1,
      y: [0, Math.random() * 100 - 50, 0],
      x: [0, Math.random() * 100 - 50, 0],
      rotate: [0, Math.random() * 360, 0],
      transition: {
        delay: i * 0.5,
        duration: Math.random() * 10 + 10,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      },
    }),
  };

  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div 
      className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700 text-white relative"
      role="main"
      aria-label="音乐搜索页面"
    >
      <MouseParticleEffect />
      
      {/* 背景浮动封面 */}
      {results.slice(0, 10).map((item, i) => (
        <motion.div
          key={item.id}
          ref={el => (backgroundCoverRefs.current[i] = el)}
          className="background-cover"
          data-id={item.id}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '96px',
            height: '96px',
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          {visibleBackgroundImages.has(item.id) && (
            <img
              src={getOptimizedImagePath(item.cover)}
              alt=""
              className="w-full h-full object-cover rounded-lg blur-sm"
              loading="lazy"
              decoding="async"
            />
          )}
        </motion.div>
      ))}

      <UniverseNavigation className="relative z-10" />

      <div className="pt-24 px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* 搜索输入部分 */}
        <div 
          className="lg:col-span-1 bg-white/10 rounded-xl p-4 shadow"
          role="search"
          aria-label="音乐搜索"
        >
          <h2 className="text-2xl font-semibold mb-4">Search</h2>
          <div className="relative">
            <input
              ref={searchInputRef}
              name="search-query"
              id="main-search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="输入歌手/专辑/歌曲名或音乐风格"
              className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800 placeholder-gray-600 focus:outline-none"
              role="combobox"
              aria-label="搜索音乐"
              aria-expanded={showSuggestions}
              aria-controls="search-suggestions"
              aria-haspopup="listbox"
              aria-activedescendant={
                focusedSuggestionIndex >= 0 
                  ? `suggestion-${focusedSuggestionIndex}` 
                  : undefined
              }
            />
            {/* 搜索建议下拉框 */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                id="search-suggestions"
                className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50"
                role="listbox"
                aria-label="搜索建议"
              >
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    id={`suggestion-${index}`}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 ${
                      index === focusedSuggestionIndex ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }
                    }}
                    role="option"
                    aria-selected={index === focusedSuggestionIndex}
                    tabIndex={-1}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2 items-center">
            <div className="flex-1 min-w-0 relative z-20">
              <CustomSelect
                value={artistFilter}
                onChange={setArtistFilter}
                options={sortMethod === 'count' ? artists : groupedArtists}
                isGrouped={sortMethod === 'name'}
                defaultLabel="全部艺术家"
              />
            </div>
            
            <div className="relative group flex-shrink-0">
              <button
                onClick={() => setSortMethod(prev => prev === 'count' ? 'name' : 'count')}
                className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={sortMethod === 'count' ? "当前按数量排序，点击切换为按首字母排序" : "当前按字母排序，点击切换为按数量排序"}
              >
                {sortMethod === 'count' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                )}
              </button>
              {/* Tooltip - Accessible & Visual */}
              <div 
                className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-gray-900/95 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 border border-white/10 backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0"
                role="tooltip"
              >
                {sortMethod === 'count' ? "切换为按首字母排序" : "切换为按数量排序"}
                <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-900/95 border-b border-r border-white/10 transform rotate-45"></div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={resetSearch} 
              className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label="清空搜索"
            >
              清空
            </button>
          </div>
        </div>

        {/* 搜索结果展示 */}
        <div 
          className="lg:col-span-2"
          role="region"
          aria-label="搜索结果"
        >
          {isLoading ? (
            <div 
              className="flex justify-center items-center h-64"
              role="status"
              aria-label="正在加载"
            >
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div 
              className="text-center text-red-300 mt-20"
              role="alert"
              aria-live="polite"
            >
              <p>{error}</p>
            </div>
          ) : !query && !artistFilter ? (
            <div 
              className="text-center text-gray-300 mt-20"
              role="status"
              aria-label="搜索提示"
            >
              <p>✨ 输入关键词或选择艺术家，开始探索你的音乐宇宙 ✨</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="results-container"
                variants={resultVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Local Results */}
                {results.length > 0 && (
                  <div className="mb-8">
                     <h3 className="text-xl font-semibold mb-4" aria-live="polite">
                       我的收藏 ({results.length})
                     </h3>
                     <div
                       className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                       role="grid"
                       aria-label="本地音乐列表"
                     >
                       {results.map((item) => (
                         <div role="row" key={`row-${item.id}`}>
                           <MusicCard
                             key={item.id}
                             item={item}
                             playingCardId={playingCardId}
                             setPlayingCardId={setPlayingCardId}
                             onClick={() => setSelected(item)}
                             onKeyDown={(e) => handleResultKeyDown(e, item)}
                             className="cursor-pointer"
                           />
                         </div>
                       ))}
                     </div>
                  </div>
                )}

                {/* Global Results */}
                {(globalResults.length > 0 || isSearchingGlobal) && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-300">
                      <span>🌍 全球发现</span>
                      {isSearchingGlobal && <div className="scale-75 origin-left"><LoadingSpinner /></div>}
                    </h3>
                    
                    {globalResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {globalResults.map((item) => (
                           <div role="row" key={`row-${item.id}`}>
                             <MusicCard
                               key={item.id}
                               item={item}
                               playingCardId={playingCardId}
                               setPlayingCardId={setPlayingCardId}
                               onClick={() => setSelected(item)}
                               onKeyDown={(e) => handleResultKeyDown(e, item)}
                               className="cursor-pointer border-indigo-500/30"
                               showNote={false} 
                             />
                           </div>
                        ))}
                      </div>
                    ) : (
                       isSearchingGlobal && <div className="text-gray-400 text-sm pl-1">正在探索更广阔的音乐宇宙...</div>
                    )}
                  </div>
                )}

                {/* No Results at all */}
                {results.length === 0 && globalResults.length === 0 && !isSearchingGlobal && (
                   <div className="text-center text-gray-400 mt-10">
                      <p>没有找到相关音乐，请尝试其他关键词</p>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* 详情展示 */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-white/10 rounded-xl p-4"
                role="dialog"
                aria-label="歌曲详情"
                aria-modal="true"
              >
                <div className="flex justify-between mb-2">
                  <h4 className="text-lg font-semibold">歌曲详情</h4>
                  <button 
                    className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors" 
                    onClick={() => setSelected(null)}
                    aria-label="关闭详情"
                  >
                    关闭
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <img
                    src={getOptimizedImagePath(selected.cover)}
                    alt={`${selected.album}的封面`}
                    className="w-full rounded-md shadow"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="md:col-span-2 text-sm">
                    <p><strong>歌曲:</strong> {selected.music}</p>
                    <p><strong>艺术家:</strong> {selected.artist}</p>
                    <p><strong>专辑:</strong> {selected.album}</p>
                    <p><strong>标签:</strong> {selected.note}</p>
                    <p><strong>分享日期:</strong> {selected.date}</p>
                    {selected.url && (
                      <a 
                        href={selected.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-300 hover:underline hover:text-blue-400 transition-colors"
                        aria-label={`在新窗口查看${selected.music}的原分享`}
                      >
                        查看原分享
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;