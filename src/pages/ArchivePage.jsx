import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import useIsMobile from '../hooks/useIsMobile';
import useMusicData from '../hooks/useMusicData'; // Import useMusicData hook

import SpecialCollection from '../components/SpecialCollection';
import MusicSlotMachine from '../components/MusicSlotMachine';
import MouseParticleEffect from '../components/MouseParticleEffect';
import UniverseNavigation from '../components/UniverseNavigation';
import MusicPlayer from '../components/MusicPlayer'; // Import MusicPlayer
import TerminalText from '../components/TerminalText';
import PageIndicator from '../components/PageIndicator'; // Import PageIndicator

import './ArchivePage.css';
import NetEaseCloudMusicIcon from '../assets/icons/netcloud-icon.webp';
import WeChatIcon from '../assets/icons/wechat-icon.webp';

const WeChatQRCode = process.env.PUBLIC_URL + '/images/wechat-qrcode.png';
const WordCloudDisplay = lazy(() => import('../components/WordCloudDisplay'));

const terminalLines = [
  "> Establishing connection...",
  "> Accessing memory archives...",
  "> Syncing timeline data...",
  "> 403+ records found.",
  "--------------------------------",
  "正在回溯音乐时空...",
  "解析听歌记录...",
  "重构旋律坐标...",
  "> Archive System Ready."
];

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
  // Removed hoveredSection state for performance
  const [musicJourneyDays, setMusicJourneyDays] = useState(0);
  const [totalMusicCount, setTotalMusicCount] = useState(0);
  const [uniqueStylesCount, setUniqueStylesCount] = useState(0);
  const [uniqueArtistsCount, setUniqueArtistsCount] = useState(0);
  const isMobile = useIsMobile();

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false); // Default to false for performance
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null); // Ref for the audio element
  const [showBackToTopButton, setShowBackToTopButton] = useState(false); // State for back to top button visibility

  // Page navigation anchor configuration
  const pageSections = [
    { id: 'hero', label: '时光机' },
    { id: 'galaxy', label: '词云星系' },
    { id: 'special', label: '特别收藏' },
    { id: 'music-slot-machine', label: '随机选' }
  ];

  // Effect to play/pause music when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
          // User interaction required policy might block this initially, handled by catch
          audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        } else {
          audioRef.current.pause();
        }
    }
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      const newVolume = 0.5;
      setVolume(newVolume);
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = newVolume;
    } else {
      setVolume(0);
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Effect to handle scroll for back to top button with throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.pageYOffset > 300) {
            setShowBackToTopButton(true);
          } else {
            setShowBackToTopButton(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    { icon: <span className="emoji-icon">👂</span>, number: totalMusicCount.toString(), label: `共${totalMusicCount}首音乐收藏`, color: 'var(--accent-rose)' },
    { 
      icon: <span className="emoji-icon">🌈</span>, 
      number: uniqueStylesCount > 30 ? '30+' : uniqueStylesCount.toString(), 
      label: uniqueStylesCount > 30 ? '涵盖30+种音乐风格' : `涵盖${uniqueStylesCount}种音乐风格`, 
      color: 'var(--accent-cyan)' 
    },
    { icon: <span className="emoji-icon">🌟</span>, number: uniqueArtistsCount.toString(), label: `与${uniqueArtistsCount}位艺术家相遇`, color: 'var(--accent-violet)' },
    { icon: <span className="emoji-icon">📅</span>, number: musicJourneyDays.toString(), label: `跨越${musicJourneyDays}天的音乐旅程`, color: 'var(--accent-amber)' }
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
        <div className="error-icon"><span className="emoji-icon">🎵</span></div>
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

      {/* Background Terminal Effect (Desktop Only) */}
      {!isMobile && (
        <div className="fixed bottom-8 left-8 z-0 opacity-40 pointer-events-none select-none mix-blend-screen">
          <TerminalText lines={terminalLines} speed={40} className="w-64 h-auto max-h-48 border-none bg-transparent shadow-none text-[10px] text-sky-400/60" />
        </div>
      )}

      

      {/* 导航栏 */}
      <UniverseNavigation />

      {/* 侧边时间轴导航 */}
      <PageIndicator sections={pageSections} />

      {/* Music Player */}
      <audio 
        ref={audioRef} 
        loop 
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={process.env.PUBLIC_URL + "/audio/Preview_Yotto-_Lone_Machine.ogg"} type="audio/ogg" />
        您的浏览器不支持音频播放。
      </audio>
      <MusicPlayer
        isPlaying={isPlaying}
        onTogglePlayPause={togglePlayPause}
        songTitle="Lone Machine"
        artistName="Yotto (Preview)"
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onSeek={handleSeek}
      />

      {/* 英雄区域 */}
      <section id="hero" className="hero-section">
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
        id="galaxy"
        className="section-container galaxy-section"
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
        id="special"
        className="section-container special-section"
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
        id="music-slot-machine"
        className="section-container music-slot-machine-section"
      >
        <div className="section-header">
          <div className="section-icon">🎰</div>
          <h2 className="section-title">音乐专辑随机选</h2>
          <p className="section-subtitle">发现惊喜</p>
        </div>
        <MusicSlotMachine />
        <div className="section-glow"></div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>🎵 Music Universe</p>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>网站设计、代码实现与用户体验由 MagiccoAI & 「D小调片段记录」公众号作者与 AI 技术共同打造</p>
          </div>
          
          <div className="footer-section">
            <div className="disclaimer" style={{ opacity: 0.7, fontSize: '0.85rem', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '0.5rem' }}><strong>免责声明：</strong></p>
              本网站仅作为个人音乐收藏的可视化展示与技术探索，非商业用途。<br />
              所有音乐专辑封面、艺术家名称及音频试听片段版权归其合法所有者所有。<br />
              如有侵权，请联系
              <span className="group relative inline-block cursor-help" style={{ color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(0, 242, 234, 0.3)' }}>
                公众号「D小调片段记录」
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none">
                  <img src={WeChatQRCode} alt="公众号二维码" className="w-full h-auto rounded-lg"/>
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                 
                </div>
              </span>
              删除。
            </div>
            <div style={{ marginTop: '1.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
              <p>感谢每一段旋律的陪伴</p>
              <p>© 2025 MagiccoAI & D小调片段记录. All Rights Reserved.</p>
            </div>
          </div>

          <div className="footer-section items-end">
            <div className="flex gap-6 mt-6">
                {/* NetEase */}
                <a 
                  href="https://music.163.com/playlist?id=14356909162&uct2=U2FsdGVkX1/gFqE4/o/Ao72aJFZQeOfU4v1DPeNGiAE="
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 group-hover:border-red-500/30 group-hover:scale-110 transition-all duration-300">
                    <img src={NetEaseCloudMusicIcon} alt="网易云" className="w-5 h-5 opacity-70 group-hover:opacity-100"/>
                  </div>
                  <span className="text-[10px] text-gray-500 group-hover:text-red-400 transition-colors">网易云歌单</span>
                </a>

                {/* WeChat */}
                <a 
                  href="https://mp.weixin.qq.com/s/P-UimdNlkT5cUGt572dBAQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 group-hover:border-green-500/30 group-hover:scale-110 transition-all duration-300">
                    <img src={WeChatIcon} alt="微信" className="w-5 h-5 opacity-70 group-hover:opacity-100"/>
                  </div>
                  <span className="text-[10px] text-gray-500 group-hover:text-green-400 transition-colors">公众号</span>
                  
                  {/* QR Code Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-2 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
                    <img src={WeChatQRCode} alt="公众号二维码" className="w-full h-auto rounded-lg"/>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                    <p className="text-[10px] text-gray-800 text-center mt-1 font-bold">扫码关注</p>
                  </div>
                </a>

                {/* GitHub */}
                <a 
                  href="https://github.com/magiccoai/my-music-universe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 group-hover:border-gray-400/30 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.087-.75.075-.735.075-.735 1.2.09 1.83 1.245 1.83 1.245 1.065 1.815 2.805 1.29 3.495.99.105-.78.42-1.29.765-1.59-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">项目源码</span>
                </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArchivePage;
