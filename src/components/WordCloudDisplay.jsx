import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import './WordCloudDisplay.css'; // 依赖更新后的 CSS

// 创建词云布局 Worker
const cloudWorker = new Worker(new URL('../workers/wordcloud-layout.js', import.meta.url));

const WordCloudDisplay = ({
  type = 'artist',
  maxWords = 100, // 优化：根据需求将默认值从 60 调整为 100
  onWordClick,
  width = 800,
  height = 400
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width, height });
  const [data, setData] = useState([]);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [layoutData, setLayoutData] = useState([]);
  const resizeTimeoutRef = useRef();

  // 防抖的尺寸调整
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setDimensions({
          width: containerWidth,
          height: Math.min(containerWidth * 0.6, 500)
        });
      }
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateDimensions, 150);
    };

    updateDimensions(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      // 清理 D3 引用
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
    };
  }, []);

  // 动态加载数据 (无变动)
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + '/data/data.json', { signal });
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('加载数据失败:', error);
        }
      } finally {
        // setIsLoading(false); // 移动到词云渲染完成后
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  // 处理词云数据 (优化字号)
  const processData = useCallback(() => {
    if (!data || !Array.isArray(data)) return [];

    // 统计词频
    const wordCount = {};
    data.forEach(item => {
      let text;
      if (type === 'artist') {
        text = item.artist.split('/')[0]
          .replace(/[()（）]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        text = item.note
          .replace(/[,，、]/g, ' ')
          .split(/\s+/)
          .filter(tag => tag.length > 1)[0] || '';
      }

      if (text) {
        wordCount[text] = (wordCount[text] || 0) + 1;
      }
    });

    // 排序并限制数量
    const sortedData = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxWords)
      .map(([text, value]) => ({ text, value }));

    // 计算字体大小范围 - 增加大小差异对比度
    const values = sortedData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // 优化：根据需求调整字号范围
    const minSize = 16;
    const maxSize = 60; // 统一最大字号为 60

    return sortedData.map(d => ({
      ...d,
      size: minSize + ((d.value - minValue) / (maxValue - minValue)) * (maxSize - minSize)
    }));
  }, [data, maxWords, type]);

  // 使用 Web Worker 进行布局计算
  useEffect(() => {
    if (!data.length) return;

    const processedData = processData();
    if (processedData.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    cloudWorker.postMessage({ data: processedData, dimensions });

    cloudWorker.onmessage = (e) => {
      setLayoutData(e.data);
      setIsLoading(false);
    };

    return () => {
      cloudWorker.onmessage = null;
    };
  }, [data, dimensions, processData]);

  // 生成词云 (优化背景)
  useEffect(() => {
    if (!svgRef.current || !layoutData.length) return;

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);
    svg.selectAll('*').remove();

    // 添加透明毛玻璃背景
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('class', 'wordcloud-background');

    const g = svg.append('g');

    // 颜色方案 - 更丰富的色彩 (无变动)
    const colorSchemes = {
      artist: d3.schemeTableau10,
      style: d3.schemeSet3
    };
    const colorScale = d3.scaleOrdinal(colorSchemes[type]);
    const brightnessScale = d3.scaleLinear()
      .domain(d3.extent(layoutData, d => d.value))
      .range([0.6, 1.2]);
    // 根据频率调整亮度

    // 绘制词云 (交互无变动)
    const texts = g.selectAll('text')
      .data(layoutData)
      .enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', d => `${d.size}px`)
      .attr('fill', d => {
        const baseColor = colorScale(d.text);
        return d3.color(baseColor).brighter(brightnessScale(d.value));
      })
      .attr('transform', d => `rotate(${d.rotation}, ${d.x}, ${d.y})`) // rotation 已在 layout 中设为 0
      .style('font-weight', d => 400 + (d.value / Math.max(...layoutData.map(w => w.value))) * 400)
      .style('cursor', 'pointer')
      .style('opacity', d => d.opacity)
      .style('font-family', "'Segoe UI', 'Microsoft YaHei', sans-serif")
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.1)')
      .attr('tabindex', 0) // 添加 tabindex
      .attr('role', 'button') // 添加 role
      .attr('aria-label', (d, i) => `${d.text}，出现${d.value}次`) // 添加 aria-label
      .attr('aria-describedby', (d, i) => `desc-${i}`) // 添加 aria-describedby
      .text(d => d.text)
      .each(function(d, i) { // 为每个 text 元素添加 title
        d3.select(this).append('title').attr('id', `desc-${i}`).text('按回车键或空格键选择此词汇');
      })
      .on('mouseover', function(event, d) {
        setHoveredWord(d);
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'url(#glow)')
          .style('z-index', 100);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'none')
          .style('z-index', 1);
      })
      .on('click', (event, d) => {
        if (onWordClick) onWordClick(d.text);
      })
      .on('keydown', function(event, d) { // 添加键盘事件处理
        if (event.key === 'Enter' || event.key === ' ') {
          if (onWordClick) onWordClick(d.text);
        }
      });

    // 优化：在需要时才创建 defs
    const defs = svg.append('defs');

    // 添加发光效果滤镜 (无变动)
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 添加动画效果 (无变动)
    texts
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 20)
      .style('opacity', d => d.opacity);
  }, [layoutData, dimensions, type, onWordClick]);

  if (isLoading) {
    return (
      <div className="wordcloud-loading" ref={containerRef}>
        <div className="loading-spinner"></div>
        <div className="loading-text">正在生成词云星系...</div>
      </div>
    );
  }

  return (
    <div className="wordcloud-display" ref={containerRef}>
      {type === 'style' ? (
        <img 
          src={`${process.env.PUBLIC_URL}/optimized-images/musicstyle-cloud2.webp`} 
          alt="Music Style Word Cloud" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      ) : (
        <svg
          ref={svgRef}
          className="wordcloud-svg"
          width={dimensions.width}
          height={dimensions.height}
          role="img"
          aria-label={`${type}词云，包含${layoutData.length}个词汇`}
          aria-describedby="wordcloud-desc"
        >
          <title id="wordcloud-desc">
            交互式词云图，点击词汇可以执行相关操作
          </title>
        </svg>
      )}
      {hoveredWord && (
        <div className="wordcloud-tooltip">
          <strong>{hoveredWord.text}</strong>
          <br />
          出现次数: {hoveredWord.value}
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
export default WordCloudDisplay;