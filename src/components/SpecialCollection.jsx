import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SpecialCollectionCSS from './SpecialCollection.css';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import useIsMobile from '../hooks/useIsMobile';
import useWindowOrientation from '../hooks/useWindowOrientation';
import AudioPreview from './AudioPreview';
import useMusicData from '../hooks/useMusicData';

function SpecialCollection() {
  const { musicData: allMusicData, loading: isLoading, error } = useMusicData();
  const isMobile = useIsMobile();
  const orientation = useWindowOrientation();
  const [activeTab, setActiveTab] = useState('featured');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const colors = [
    'rgba(255, 87, 51, 0.15)',
    'rgba(51, 255, 87, 0.15)',
    'rgba(51, 87, 255, 0.15)',
    'rgba(255, 51, 246, 0.15)',
    'rgba(246, 255, 51, 0.15)',
    'rgba(51, 246, 255, 0.15)'
  ];

  const borderColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F6', '#F6FF33', '#33F6FF'];
  
  // 音乐报告图片数据 (使用 useMemo 保持引用稳定，避免不必要的重渲染)
  const musicReports = useMemo(() => [
    { id: 1, name: "音乐报告1" },
    { id: 2, name: "音乐报告2" },
    { id: 3, name: "音乐报告3" },
    { id: 4, name: "音乐报告4" },
    { id: 5, name: "音乐报告5" },
    { id: 6, name: "音乐报告6" },
    { id: 7, name: "音乐报告7" },
    { id: 8, name: "音乐报告8" }
  ], []);

  const [featuredAlbums, setFeaturedAlbums] = useState([
    // ... 您原有的专辑数据保持不变
    {
      id: 140,
      music: "Se É Pra Vir Que Venha(让它来吧)",
      artist: "Christopher Tin/ Dulce Pontes",
      album: "Calling All Dawns",
      cover: "covers/140.png",
      isPlaying: false,
      url: "https://archive.org/details/callingalldawns/callingalldawns/04+Se+E+Pra+Vir+Que+Venha+(feat.+Dulce+Pontes).dts",
    },
    {
      id: 145,
      music: "Hamsafar\n一起旅行",
      artist: "Christopher Tin",
      album: "Calling All Dawns",
      cover: "covers/145.png",
      isPlaying: false,
      url: "https://archive.org/details/callingalldawns/callingalldawns/04+Se+E+Pra+Vir+Que+Venha+(feat.+Dulce+Pontes).dts",
    },
    {
      id: 158,
      music: "—エンディング—世界の約束～人生のメリーゴーランド\n结局——世界的约定~人生的马里兰",
      artist: "倍賞千恵子\nChieko Baisho",
      album: "ハウルの動く城 サウンドトラック(动画电影《哈尔的移动城堡》原声带)",
      cover: "covers/158.png",
      isPlaying: false,
      url: "https://music.163.com/#/song?id=442567",
    },
    {
      id: 210,
      music: "Vivre à en crever\n纵情人生",
      artist: "Florent Mothe/ Mikelangelo Loconte",
      album: "Mozart L'opera Rock (Complete Recording)(音乐剧《摇滚莫扎特》原声带)",
      cover: "covers/210.png",
      isPlaying: false,
      url: "https://www.bilibili.com/video/BV15t411P7cU/?share_source=copy_web&vd_source=499d608de8bb4da3f1598fd3fcc23cca",
    },
    {
      id: 5,
      title: "个人分享|「longings/ intimacy ·love」从毕业演讲到其他| 片段记录",
      date: "2022年06月27日 14:20",
      music: "In The Real Early Morning",
      artist: "Jacob Collier",
      album: "In My Room",
      url: "https://music.apple.com/cn/album/in-the-real-early-morning/1691861210?i=1691861220",
      note: "Fav",
      cover: "covers/5.png",
      isPlaying: false
    }
  ]);
  
  const favMusicList = useMemo(() => {
    return allMusicData.filter(item => item.note && item.note.includes('Fav'));
  }, [allMusicData]);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [showMusicReport, setShowMusicReport] = useState(true); // 新增状态变量
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // 处理模态框打开/关闭时的背景滚动
  useEffect(() => {
    if (showModal) {
      // 保存原始样式以便恢复
      const originalBodyStyle = window.getComputedStyle(document.body).overflow;
      const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // 针对 iOS Safari 的额外处理：防止触摸滚动
      const preventDefault = (e) => {
        // 如果点击的是模态框背景或其内部非滚动元素，则阻止默认行为
        if (showModal) {
          e.preventDefault();
        }
      };
      
      // 仅在移动端添加触摸锁定，或者全局添加以确保安全
      document.addEventListener('touchmove', preventDefault, { passive: false });
      
      return () => {
        document.body.style.overflow = originalBodyStyle || 'auto';
        document.documentElement.style.overflow = originalHtmlStyle || 'auto';
        document.removeEventListener('touchmove', preventDefault);
      };
    }
  }, [showModal]);
  const [playingFavId, setPlayingFavId] = useState(null);

  const handleFavPlay = (e, item) => {
    e.stopPropagation();
    if (playingFavId === item.id) {
      setPlayingFavId(null);
    } else {
      setPlayingFavId(item.id);
      // Stop any spinning vinyls
      setFeaturedAlbums(prev => prev.map(a => ({ ...a, isPlaying: false })));
    }
  };

  const handleImageClick = (imageSrc, index) => {
    setSelectedImage(imageSrc);
    setSelectedImageIndex(index);
    setIsImageLoading(true); // 打开时设为加载中
    setShowModal(true);
  };

  const closeModal = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    setShowModal(false);
    setSelectedImage(null);
    setSelectedImageIndex(null);
    setIsImageLoading(false);
  }, []);

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 抽离核心切换逻辑，不依赖 event 对象
  const navigateImage = useCallback((direction) => {
    setSelectedImageIndex((prevIndex) => {
      if (prevIndex === null) return null;
      
      let newIndex;
      if (direction === 'next') {
        newIndex = (prevIndex + 1) % musicReports.length;
      } else {
        newIndex = (prevIndex - 1 + musicReports.length) % musicReports.length;
      }
      return newIndex;
    });
  }, [musicReports]); // 现在 musicReports 是稳定的

  // 响应 index 变化，更新 URL 和 loading 状态
  useEffect(() => {
    if (selectedImageIndex !== null) {
      setSelectedImage(`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${musicReports[selectedImageIndex].id}.webp`);
      setIsImageLoading(true);
    }
  }, [selectedImageIndex, musicReports]);

  const goToNextImage = (e) => {
    e && e.stopPropagation();
    navigateImage('next');
  };

  const goToPreviousImage = (e) => {
    e && e.stopPropagation();
    navigateImage('prev');
  };

  // 键盘事件监听
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    // 使用 document 监听更保险，虽然 window 也可以
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, navigateImage, closeModal]);


  const handleTabClick = (tab) => {
    if (tab === 'fav') {
      return;
    }
    setActiveTab(tab);
  };

  const playAlbum = (album) => {
    if (album.url) {
      window.open(album.url, '_blank');
    }
    setFeaturedAlbums(prevAlbums =>
      prevAlbums.map(item =>
        item.id === album.id ? { ...item, isPlaying: !item.isPlaying } : { ...item, isPlaying: false }
      )
    );
  };

  // 幻灯片控制函数
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % musicReports.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + musicReports.length) % musicReports.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const modalButtonStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    width: isMobile ? '48px' : '56px',
    height: isMobile ? '48px' : '56px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
  };

  const modalIconStyle = {
    width: isMobile ? '28px' : '32px',
    height: isMobile ? '28px' : '32px',
  };

  return (
    <div className="special-collection" style={{
      background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at bottom right, rgba(100, 100, 255, 0.05) 0%, rgba(100, 100, 255, 0) 50%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#e6e6e6'
    }}>
      
      {/* 黑胶展示区 - 保持不变 */}
      <div className="vinyl-showcase" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          color: '#ffffff',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>🎵 精选黑胶展示区 (特别专辑)</h3>
        <div className="vinyl-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '25px',
          justifyContent: 'center'
        }}>
          {featuredAlbums.map(album => (
            <div className="vinyl-item" key={album.id} style={{
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <div 
                className={`vinyl-disc ${album.isPlaying ? 'playing' : ''} ${hoveredItem === album.id ? 'spinning' : ''}`} 
                onClick={() => playAlbum(album)}
                onMouseEnter={() => setHoveredItem(album.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  position: 'relative',
                  width: '150px',
                  height: '150px',
                  margin: '0 auto 15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="vinyl-cover" style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/${album.cover.replace(/\.(png|jpg|jpeg)$/i, '.webp')}`}
                    alt={album.music}
                    width="150"
                    height="150"
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop if fallback also fails
                      e.target.src = `${process.env.PUBLIC_URL}/${album.cover}`;
                    }}
                  />
                </div>

                {hoveredItem === album.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    zIndex: '10'
                  }}>
                    点击跳转到音乐资源
                  </div>
                )}
              </div>
              <div className="vinyl-info" style={{
                padding: '10px'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  lineHeight: '1.3'
                }}>{album.music}</h4>
                <p style={{
                  margin: '4px 0',
                  fontSize: '0.85rem',
                  color: '#cccccc',
                  opacity: '0.9'
                }}>{album.artist}</p>
                <p style={{
                  margin: '4px 0',
                  fontSize: '0.8rem',
                  color: '#aaaaaa',
                  opacity: '0.8'
                }}>{album.album}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最爱收藏列表 - 保持不变 */}
      <div className="all-collections-list" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <h3
          onClick={() => setShowAllCollections(!showAllCollections)}
          style={{
            cursor: 'pointer',
            color: '#ffffff',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.3rem',
            fontWeight: '600',
            justifyContent: 'space-between' // 确保左对齐和箭头右侧
          }}
        >
          <span>📜 🌟最爱收藏 列表（{favMusicList.length}首）</span>
          <span style={{ fontSize: '1.5rem' }}>{showAllCollections ? '▲' : '▼'}</span>
        </h3>
        
        {showAllCollections && (
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            borderRadius: '10px'
          }}>
            {favMusicList.map((item, index) => (
              <div
                className="list-item"
                key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => handleFavPlay(e, item)}
                style={{
                  backgroundColor: hoveredItem === item.id ? colors[index % colors.length] : 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `4px solid ${borderColors[index % borderColors.length]}`,
                  padding: '12px 15px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  backdropFilter: hoveredItem === item.id ? 'blur(5px)' : 'none',
                  transform: hoveredItem === item.id ? 'translateX(5px)' : 'translateX(0)',
                  boxShadow: hoveredItem === item.id ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div className="song-title" style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{item.music}</div>
                    <div className="artist-name" style={{ color: '#ccc', fontSize: '0.8rem' }}>{item.artist}</div>
                  </div>
                  <button
                    onClick={(e) => handleFavPlay(e, item)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    className="hover:bg-white/20"
                    title={playingFavId === item.id ? "暂停" : "播放预览"}
                  >
                    {playingFavId === item.id ? (
                      <PauseIcon className="w-5 h-5 text-white" />
                    ) : (
                      <PlayIcon className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                
                {playingFavId === item.id && (
                  <div 
                    onClick={e => e.stopPropagation()} 
                    style={{ marginTop: '10px' }}
                    className="animate-fade-in"
                  >
                    <AudioPreview 
                      term={`${item.artist} ${item.music}`} 
                      previewUrl={item.previewUrl}
                      isMobile={isMobile} 
                      autoPlay={true} 
                      darkMode={true} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 新增：音乐报告幻灯片查看器 */}
      <div className="music-report-slider" style={{
        background: `
          radial-gradient(circle at 10% 10%, rgba(153, 60, 247, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 90% 15%, rgba(255, 107, 107, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(56, 135, 246, 0.1) 0%, transparent 60%),
          radial-gradient(circle at 80% 85%, rgba(255, 230, 109, 0.1) 0%, transparent 40%),
          rgba(255, 255, 255, 0.03)
        `,
        borderRadius: '24px',
        padding: isMobile ? '15px' : '25px 25px 15px 25px', 
        marginBottom: '30px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h3 
          onClick={() => setShowMusicReport(!showMusicReport)}
          style={{
            cursor: 'pointer',
            color: '#ffffff',
            marginBottom: '15px',
            fontSize: '1.3rem',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <span>🎵 歌词图景 music report</span>
          <span style={{ fontSize: '1.5rem' }}>{showMusicReport ? '▲' : '▼'}</span>
        </h3>
        
        {showMusicReport && ( // 根据状态变量条件渲染
          <div className="slider-wrapper animate-fade-in">
            <div className="slider-container" style={{
              position: 'relative',
              maxWidth: isMobile ? '100%' : '1000px',
              width: '100%',
              aspectRatio: isMobile ? 'auto' : '3/2', 
              maxHeight: isMobile ? '70vh' : '620px', 
              margin: '0 auto',
              borderRadius: '15px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* 幻灯片轨道 */}
              <div 
                className="slider-track"
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  flexWrap: 'nowrap',
                  transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  transform: `translateX(-${currentSlide * 100}%)`
                }}
              >
                {musicReports.map((report, index) => (
                  <div 
                    key={report.id}
                    className="slide"
                    style={{
                      width: '100%',
                      flex: '0 0 100%',
                      height: '100%',
                      minHeight: isMobile ? '50vh' : 'auto',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0'
                    }}
                  >
                    <img 
                      src={`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${report.id}.webp`}
                      alt={report.name}
                      width="900"
                      height="600"
                      loading="lazy"
                      onClick={() => handleImageClick(`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${report.id}.webp`, index)}
                      style={{
                        display: 'block',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${report.id}.png`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 底部控制栏 */}
            <div style={{
              maxWidth: isMobile ? '100%' : '1000px',
              margin: '10px auto 0 auto',
              padding: '0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
              }}>
                <button
                  onClick={prevSlide}
                  aria-label="上一张"
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <ChevronLeftIcon className="w-8 h-8" />
                </button>

                <div className="slider-dots" style={{ display: 'flex', gap: isMobile ? '14px' : '10px', alignItems: 'center' }}>
                  {musicReports.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      aria-label={`前往幻灯片 ${index + 1}`}
                      className="transition-all duration-300"
                      style={{
                        width: isMobile ? '16px' : '10px',
                        height: isMobile ? '16px' : '10px',
                        borderRadius: '50%',
                        border: 'none',
                        background: currentSlide === index ? '#993cf7ff' : 'rgba(56, 135, 246, 0.4)',
                        cursor: 'pointer',
                        transform: currentSlide === index ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  aria-label="下一张"
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <ChevronRightIcon className="w-8 h-8" />
                </button>
              </div>

              {/* 幻灯片信息 */}
              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                color: '#cccccc',
                fontSize: '0.85rem',
                opacity: 0.8
              }}>
                第 {currentSlide + 1} / {musicReports.length} 张 - {musicReports[currentSlide].name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 图片放大模态框 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black backdrop-blur-xl"
            style={{ touchAction: 'none' }} // 显式禁用触摸动作，防止背景滚动
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full h-full max-w-[98vw] max-h-[98vh] mx-auto p-4 md:p-12 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container */}
              <div className="relative w-full h-full flex items-center justify-center bg-transparent rounded-2xl overflow-hidden">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={selectedImage}
                  alt={selectedImageIndex !== null ? musicReports[selectedImageIndex].name : "Enlarged Music Report"}
                  className={`object-contain w-full h-full transition-all duration-500 ease-out ${isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                  onLoad={() => setIsImageLoading(false)}
                  onError={(e) => {
                    setIsImageLoading(false);
                    const pngImage = selectedImage.replace('.webp', '.png');
                    e.target.src = pngImage;
                  }}
                />
              </div>



              {/* Bottom Info */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white/90 rounded-lg text-sm text-center pointer-events-none">
                <span>{selectedImageIndex !== null ? `${selectedImageIndex + 1} / ${musicReports.length}` : ''}</span>
                <span className="mx-2 opacity-50">|</span>
                <span>{selectedImageIndex !== null ? musicReports[selectedImageIndex]?.name || '' : ''}</span>
                {!isMobile && <span className="inline"><span className="mx-2 opacity-50">|</span> 按 ESC 键退出</span>}
              </div>
            </motion.div>

            {/* Modal Control Buttons */}
            <div style={{
              position: 'absolute',
              bottom: isMobile && orientation === 'landscape' ? '10px' : (isMobile ? '20px' : '30px'),
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile && orientation === 'landscape' ? '8px' : (isMobile ? '12px' : '20px'),
              zIndex: 1010,
            }}>
              <motion.button
                whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPreviousImage}
                style={modalButtonStyle}
                aria-label="Previous image"
              >
                <ChevronLeftIcon style={modalIconStyle} />
              </motion.button>

              {!isMobile && (
                <motion.button
                  whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  style={modalButtonStyle}
                  aria-label="Toggle fullscreen"
                >
                  <ArrowsPointingOutIcon style={modalIconStyle} />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                style={modalButtonStyle}
                aria-label="Close modal"
              >
                <XMarkIcon style={modalIconStyle} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNextImage}
                style={modalButtonStyle}
                aria-label="Next image"
              >
                <ChevronRightIcon style={modalIconStyle} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpecialCollection;