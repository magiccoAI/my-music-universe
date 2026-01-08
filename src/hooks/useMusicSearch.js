import { useState, useEffect, useMemo, useCallback } from 'react';

export const useMusicSearch = (musicData = []) => {
  // 如果没有数据，则视为正在加载。
  const isLoading = !musicData || musicData.length === 0;
  const [query, setQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Global Search State
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500); // Increased debounce for API safety
    return () => clearTimeout(timer);
  }, [query]);

  // 艺术家列表
  const { artists, artistsByName } = useMemo(() => {
    const artistCount = {};
    musicData.forEach((m) => {
      if (m.artist) artistCount[m.artist] = (artistCount[m.artist] || 0) + 1;
    });
    const entries = Object.entries(artistCount);
    const byCount = [...entries].sort((a, b) => b[1] - a[1]);
    const byName = [...entries].sort((a, b) => a[0].localeCompare(b[0]));
    
    return { artists: byCount, artistsByName: byName };
  }, [musicData]);

  // 本地搜索结果
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

  // Global Search Effect
  useEffect(() => {
    const performGlobalSearch = async () => {
      const q = debouncedQuery.trim();
      if (!q || q.length < 2) {
        setGlobalResults([]);
        return;
      }

      // If we have plenty of local results and no specific artist filter, maybe skip global? 
      // User requirement: "what if user searches songs not in data.json" -> implies we should search when local is empty or always to show more.
      // Let's search always to allow discovery, but maybe prioritize local in UI.
      
      setIsSearchingGlobal(true);
      setGlobalError(null);

      try {
        const encodedTerm = encodeURIComponent(q);
        const response = await fetch(`https://itunes.apple.com/search?term=${encodedTerm}&media=music&limit=12&entity=song`);
        
        if (!response.ok) throw new Error('Global search failed');
        
        const data = await response.json();
        
        const adaptedResults = data.results.map(item => ({
          id: `itunes-${item.trackId}`,
          music: item.trackName,
          artist: item.artistName,
          album: item.collectionName,
          cover: item.artworkUrl100?.replace('100x100', '600x600'), // Upgrade quality
          date: item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '',
          note: item.primaryGenreName, // Use genre as note/tag
          url: item.trackViewUrl,
          previewUrl: item.previewUrl,
          isGlobal: true
        }));

        // Filter out items that might duplicate local items (simple check by artist + title)
        // This is a rough check
        const filteredGlobal = adaptedResults.filter(globalItem => {
            return !results.some(localItem => 
                localItem.music.toLowerCase() === globalItem.music.toLowerCase() && 
                localItem.artist.toLowerCase() === globalItem.artist.toLowerCase()
            );
        });

        setGlobalResults(filteredGlobal);
      } catch (err) {
        console.error("Global search error:", err);
        setGlobalError(err.message);
      } finally {
        setIsSearchingGlobal(false);
      }
    };

    performGlobalSearch();
  }, [debouncedQuery, results]); // Re-run when query changes (results dependency helps filtering)

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
    setGlobalResults([]);
  }, []);

  return {
    musicData,
    isLoading,
    query,
    setQuery,
    artistFilter,
    setArtistFilter,
    results, // Local results
    globalResults, // New: Global results
    isSearchingGlobal, // New: Loading state for global
    globalError, // New: Error for global
    artists, // Sorted by count
    artistsByName, // Sorted by name
    artistExact,
    getSearchSuggestions,
    resetSearch
  };
};
