import React, { useState, useEffect } from 'react';
import SpecialCollectionCSS from './SpecialCollection.css';

function SpecialCollection() {
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
  
  // 音乐报告图片数据
  const musicReports = [
    { id: 1, name: "音乐报告1" },
    { id: 2, name: "音乐报告2" },
    { id: 3, name: "音乐报告3" },
    { id: 4, name: "音乐报告4" },
    { id: 5, name: "音乐报告5" },
    { id: 6, name: "音乐报告6" },
    { id: 7, name: "音乐报告7" },
    { id: 8, name: "音乐报告8" }
  ];

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
  
  const [favMusicList, setFavMusicList] = useState([]);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [showMusicReport, setShowMusicReport] = useState(true); // 新增状态变量
  const [allMusicData, setAllMusicData] = useState([]);
  const [showModal, setShowModal] = useState(false); // 控制模态框显示
  const [selectedImage, setSelectedImage] = useState(''); // 存储选中的图片URL
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // 存储选中图片的索引

  const handleImageClick = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage('');
    setSelectedImageIndex(null);
  };

  const goToNextImage = () => {
    if (selectedImageIndex !== null && musicReports.length > 0) {
      const nextIndex = (selectedImageIndex + 1) % musicReports.length;
      setSelectedImage(`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${musicReports[nextIndex].id}.png`);
      setSelectedImageIndex(nextIndex);
    }
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex !== null && musicReports.length > 0) {
      const prevIndex = (selectedImageIndex - 1 + musicReports.length) % musicReports.length;
      setSelectedImage(`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${musicReports[prevIndex].id}.png`);
      setSelectedImageIndex(prevIndex);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + '/data/data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllMusicData(data);
      } catch (error) {
        console.error("Error fetching music data in SpecialCollection:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (allMusicData.length > 0) {
      const filteredFavMusic = allMusicData.filter(item => item.note && item.note.includes('Fav'));
      setFavMusicList(filteredFavMusic);
    }
  }, [allMusicData]);

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
                    src={`${process.env.PUBLIC_URL}/optimized-images/${album.cover.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '')}.webp`}
                    alt={album.title}
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
                style={{
                  backgroundColor: hoveredItem === item.id ? colors[index % colors.length] : 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `4px solid ${borderColors[index % borderColors.length]}`,
                  padding: '12px 15px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  backdropFilter: hoveredItem === item.id ? 'blur(5px)' : 'none',
                  transform: hoveredItem === item.id ? 'translateX(5px)' : 'translateX(0)',
                  boxShadow: hoveredItem === item.id ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none'
                }}
              >
                <p style={{
                  margin: 0,
                  color: '#e6e6e6',
                  fontSize: '0.95rem',
                  lineHeight: '1.4'
                }}>
                  <strong style={{ color: '#ffffff' }}>{item.music}</strong> 
                  {' - '}
                  <span style={{ opacity: 0.9 }}>{item.artist}</span>
                  {' - '}
                  <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>{item.album}</span>
                </p>
                {item.note && item.note.includes('Fav') && (
                  <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    color: '#000',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    marginTop: '5px',
                    fontWeight: 'bold'
                  }}>
                    
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 新增：音乐报告幻灯片查看器 */}
      <div className="music-report-slider" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 
          onClick={() => setShowMusicReport(!showMusicReport)} // 添加点击事件
          style={{
            cursor: 'pointer',
            color: '#ffffff',
            marginBottom: '15px',
            fontSize: '1.3rem',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            display: 'flex', // 使内容居中
            alignItems: 'center', // 垂直居中
            justifyContent: 'space-between', // 确保左对齐和箭头右侧
            gap: '10px' // 标题和箭头之间的间距
          }}
        >
          <span>🎵 music report</span>
          <span style={{ fontSize: '1.5rem' }}>{showMusicReport ? '▲' : '▼'}</span> {/* 添加折叠/展开指示 */}
        </h3>
        
        {showMusicReport && ( // 根据状态变量条件渲染
          <>
            <div className="slider-container" style={{
              position: 'relative',
              maxWidth: '900px',
              margin: '0 auto',
              overflow: 'hidden',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              {/* 幻灯片轨道 */}
              <div className="slides-track" style={{
                display: 'flex',
                transition: 'transform 0.5s ease-in-out',
                transform: `translateX(-${currentSlide * 100}%)`
              }}>
                {musicReports.map((report, index) => (
                  <div 
                    key={report.id}
                    className="slide"
                    style={{
                      minWidth: '100%',
                      height: 'auto',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <img 
                      src={`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${report.id}.png`}
                      alt={report.name}
                      onClick={() => handleImageClick(`${process.env.PUBLIC_URL}/images/music-report-spcl-1026/music-report-spcl-1029-${report.id}.png`, index)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        cursor: 'pointer' // 添加手型光标表示可点击
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x600/1a1a2e/ffffff?text=音乐报告图片加载中';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 导航按钮 */}
              <button 
                onClick={prevSlide}
                className="slider-nav prev"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '15px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(178, 204, 244, 0.2)',
                  border: 'none',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ‹
              </button>
              
              <button 
                onClick={nextSlide}
                className="slider-nav next"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '15px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(143, 187, 243, 0.44)',
                  border: 'none',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(197, 216, 243, 0.3)';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(158, 232, 250, 0.2)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ›
              </button>

              {/* 指示器点 */}
              <div className="slider-dots" style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px'
              }}>
                {musicReports.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      background: currentSlide === index ? '#993cf7ff' : 'rgba(56, 135, 246, 0.65)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 幻灯片信息 */}
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              color: '#cccccc',
              fontSize: '0.9rem'
            }}>
              第 {currentSlide + 1} / {musicReports.length} 张 - {musicReports[currentSlide].name}
            </div>
          </>
        )}
      </div>

      {/* 图片放大模态框 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4"
          onClick={closeModal} // 点击背景关闭模态框
        >
          <div 
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()} // 阻止点击图片时关闭模态框
          >
            <img 
              src={selectedImage}
              alt="Enlarged Music Report"
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
            {/* 上一张按钮 */}
            <button
              onClick={goToPreviousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-pink-500/50 hover:-translate-y-1"
            >
              &lt;
            </button>
            {/* 下一张按钮 */}
            <button
              onClick={goToNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-pink-500/50 hover:-translate-y-1"
            >
              &gt;
            </button>
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-gray-800 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all duration-200"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecialCollection;