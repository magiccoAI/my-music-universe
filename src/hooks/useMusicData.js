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

  const fetchData = useCallback(async () => {
    try {
      setFetchState(prev => ({ ...prev, loading: true, error: null }));

      const base = process.env.PUBLIC_URL || '';
      const musicCandidates = [
        `${base}/data/data.json`,
        `/data/data.json`
      ];
      const aggregatedCandidates = [
        `${base}/data/aggregated_data.json`,
        `/data/aggregated_data.json`
      ];

      const fetchJsonFromCandidates = async (candidates) => {
        for (const url of candidates) {
          try {
            console.log(`Attempting to fetch from: ${url}`);
            const res = await fetch(url);
            if (!res.ok) {
              const errorText = await res.text(); // Get text even on error
              console.warn(`Fetch failed for ${url} with status: ${res.status}. Response text: ${errorText.substring(0, 200)}`);
              continue;
            }
            const ct = res.headers.get('content-type') || '';
            console.log(`Content-Type for ${url}: ${ct}`);
            if (ct.includes('application/json')) {
              return await res.json();
            }
            const text = await res.text();
            console.warn(`Expected JSON but received Content-Type: ${ct}. Response text: ${text.substring(0, 200)}. Attempting to parse as JSON.`);
            try {
              return JSON.parse(text);
            } catch (parseError) {
              console.error(`Failed to parse text from ${url} as JSON:`, parseError);
              continue;
            }
          } catch (fetchError) {
            console.error(`Fetch error for ${url}:`, fetchError);
            continue;
          }
        }
        throw new Error('数据加载失败: 所有候选路径均不可用');
      };

      const [musicJson, aggregatedJson] = await Promise.all([
        fetchJsonFromCandidates(musicCandidates),
        fetchJsonFromCandidates(aggregatedCandidates)
      ]);

      setMusicData(musicJson);
      const processedData = processAggregatedData(aggregatedJson);
      setAggregatedData(processedData);
      setFetchState(prev => ({ ...prev, loading: false, error: null }));

    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setFetchState(prev => ({
        ...prev,
        error: err.message || '未知数据加载错误',
        retryCount: prev.retryCount + 1,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    // const controller = new AbortController();
    fetchData(); // Removed controller.signal and signal parameter for debugging

    return () => {
      // controller.abort();
    };
  }, []); // Empty dependency array to run once on mount

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