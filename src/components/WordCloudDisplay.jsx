import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import './WordCloudDisplay.css'; // 依赖更新后的 CSS

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

// 响应式调整尺寸 (无变动)
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

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => 
window.removeEventListener('resize', updateDimensions);
  }, []);

  // 动态加载数据 (无变动)
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      try {
        const response = await fetch('/data/data.json', { signal });
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        } else {
          console.error('加载数据失败:', error);
        }
      } finally {
        setIsLoading(false);
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

  // 生成更自然的词云布局 (优化旋转)
  const generateWordCloudLayout = useCallback((processedData, dimensions) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
  
    // 使用力导向模拟创建更自然的分布
    const simulation = d3.forceSimulation(processedData)
      .force('charge', d3.forceManyBody().strength(20)) // 进一步增加排斥力
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(d => d.size * 1.8)) // 进一步增大碰撞半径
      .force('x', d3.forceX(centerX).strength(0.3)) // 进一步增加水平居中力
      .force('y', d3.forceY(centerY).strength(0.3)) // 进一步增加垂直居中力
      .stop();
  
    // 运行模拟（增加迭代次数）
    for (let i = 0; i < 200; ++i) simulation.tick();
  
    return processedData.map((d, i) => ({
      ...d,
      x: d.x || centerX + (Math.random() - 0.5) * dimensions.width * 0.8,
      y: d.y || centerY + (Math.random() - 0.5) * dimensions.height * 0.8,
      rotation: 0,
      opacity: 0.9 + Math.random() * 0.1
    }));
  }, []);

// 生成词云 (优化背景)
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    const processedData = processData();
    if (processedData.length === 0) {
      setIsLoading(false);
      return;
    }

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

 // 生成布局
    const layoutData = generateWordCloudLayout(processedData, dimensions);

    // 颜色方案 - 更丰富的色彩 (无变动)
    const colorSchemes = {
      artist: d3.schemeTableau10,
      style: d3.schemeSet3
    };
const colorScale = d3.scaleOrdinal(colorSchemes[type]);
    const brightnessScale = d3.scaleLinear()
      .domain(d3.extent(processedData, d => d.value))
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
      .style('font-weight', d => 400 + (d.value / Math.max(...processedData.map(w => w.value))) * 400)
      .style('cursor', 'pointer')
      .style('opacity', d => d.opacity)
      .style('font-family', "'Segoe UI', 'Microsoft YaHei', sans-serif")
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.1)')
      .text(d => d.text)
      .on('mouseover', function(event, d) {
        setHoveredWord(d);
     d3.select(this)
          .transition()
          .duration(200)
          // .attr('font-size', d.size * 1.3) // 移除缩放效果
          .style('filter', 'url(#glow)')
          .style('z-index', 100);
})
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          // .attr('font-size', d.size) // 移除缩放效果
          .style('filter', 'none')
          .style('z-index', 1);
      })
      .on('click', (event, d) => {
        if (onWordClick) onWordClick(d.text);
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
setIsLoading(false);
  }, [data, dimensions, processData, type, generateWordCloudLayout, onWordClick]);

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
          src="/images/music_style_wordcloud.png" 
          alt="Music Style Word Cloud" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      ) : (
        <svg 
          ref={svgRef} 
          className="wordcloud-svg"
          width={dimensions.width} 
          height={dimensions.height}
        />
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