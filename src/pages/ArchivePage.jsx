import React, { useEffect, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';
import WordCloudDisplay from '../components/WordCloudDisplay';

import SpecialCollection from '../components/SpecialCollection';
import MusicSlotMachine from '../components/MusicSlotMachine';
import MouseParticleEffect from '../components/MouseParticleEffect';
import UniverseNavigation from '../components/UniverseNavigation';

import './ArchivePage.css';

const parseDate = (dateString) => {
  const match = dateString.match(/(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2})/);
  if (!match) {
    console.error("日期格式不匹配:", dateString);
    return new Date(); // 返回一个默认日期，避免程序崩溃
  }
  const [year, month, day, hour, minute] = match.slice(1);
  return new Date(year, month - 1, day, hour, minute);
};

const ArchivePage = () => {
  const [musicData, setMusicData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({ artist_counts: {}, style_counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGalaxy, setActiveGalaxy] = useState('artist');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [musicJourneyDays, setMusicJourneyDays] = useState(0);
  const [totalMusicCount, setTotalMusicCount] = useState(0);
  const [uniqueStylesCount, setUniqueStylesCount] = useState(0);
  const [uniqueArtistsCount, setUniqueArtistsCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [musicResponse, aggregatedResponse] = await Promise.all([
          fetch('/data/data.json'),
          fetch('/data/aggregated_data.json')
        ]);

        if (!musicResponse.ok || !aggregatedResponse.ok) {
          throw new Error(`数据加载失败: ${musicResponse.status} ${aggregatedResponse.status}`);
        }

        const [musicJson, aggregatedJson] = await Promise.all([
          musicResponse.json(),
          aggregatedResponse.json()
        ]);

        setMusicData(musicJson);

        // 计算音乐旅程天数
        if (musicJson.length > 0) {
          const firstMusicDate = musicJson.reduce((minDate, currentMusic) => {
            const currentDate = parseDate(currentMusic.date);
            return currentDate < minDate ? currentDate : minDate;
          }, parseDate(musicJson[0].date)); // 初始化为第一个音乐的日期

          const today = new Date();
          const diffTime = Math.abs(today.getTime() - firstMusicDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setMusicJourneyDays(diffDays);

          // 计算总音乐收藏数
          setTotalMusicCount(musicJson.length);

          // 计算唯一音乐风格数
          const uniqueStyles = new Set(musicJson.map(music => music.note).filter(note => note));
          setUniqueStylesCount(uniqueStyles.size);

          // 计算唯一艺术家数
          const uniqueArtists = new Set(musicJson.map(music => music.artist).filter(artist => artist));
          setUniqueArtistsCount(uniqueArtists.size);
        }

        // 合并标签
        const mergedStyle = { ...aggregatedJson.style_counts };
        if (mergedStyle['graphic background music']) {
          mergedStyle['motion'] = (mergedStyle['motion'] || 0) + mergedStyle['graphic background music'];
          delete mergedStyle['graphic background music'];
        }
        aggregatedJson.style_counts = mergedStyle;
        setAggregatedData(aggregatedJson);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 鼠标悬置处理函数
  const handleSectionHover = (section) => {
    setHoveredSection(section);
  };

  const handleSectionLeave = () => {
    setHoveredSection(null);
  };

  const handleArtistClick = (artistName) => {
    console.log(`Artist clicked: ${artistName}`);
    // 可以添加跳转到艺术家详情页或筛选功能
  };

  const handleStyleClick = (styleName) => {
    console.log(`Music style clicked: ${styleName}`);
    // 可以添加跳转到风格详情页或筛选功能
  };

  // 统计卡片数据
  const statsData = [
    { icon: '👂', number: totalMusicCount.toString(), label: `共${totalMusicCount}首音乐收藏`, color: '#ff6b6b' },
    { 
      icon: '🌈', 
      number: uniqueStylesCount > 30 ? '30+' : uniqueStylesCount.toString(), 
      label: uniqueStylesCount > 30 ? '涵盖30+种音乐风格' : `涵盖${uniqueStylesCount}种音乐风格`, 
      color: '#4ecdc4' 
    },
    { icon: '🌟', number: uniqueArtistsCount.toString(), label: `与${uniqueArtistsCount}位艺术家相遇`, color: '#45b7d1' },
    { icon: '📅', number: musicJourneyDays.toString(), label: `跨越${musicJourneyDays}天的音乐旅程`, color: '#96ceb4' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">时光机启动中...</div>
        <div className="loading-subtext">正在加载您的音乐记忆</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">🎵</div>
        <div className="error-text">音乐数据加载失败</div>
        <div className="error-details">{error}</div>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="archive-page">
      <MouseParticleEffect />

      
      {/* 背景星空效果 */}
      <div className="stars-background"></div>
      <div className="gradient-overlay"></div>
      
      {/* 导航栏 */}
      <UniverseNavigation />

      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <h1 className="hero-title">
              <span className="title-accent">2022-2023</span>
              <span className="title-main">音乐时光机</span>
              <span className="title-sub">· 轨迹 ·</span>
            </h1>
            <h2 className="hero-subtitle">
              个人公众号：「D小调片段记录」的音乐分享歌单
            </h2>
          </div>
          
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div 
                key={index}
                className="stat-card"
                onMouseEnter={() => handleSectionHover(`stat-${index}`)}
                onMouseLeave={handleSectionLeave}
                data-hovered={hoveredSection === `stat-${index}`}
              >
                <div 
                  className="stat-icon"
                  style={{ '--icon-color': stat.color }}
                >
                  {stat.icon}
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-glow" style={{ '--glow-color': stat.color }}></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 滚动指示器 */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
          <span>探索更多</span>
        </div>
      </section>

      {/* 音乐词云星系 */}
      <section 
        className="section-container galaxy-section"
        onMouseEnter={() => handleSectionHover('galaxy')}
        onMouseLeave={handleSectionLeave}
        data-hovered={hoveredSection === 'galaxy'}
      >
        <div className="section-header">
          <div className="section-icon">🌠</div>
          <h2 className="section-title">音乐词云星系</h2>
          <p className="section-subtitle">点击探索你的音乐宇宙</p>
        </div>
        
        <div className="galaxy-controls">
          <button
            className={`galaxy-btn ${activeGalaxy === 'artist' ? 'active' : ''}`}
            onClick={() => setActiveGalaxy('artist')}
            onMouseEnter={(e) => e.currentTarget.classList.add('hover')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('hover')}
          >
            <span className="btn-icon">🎤</span>
            <span className="btn-text">艺术家星系</span>
            <span className="btn-glow"></span>
          </button>
          <button
            className={`galaxy-btn ${activeGalaxy === 'style' ? 'active' : ''}`}
            onClick={() => setActiveGalaxy('style')}
            onMouseEnter={(e) => e.currentTarget.classList.add('hover')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('hover')}
          >
            <span className="btn-icon">🎼</span>
            <span className="btn-text">风格星系</span>
            <span className="btn-glow"></span>
          </button>
        </div>

        <div className="wordcloud-container">
          {activeGalaxy === 'artist' && (
            <WordCloudDisplay 
              data={aggregatedData.artist_counts} 
              type="artist"
              maxWords={50}
              onWordClick={handleArtistClick}
            />
          )}
          {activeGalaxy === 'style' && (
            <WordCloudDisplay 
              data={aggregatedData.style_counts} 
              type="style"
              maxWords={50}
              onWordClick={handleStyleClick}
            />
          )}
        </div>
        <div className="section-glow"></div>
      </section>

    

      {/* 特别收藏 */}
      <section 
        className="section-container special-section"
        onMouseEnter={() => handleSectionHover('special')}
        onMouseLeave={handleSectionLeave}
        data-hovered={hoveredSection === 'special'}
      >
        <div className="section-header">
          <div className="section-icon">💫</div>
          <h2 className="section-title">特别收藏</h2>
          <p className="section-subtitle">那些触动心灵的珍贵旋律</p>
        </div>
        <div className="special-collection-container">
          <SpecialCollection musicData={musicData} />
        </div>
        <div className="section-glow"></div>
      </section>


      {/* 音乐专辑老虎机 */}
      <section
        className="section-container music-slot-machine-section"
        onMouseEnter={() => handleSectionHover('music-slot-machine')}
        onMouseLeave={handleSectionLeave}
        data-hovered={hoveredSection === 'music-slot-machine'}
      >
        <div className="section-header">
          <div className="section-icon">🎰</div>
          <h2 className="section-title">音乐专辑随机选</h2>
          <p className="section-subtitle">发现惊喜</p>
        </div>
        <MusicSlotMachine />
        <div className="section-glow"></div>
      </section>

      {/* 页脚 */}
      <footer className="page-footer">
        <div className="footer-content">
          <p className="footer-text">
            <span className="footer-icon">🎵</span>
            音乐让时光有了温度
            <span className="footer-icon">🎵</span>
          </p>
          <div className="footer-decoration">✦ ✦ ✦</div>
          <div className="footer-subtext">感谢每一段旋律的陪伴</div>
        </div>
      </footer>
    </div>
    
  );
};

export default ArchivePage;