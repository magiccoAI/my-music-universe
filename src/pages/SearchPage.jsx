import React, { useEffect, useState, useRef } from 'react';
import UniverseNavigation from '../components/UniverseNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import MouseParticleEffect from '../components/MouseParticleEffect';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMusicSearch } from '../hooks/useMusicSearch';

// 图片加载优化的工具函数
const getOptimizedImagePath = (cover) => {
  const filename = cover.split('/').pop().replace(/\.[^/.]+$/, '');
  return `${process.env.PUBLIC_URL}/optimized-images/${filename}.webp`;
};

const SearchPage = () => {
  const {
    isLoading,
    error,
    query,
    setQuery,
    artistFilter,
    setArtistFilter,
    results,
    artists,
    resetSearch
  } = useMusicSearch();

  const [selected, setSelected] = useState(null);
  const [visibleBackgroundImages, setVisibleBackgroundImages] = useState(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
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
      className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700 text-white relative overflow-hidden"
      role="main"
      aria-label="音乐搜索页面"
    >
      <MouseParticleEffect />
      
      {/* 背景浮动封面 */}
      {results.slice(0, 10).map((item, i) => (
        <motion.div
          key={item.id}
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
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="输入歌手/专辑/歌曲名或音乐风格"
              className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800 placeholder-gray-600 focus:outline-none"
              role="searchbox"
              aria-label="搜索音乐"
              aria-expanded={showSuggestions}
              aria-controls="search-suggestions"
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
          <div className="mt-3">
            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800 focus:outline-none"
              aria-label="选择艺术家过滤"
            >
              <option value="">全部艺术家</option>
              {artists.map(([name, count]) => (
                <option key={name} value={name}>{name} ({count})</option>
              ))}
            </select>
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
                key={query + artistFilter}
                variants={resultVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 
                  className="text-xl font-semibold mb-2"
                  aria-live="polite"
                >
                  共 {results.length} 条结果
                  {results.length === 0 && (
                    <span className="text-sm text-gray-400 ml-2">
                      没有找到相关音乐，请尝试其他关键词
                    </span>
                  )}
                </h3>
                <div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  role="grid"
                  aria-label="音乐列表"
                >
                  {results.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="relative group overflow-hidden rounded-lg shadow-md bg-white/10 cursor-pointer"
                      onClick={() => setSelected(item)}
                      onKeyDown={(e) => handleResultKeyDown(e, item)}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      role="gridcell"
                      tabIndex={0}
                      aria-label={`${item.music} - ${item.artist}`}
                    >
                      <img
                        src={getOptimizedImagePath(item.cover)}
                        alt={`${item.album}的封面`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = `${process.env.PUBLIC_URL}/images/default-cover.webp`;
                          e.target.alt = "默认封面图片";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                        <div className="font-bold">{item.music}</div>
                        <div>{item.artist}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
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