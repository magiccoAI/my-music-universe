import { useState, useEffect, useMemo, useCallback } from 'react';

export const useMusicSearch = (musicData = []) => {
  const [isLoading, setIsLoading] = useState(!musicData || musicData.length === 0);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 艺术家列表
  const artists = useMemo(() => {
    const artistCount = {};
    musicData.forEach((m) => {
      if (m.artist) artistCount[m.artist] = (artistCount[m.artist] || 0) + 1;
    });
    return Object.entries(artistCount).sort((a, b) => b[1] - a[1]);
  }, [musicData]);

  // 搜索结果
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

  // 艺术家精确匹配
  const artistExact = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return null;
    const match = musicData.filter((m) => (m.artist || '').toLowerCase() === q);
    return match.length > 0 ? match : null;
  }, [debouncedQuery, musicData]);

  // 搜索建议
  const getSearchSuggestions = useCallback((inputQuery) => {
    if (!inputQuery.trim()) return [];
    return artists
      .filter(([name]) => 
        name.toLowerCase().includes(inputQuery.toLowerCase())
      )
      .slice(0, 5)
      .map(([name]) => name);
  }, [artists]);

  // 重置搜索
  const resetSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setArtistFilter('');
  }, []);

  return {
    musicData,
    isLoading,
    error,
    query,
    setQuery,
    artistFilter,
    setArtistFilter,
    results,
    artists,
    artistExact,
    getSearchSuggestions,
    resetSearch
  };
};