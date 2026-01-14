import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as PropTypes from 'prop-types';
import { select } from 'd3-selection';
import 'd3-transition';


import { scaleOrdinal, scaleLinear } from 'd3-scale';
import { schemeTableau10, schemeSet3 } from 'd3-scale-chromatic';
import { color } from 'd3-color';


import './WordCloudDisplay.css';

import logger from '../utils/logger';
const WordCloudDisplay = ({
  type = 'artist',
  data: externalData, // 接收外部传入的数据
  maxWords = 100,
  onWordClick,
  width = 800,
  height = 400
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  // 状态管理
  // 初始 loading 状态取决于是否已经有外部数据传入
  const [isLoading, setIsLoading] = useState(!externalData || Object.keys(externalData).length === 0);
  const [dimensions, setDimensions] = useState({ width, height });
  const [data, setData] = useState(externalData || []); // 优先使用 externalData
  const [layoutData, setLayoutData] = useState([]);
  const [hoveredWord, setHoveredWord] = useState(null);
  
  // 用于防抖的 ref
  const resizeTimeoutRef = useRef();

  // 监听外部数据变化
  useEffect(() => {
    if (externalData && Object.keys(externalData).length > 0) {
      logger.log('Using external data for word cloud');
      setData(externalData);
      setIsLoading(false); // 有数据了，取消 fetch loading（Worker loading 后面会单独处理）
    }
  }, [externalData]);

  // 1. 处理容器尺寸响应式 (通用)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // 保持一定比例，但限制最大高度，同时保证移动端最小高度
        const minHeight = 320;
        setDimensions({
          width: containerWidth,
          height: Math.max(minHeight, Math.min(containerWidth * 0.6, 600)) 
        });
      }
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateDimensions, 150);
    };

    // 初始化尺寸
    updateDimensions();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  // 2. 获取数据 (仅在没有外部数据时)
  useEffect(() => {
    if (externalData && Object.keys(externalData).length > 0) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/aggregated_data.json`, { signal });
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();
        console.log('Fetched data:', jsonData);
        setData(jsonData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('加载数据失败:', error);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [externalData]);

  // 3. 数据清洗与处理 (Memoized)
  const processData = useCallback(() => {
    logger.log('Entering processData: data =', data, 'type =', type);
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      logger.log('processData: data invalid or empty');
      return [];
    }

    let relevantCounts = {};
    if (type === 'artist') {
      // 兼容两种数据结构：全量数据包含 artist_counts 字段，或者 data 本身就是计数对象
      relevantCounts = data.artist_counts || data;
    } else if (type === 'style') {
      relevantCounts = data.style_counts || data;
    }
    
    logger.log('processData: relevantCounts keys =', Object.keys(relevantCounts).length);

    if (Object.keys(relevantCounts).length === 0) return [];

    // 排序并截取
    const sortedData = Object.entries(relevantCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxWords)
      .map(([text, value]) => ({ text, value }));
    
    logger.log('processData: sortedData length =', sortedData.length);

    if (sortedData.length === 0) return [];

    // 字号计算
    const values = sortedData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const minSize = 16;
    const maxSize = 60;

    return sortedData.map(d => ({
      ...d,
      size: minValue === maxValue 
        ? (minSize + maxSize) / 2 
        : minSize + ((d.value - minValue) / (maxValue - minValue)) * (maxSize - minSize)
    }));
  }, [data, maxWords, type]);

  // 4. Worker 布局计算 (修复核心：Worker 在 Effect 内部实例化)
  useEffect(() => {
    // FIX: 正确检查 data 是否为空（兼容数组和对象）
    const isDataEmpty = !data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0);
    if (isDataEmpty) {
       logger.log('WordCloud Effect: Data is empty, returning');
       return;
    }

    logger.log('WordCloud Effect: Starting processing');
    const processedData = processData();
    if (processedData.length === 0) {
      logger.log('WordCloud Effect: processedData is empty');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // FIX: 在此处实例化 Worker，避免顶层调用的 undefined 错误
    // The d3-cloud layout logic is handled within this worker.
    const worker = new Worker(new URL('../workers/wordcloud-layout.worker.js', import.meta.url));

    logger.log('Sending data to worker: processedData length =', processedData.length, 'dimensions =', dimensions);
    worker.postMessage({ 
      data: processedData, 
      dimensions: { width: dimensions.width, height: dimensions.height } 
    });

    worker.onmessage = (e) => {
        logger.log('Data received from worker:', e.data);
        setLayoutData(e.data);
        setIsLoading(false);
      };

    worker.onerror = (e) => {
        logger.error('WordCloud Worker Error:', e);
        setIsLoading(false);
      };

    // 清理函数：组件卸载或依赖变化时终止 worker
    return () => {
      worker.terminate();
      // 确保清理 loading 状态，防止组件卸载后状态更新警告
      // setIsLoading(false); // 注意：React 状态更新在卸载组件上是无操作的，但如果是依赖变化导致重新运行 effect，这行可能多余
    };
  }, [data, dimensions, processData, type]);

  // 6. 超时处理 (防止 Worker 卡死)
  useEffect(() => {
    let timeoutId;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.warn('WordCloud generation timed out.');
        setIsLoading(false);
        // 这里可以设置一个错误状态或者降级显示
      }, 8000); // 8秒超时
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // 5. D3 渲染逻辑
  useEffect(() => {
    if (!svgRef.current || layoutData.length === 0) return;

    const svg = select(svgRef.current);
    
    // 清理旧内容
    svg.selectAll('*').remove();

    // 背景层
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('class', 'wordcloud-background')
      .style('fill', 'rgba(255,255,255,0.01)'); // 确保有鼠标事件响应区域

    // 定义滤镜
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 颜色比例尺
    const colorSchemes = { artist: schemeTableau10, style: schemeSet3 };
    const colorScale = scaleOrdinal(colorSchemes[type] || schemeTableau10);
    
    const maxVal = Math.max(...layoutData.map(d => d.value));
    const brightnessScale = scaleLinear().domain([0, maxVal]).range([0.6, 1.2]);

    const g = svg.append('g');

    const texts = g.selectAll('text')
      .data(layoutData)
      .enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', d => `${d.size}px`)
      .style('font-family', "'Segoe UI', 'Microsoft YaHei', sans-serif")
      .style('font-weight', d => 400 + (d.value / maxVal) * 400)
      .style('fill', d => {
         const c = color(colorScale(d.text));
         return c ? c.brighter(brightnessScale(d.value)).toString() : '#333';
      })
      .attr('transform', d => `rotate(${d.rotation || 0}, ${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .style('opacity', 0) // 初始透明，用于动画
      // 交互属性
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', d => `${d.text}，出现${d.value}次`)
      .text(d => d.text);

    // 事件绑定
    texts
      .on('mouseover', function(event, d) {
        // D3 v6+ event 是第一个参数
        select(this)
          .transition().duration(200)
          .style('filter', 'url(#glow)')
          .attr('font-size', `${d.size * 1.1}px`) // 微微放大
          .style('z-index', 100);
        
        setHoveredWord(d);
      })
      .on('mouseout', function(event, d) {
        select(this)
          .transition().duration(200)
          .style('filter', 'none')
          .attr('font-size', `${d.size}px`)
          .style('z-index', 1);
        
        setHoveredWord(null);
      })
      .on('click', (event, d) => {
        if (onWordClick) onWordClick(d.text);
      })
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (onWordClick) onWordClick(d.text);
        }
      });

    // 入场动画
    texts.transition()
      .duration(800)
      .delay((d, i) => i * 15)
      .style('opacity', d => d.opacity || 1);

  }, [layoutData, dimensions, type, onWordClick]);

  // 渲染逻辑
  return (
    <div className="wordcloud-display" ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
      
      {/* Loading 状态 */}
      {isLoading && (
        <div className="wordcloud-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">正在生成词云星系...</div>
        </div>
      )}

      {/* 主要内容区 */}
      <svg
        ref={svgRef}
        className="wordcloud-svg"
        width={dimensions.width}
        height={dimensions.height}
        style={{ 
          overflow: 'visible',
          opacity: isLoading && layoutData.length === 0 ? 0 : 1, // Only hide if loading AND no data
          transition: 'opacity 0.3s ease'
        }} 
      />

      {/* Tooltip (绝对定位) */}
      {hoveredWord && (
        <div 
          className="wordcloud-tooltip"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            pointerEvents: 'none', // 避免遮挡鼠标事件
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <strong>{hoveredWord.text}</strong>
          <div style={{ fontSize: '0.85em', opacity: 0.8 }}>出现次数: {hoveredWord.value}</div>
        </div>
      )}
    </div>
  );
};

WordCloudDisplay.propTypes = {
  type: PropTypes.oneOf(['artist', 'style']),
  maxWords: PropTypes.number,
  onWordClick: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number
};

export default React.memo(WordCloudDisplay);