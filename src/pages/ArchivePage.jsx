import React, { useEffect, useState, useRef, Suspense } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import useMusicData from '../hooks/useMusicData'; // Import useMusicData hook
import WordCloudDisplay from '../components/WordCloudDisplay';

import { Link, useLocation } from 'react-router-dom';


import SpecialCollection from '../components/SpecialCollection';
import MusicSlotMachine from '../components/MusicSlotMachine';
import MouseParticleEffect from '../components/MouseParticleEffect';
import StarBackground from '../components/StarBackground';
import UniverseNavigation from '../components/UniverseNavigation';
import MusicPlayer from '../components/MusicPlayer'; // Import MusicPlayer

import './ArchivePage.css';

const parseDate = (dateString) => {
  if (typeof dateString !== 'string' || !dateString) {
    console.error("日期格式不匹配：传入的日期字符串无效或为空", dateString);
    return new Date(); // 返回一个默认日期，避免程序崩溃
  }
  const match = dateString.match(/(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2})/);
  if (!match) {
    console.error("日期格式不匹配，原始字符串:", dateString);
    return new Date(); // 返回一个默认日期，避免程序崩溃
  }
  const [year, month, day, hour, minute] = match.slice(1);
  return new Date(year, month - 1, day, hour, minute);
};

const ArchivePage = () => {
  const { musicData, aggregatedData, loading, error } = useMusicData(); // Use the custom hook
  const [activeGalaxy, setActiveGalaxy] = useState('artist');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [musicJourneyDays, setMusicJourneyDays] = useState(0);
  const [totalMusicCount, setTotalMusicCount] = useState(0);
  const [uniqueStylesCount, setUniqueStylesCount] = useState(0);
  const [uniqueArtistsCount, setUniqueArtistsCount] = useState(0);
  const location = useLocation();
  const isMobile = useIsMobile();

  const [isPlaying, setIsPlaying] = useState(true); // New state for music playback
  const audioRef = useRef(null); // Ref for the audio element
  const [showBackToTopButton, setShowBackToTopButton] = useState(false); // State for back to top button visibility

  // Effect to play/pause music when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        } else {
          audioRef.current.pause();
        }
    }
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // Effect to handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) { // Show button after scrolling down 300px
        setShowBackToTopButton(true);
      } else {
        setShowBackToTopButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    document.documentElement.classList.add('custom-scrollbar-page-active');
    return () => {
      document.documentElement.classList.remove('custom-scrollbar-page-active');
    };
  }, []);

  useEffect(() => {
    if (musicData.length > 0) {
      const firstMusicDate = musicData.reduce((minDate, currentMusic) => {
        const currentDate = currentMusic.date ? parseDate(currentMusic.date) : new Date();
        return currentDate < minDate ? currentDate : minDate;
      }, musicData[0].date ? parseDate(musicData[0].date) : new Date());

      const today = new Date();
      const diffTime = Math.abs(today.getTime() - firstMusicDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setMusicJourneyDays(diffDays);
      setTotalMusicCount(musicData.length);

      const uniqueStyles = new Set(musicData.map(music => music.note).filter(note => note));
      setUniqueStylesCount(uniqueStyles.size);

      const uniqueArtists = new Set(musicData.map(music => music.artist).filter(artist => artist));
      setUniqueArtistsCount(uniqueArtists.size);
    }
  }, [musicData]);

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

      {/* Music Player */}
      <audio ref={audioRef} loop preload="auto">
        <source src={process.env.PUBLIC_URL + "/audio/Preview_Yotto-_Lone_Machine.ogg"} type="audio/ogg" />
        您的浏览器不支持音频播放。
      </audio>
      <MusicPlayer
        isPlaying={isPlaying}
        onTogglePlayPause={togglePlayPause}
        songTitle="Lone Machine"
        artistName="Yotto (Preview)"
      />

      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <div className="hero-title">
              <h2 className="title-main">音乐时光机</h2>
              <span className="title-sub"> 2022-2023·轨迹 </span>
            </div>
            <span className="hero-subtitle">
              个人公众号：「D小调片段记录」的音乐分享歌单
            </span>
          </div>
          
          <div className="stats-grid">
            {statsData.map((stat) => (
              <div 
                key={stat.label}
                className="stat-card"
                onMouseEnter={() => handleSectionHover(`stat-${stat.label}`)}
                onMouseLeave={handleSectionLeave}
                data-hovered={hoveredSection === `stat-${stat.label}`}
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
            onMouseLeave={(e) => e.currentTarget.classList.remove('hover')}
          >
            <span className="btn-icon">🎼</span>
            <span className="btn-text">风格星系</span>
            <span className="btn-glow"></span>
          </button>
        </div>

        <div className="wordcloud-container">
          {activeGalaxy === 'artist' && (
            <Suspense fallback={<div>加载词云中...</div>}>
              <WordCloudDisplay 
                data={aggregatedData.artist_counts} 
                type="artist"
                maxWords={50}
                onWordClick={handleArtistClick}
              />
            </Suspense>
          )}
          {activeGalaxy === 'style' && (
            <Suspense fallback={<div>加载词云中...</div>}>
              <WordCloudDisplay 
                data={aggregatedData.style_counts} 
                type="style"
                maxWords={50}
                onWordClick={handleStyleClick}
              />
            </Suspense>
          )}
        </div>

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
      <div className="footer"> 
        <div className="footer-content"> 
          <div className="footer-section">
            <p><strong>🎵 Music Universe</strong></p>
            <p>网站设计、代码实现与用户体验由「D小调片段记录」公众号作者与AI技术共同打造</p>
          </div>
          <div className="footer-section">    
          </div>
          <div className="footer-section">
            <p className="disclaimer">
              本网站仅作为个人音乐收藏的可视化展示与技术探索，非商业用途。<br />
              所有音乐专辑封面、艺术家名称及音频试听片段版权归其合法所有者所有。<br />
              如有侵权，请联系公众号「D小调片段记录」删除。
            </p>
            <p>感谢每一段旋律的陪伴</p>
            <p>© 2025 音乐歌单可视化探索</p>
          </div>
        </div> 
      </div>

      {showBackToTopButton && (
        <button className={`back-to-top-btn ${showBackToTopButton ? 'show' : ''}`} onClick={scrollToTop} aria-label="返回顶部">
            ↑返回顶部
          </button>
      )}
    </div>
  );
};

export default ArchivePage;
