import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { UniverseContext } from '../UniverseContext';

// --- 辅助函数 ---

/**
 * 验证主音乐数据格式，确保它是一个数组。
 * @param {any} data - 待验证的数据。
 * @returns {Array} - 经验证的数据数组或空数组。
 */
const validateMusicData = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  console.error("Invalid music data format, expected an array.", data);
  return [];
};

/**
 * 验证和处理聚合数据格式。
 * @param {any} data - 待验证的聚合数据。
 * @returns {Object} - 经验证的聚合数据对象或默认对象。
 */
const processAggregatedData = (data) => {
  const defaultData = { artist_counts: {}, style_counts: {} };
  
  if (
    data && 
    typeof data === 'object' && 
    data.artist_counts && 
    data.style_counts &&
    typeof data.artist_counts === 'object' &&
    typeof data.style_counts === 'object'
  ) {
    return data;
  }
  
  console.warn("Invalid or incomplete aggregated data format. Using default empty object.", data);
  return defaultData;
};

/**
 * 标准化和拆分标签。
 * @param {string} note - 原始标签字符串。
 * @returns {string[]} - 标准化后的标签数组。
 */
const normalizeAndSplitTags = (note) => {
  if (!note) return [];

  const tagAliases = {
    '原声带': '原声',
    'OST': '原声',
    'Soundtrack': '原声',
    '电子': '电子乐',
    '电音': '电子乐',
    '游戏': '游戏音乐',
    'Game': '游戏音乐',
  };

  // 拆分标签并进行标准化
  const tags = note.split(/\s*[,;/\\|]\s*|\s+and\s+/i)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => tagAliases[tag] || tag);

  return [...new Set(tags)]; // 返回唯一的标签
};

// --- 自定义 Hook ---

const useMusicData = () => {
  const { globalMusicCache, setGlobalMusicCache } = useContext(UniverseContext);
  const [musicData, setMusicData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({ artist_counts: {}, style_counts: {} });
  const [tagCounts, setTagCounts] = useState({});
  // 使用 useRef 存储标签关系，因为它不需要触发组件重新渲染
  const tagRelationshipsRef = useRef(new Map()); 
  const [fetchState, setFetchState] = useState({
    loading: true,
    error: null,
    retryCount: 0,
    lastSuccessfulFetch: null,
  });

  const fetchData = useCallback(async (signal) => {
    // Check cache first
    if (globalMusicCache && globalMusicCache.musicData.length > 0) {
      setMusicData(globalMusicCache.musicData);
      setAggregatedData(globalMusicCache.aggregatedData);
      setTagCounts(globalMusicCache.tagCounts);
      tagRelationshipsRef.current = globalMusicCache.tagRelationships;
      
      setFetchState(prev => ({
        ...prev,
        loading: false,
        error: null,
        lastSuccessfulFetch: globalMusicCache.timestamp
      }));
      return;
    }

    try {
      setFetchState(prev => ({ ...prev, loading: true, error: null }));

      const base = process.env.PUBLIC_URL || '';
      
      // Deduplicate candidates
      const getCandidates = (filename) => {
        const candidates = [`${base}/data/${filename}`];
        if (base && !candidates.includes(`/data/${filename}`)) {
             candidates.push(`/data/${filename}`);
        }
        return [...new Set(candidates)];
      };

      const musicCandidates = getCandidates('data.json');
      const aggregatedCandidates = getCandidates('aggregated_data.json');

      /**
       * 尝试从多个 URL 候选列表中获取 JSON 数据，直到成功为止。
       */
      const fetchJsonFromCandidates = async (candidates, options = {}) => {
        const { timeout = 5000 } = options; // Reduced timeout from 8000 to 5000
        
        for (const url of candidates) {
          try {
            // 为每个请求设置单独的 AbortController 以实现超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            // 将外部 signal 与内部 controller.signal 结合，但在这里简化处理，直接使用内部 controller
            const res = await fetch(url, { 
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              throw new Error(`期望JSON响应，但收到: ${contentType}`);
            }
            
            return await res.json();
          } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
              console.warn(`获取 ${url} 超时或被外部取消:`, fetchError.message);
              // 如果是超时导致的 AbortError，抛出错误以防止继续尝试下一个候选
              if (!signal?.aborted) {
                // 仅在非外部取消的情况下，记录超时警告
                console.warn(`请求 ${url} 超时。`);
              }
              // 如果是外部取消，直接跳出函数
              throw fetchError; 
            }
            console.warn(`获取 ${url} 失败，尝试下一个候选:`, fetchError.message);
            continue; // 继续尝试下一个候选
          }
        }
        
        // 所有候选都失败后抛出错误
        const error = new Error('所有数据源都不可用');
        error.type = 'NETWORK_ERROR';
        error.retryable = true;
        throw error;
      };

      // 并行获取两种数据
      const [musicJson, aggregatedJson] = await Promise.all([
        fetchJsonFromCandidates(musicCandidates),
        fetchJsonFromCandidates(aggregatedCandidates)
      ]);

      // 检查是否被外部 signal 取消
      if (signal?.aborted) {
        return;
      }
      
      // 验证和处理主数据
      const rawMusicData = validateMusicData(musicJson);
      
      // 预先计算 3D 坐标以减少 MusicUniverse 挂载时的计算量
      // 利用种子随机或简单映射确保在同一次会话中位置一致
      const processedMusicData = rawMusicData.map(item => {
        if (!item.position) {
          const x = (Math.random() - 0.5) * 20;
          const y = (Math.random() - 0.5) * 20;
          const z = (Math.random() - 0.5) * 20;
          return { ...item, position: [x, y, z] };
        }
        return item;
      });

      setMusicData(processedMusicData);

      // 计算标签统计和关系
      const counts = {};
      const relationships = new Map();

      processedMusicData.forEach((item) => {
        const itemTags = normalizeAndSplitTags(item.note);
        item.tags = itemTags;
        if (itemTags.length === 0) return;

        itemTags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;

          if (!relationships.has(tag)) {
            relationships.set(tag, new Set());
          }
          
          itemTags.forEach(otherTag => {
            if (tag !== otherTag) {
              relationships.get(tag).add(otherTag);
            }
          });
        });
      });
      
      setTagCounts(counts);
      tagRelationshipsRef.current = relationships;


      // 处理聚合数据
      const processedAggregatedData = processAggregatedData(aggregatedJson);
      setAggregatedData(processedAggregatedData);
      
      // 成功状态更新
      setFetchState(prev => ({
        ...prev,
        loading: false,
        error: null,
        lastSuccessfulFetch: new Date().toISOString(),
      }));

      // Update global cache
      setGlobalMusicCache({
        musicData: processedMusicData,
        aggregatedData: processedAggregatedData,
        tagCounts: counts,
        tagRelationships: relationships,
        timestamp: new Date().toISOString()
      });

    } catch (err) {

      // 如果是取消请求（外部 signal 或内部超时），不更新状态
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error('数据加载失败:', err);
      
      // 失败状态更新
      setFetchState(prev => ({
        ...prev,
        error: {
          message: err.message || '未知数据加载错误',
          type: err.type || 'UNKNOWN_ERROR',
          retryable: err.retryable !== false, // 默认为可重试
          timestamp: new Date().toISOString(),
        },
        retryCount: prev.retryCount + 1,
        loading: false,
      }));
    }
  }, [globalMusicCache, setGlobalMusicCache]);

  useEffect(() => {
    // 使用 AbortController 管理整个 useEffect 的生命周期
    const controller = new AbortController();

    const loadData = async () => {
      // fetchData 内部会处理自己的 try/catch，并设置状态
      await fetchData(controller.signal);
    };

    loadData();

    // 清理函数：组件卸载或依赖项改变时，取消未完成的请求
    return () => {
      controller.abort();
    };
  }, [fetchData]);

  /**
   * 重新获取数据的函数，并返回一个清理函数以取消该次重试请求。
   */
  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return {
    // 移除了冗余的默认值检查，因为 useState 已经初始化了它们
    musicData,
    aggregatedData,
    tagCounts,
    tagRelationships: tagRelationshipsRef.current,
    loading: fetchState.loading,
    error: fetchState.error,
    retryCount: fetchState.retryCount,
    lastSuccessfulFetch: fetchState.lastSuccessfulFetch,
    refetch,
  };
};

export default useMusicData;