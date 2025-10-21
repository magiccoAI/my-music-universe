import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import UniverseNavigation from '../components/UniverseNavigation';
import { motion } from 'framer-motion'; // Add this import
import MouseParticleEffect from '../components/MouseParticleEffect';

const SearchPage = () => {
  const [musicData, setMusicData] = useState([]);
  const [query, setQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    fetch('/data/data.json')
      .then((res) => res.json())
      .then((data) => setMusicData(data))
      .catch((err) => console.error('Failed to load data.json', err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const artists = useMemo(() => {
    const c = {};
    musicData.forEach((m) => {
      if (m.artist) c[m.artist] = (c[m.artist] || 0) + 1;
    });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [musicData]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return musicData.filter((m) => {
      let ok = true;
      if (artistFilter) {
        ok = ok && (m.artist || '').toLowerCase().includes(artistFilter.toLowerCase());
      }
      if (q) {
        ok = ok && (
          (m.music || '').toLowerCase().includes(q) ||
          (m.album || '').toLowerCase().includes(q) ||
          (m.artist || '').toLowerCase().includes(q) ||
          (String(m.id) || '').toLowerCase().includes(q) ||
          (m.note || '').toLowerCase().includes(q)
        );
      }
      return ok;
    });
  }, [debouncedQuery, artistFilter, musicData]);

  const artistExact = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return null;
    const match = musicData.filter((m) => (m.artist || '').toLowerCase() === q);
    return match.length > 0 ? match : null;
  }, [debouncedQuery, musicData]);

  const floatVariants = {
    initial: { opacity: 0, scale: 0.8, y: '100vh', rotate: 0 },
    animate: (i) => ({
      opacity: 0.1, // Make them very subtle
      scale: 1,
      y: [0, Math.random() * 100 - 50, 0], // Random vertical movement
      x: [0, Math.random() * 100 - 50, 0], // Random horizontal movement
      rotate: [0, Math.random() * 360, 0],
      transition: {
        delay: i * 0.5,
        duration: Math.random() * 10 + 10, // Longer duration for slow float
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      },
    }),
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700 text-white relative overflow-hidden"> {/* Add relative and overflow-hidden */}
      <MouseParticleEffect />
      {/* Floating music covers in background */}
      {musicData.slice(0, 10).map((item, i) => ( // Use a subset of musicData
        <motion.img
          key={item.id}
          src={`/covers/${item.cover.split('/').pop()}`}
          alt={item.album}
          className="absolute w-24 h-24 object-cover rounded-lg blur-sm" // Blurred and small
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0, // Ensure it's in the background
          }}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={i}
        />
      ))}

      {/* 顶部导航栏：全局三入口 */}
      <UniverseNavigation className="relative z-10" /> {/* Add z-10 */}

      <div className="pt-24 px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"> {/* Add relative z-10 */}
        {/* 搜索输入与筛选 */}
        <div className="lg:col-span-1 bg-white/10 rounded-xl p-4 shadow">
          <h2 className="text-2xl font-semibold mb-4">Search</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入歌手/专辑/歌曲名或音乐风格"
            className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800 placeholder-gray-600 focus:outline-none"
          />
          <div className="mt-3">
            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800 focus:outline-none"
            >
              <option value="">全部艺术家</option>
              {artists.map(([name, count]) => (
                <option key={name} value={name}>{name} ({count})</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setQuery(''); setDebouncedQuery(''); setArtistFilter(''); }} className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600">清空</button>
          </div>

          {/* 若为艺术家精确匹配，展示词云 */}
          {artistExact && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">该艺术家词云</h3>

            </div>
          )}
        </div>

        {/* 搜索结果 */}
        <div className="lg:col-span-2">
          {!query && !artistFilter ? (
            <div className="text-center text-gray-300 mt-20">
              <p>✨ 输入关键词或选择艺术家，开始探索你的音乐宇宙 ✨</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">共 {results.length} 条结果</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden rounded-lg shadow-md bg-white/10"
                    onClick={() => setSelected(item)}
                  >
                    <img
                      src={`/covers/${item.cover.split('/').pop()}`}
                      alt={item.album}
                      loading="lazy"
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                      <div className="font-bold">{item.music}</div>
                      <div>{item.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selected && (
            <div className="mt-6 bg-white/10 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <h4 className="text-lg font-semibold">歌曲详情</h4>
                <button className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600" onClick={() => setSelected(null)}>关闭</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <img src={`/covers/${selected.cover.split('/').pop()}`} alt={selected.album} className="w-full rounded-md shadow" />
                <div className="md:col-span-2 text-sm">
                  <p><strong>歌曲:</strong> {selected.music}</p>
                  <p><strong>艺术家:</strong> {selected.artist}</p>
                  <p><strong>专辑:</strong> {selected.album}</p>
                  <p><strong>标签:</strong> {selected.note}</p>
                  <p><strong>分享日期:</strong> {selected.date}</p>
                  {selected.url && (
                    <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">查看原分享</a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;