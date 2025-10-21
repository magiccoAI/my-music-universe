import { useState, useEffect, useCallback } from 'react';
import { processAggregatedData } from '../utils/dataTransformUtils';

const useMusicData = () => {
  const [musicData, setMusicData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({ artist_counts: {}, style_counts: {} });
  const [fetchState, setFetchState] = useState({
    loading: true,
    error: null,
    retryCount: 0,
  });

  const fetchData = useCallback(async () => { // Removed signal parameter temporarily
    console.log('Fetching data...');
    try {
      setFetchState(prev => ({ ...prev, loading: true, error: null }));

      const [musicResponse, aggregatedResponse] = await Promise.all([
        fetch('/data/data.json'), // Removed { signal }
        fetch('/data/aggregated_data.json') // Removed { signal }
      ]);

      if (!musicResponse.ok || !aggregatedResponse.ok) {
        const errorMsg = `数据加载失败: Music Status ${musicResponse.status}, Aggregated Status ${aggregatedResponse.status}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const [musicJson, aggregatedJson] = await Promise.all([
        musicResponse.json(),
        aggregatedResponse.json()
      ]);

      console.log('Music data fetched:', musicJson);
      console.log('Aggregated data fetched:', aggregatedJson);

      setMusicData(musicJson);

      // 使用工具函数处理聚合数据
      const processedData = processAggregatedData(aggregatedJson);
      setAggregatedData(processedData);
      setFetchState(prev => ({ ...prev, loading: false, error: null }));

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setFetchState(prev => ({
        ...prev,
        error: err.message,
        retryCount: prev.retryCount + 1,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    // const controller = new AbortController(); // Temporarily commented out
    fetchData(); // Removed controller.signal

    // return () => controller.abort(); // Temporarily commented out
  }, [fetchData]);

  return {
    musicData: musicData || [],
    aggregatedData: aggregatedData || { artist_counts: {}, style_counts: {} },
    loading: fetchState.loading,
    error: fetchState.error,
    retryCount: fetchState.retryCount,
    refetch: fetchData, // Optionally expose refetch for manual retries
  };
};

export default useMusicData;