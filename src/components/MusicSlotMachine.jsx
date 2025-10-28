import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MusicSlotMachine.css';


const MusicSlotMachine = () => {
  const [albums, setAlbums] = useState([]);
  // const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  // const [showResult, setShowResult] = useState(false);
  const reelRefs = [useRef(null), useRef(null), useRef(null)];
  const spinTimeoutRef = useRef(null);
   const initialized = useRef(false);

  // 加载音乐数据
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + '/data/data.json');
        const data = await response.json();
        const validAlbums = data.filter(album => album !== null && album !== undefined);
        const formattedAlbums = validAlbums.map(album => ({
          ...album,
          cover: album.cover
        }));
        setAlbums(formattedAlbums || []);
        
        // 初始化显示三个随机专辑
        // const initialAlbums = [];
        // for (let i = 0; i < 3; i++) {
        //   initialAlbums.push(data[Math.floor(Math.random() * data.length)]);
        // }
        // setSelectedAlbums(initialAlbums);
      } catch (error) {
        console.error('加载音乐数据失败:', error);
      }
    };

    loadAlbums();
  }, []);

  // 初始化卷轴
  const initializeReels = useCallback(() => {
    reelRefs.forEach((reelRef, index) => {
      if (reelRef.current) {
        reelRef.current.innerHTML = '';
        
        // 添加多个专辑项用于滚动效果
        for (let i = 0; i < 20; i++) {
          const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
          if (!randomAlbum) continue; // Skip if randomAlbum is undefined
          const albumElement = document.createElement('div');
          albumElement.className = 'album-item';
          albumElement.innerHTML = `
            <img src="${process.env.PUBLIC_URL}/optimized-images/${randomAlbum.cover.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '')}.webp" alt="${randomAlbum.title}" class="album-cover" onerror="this.onerror=null;this.src='${process.env.PUBLIC_URL}/${randomAlbum.cover}';console.error('Image failed to load:', this.src)" onload="console.log('Image loaded:', this.src)">
            <div class="album-info">
             
              <div class="album-artist">${randomAlbum.artist}</div>
             
            </div>
          `;
          reelRef.current.appendChild(albumElement);
        }
        
        // 设置初始位置
        reelRef.current.style.transform = 'translateY(0)';
      }
    });
  }, [albums, reelRefs]);

  // 旋转老虎机
  const spinSlots = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    // setShowResult(false);
    
    // 随机选择三个专辑作为最终结果
    // const newSelectedAlbums = [];
    // for (let i = 0; i < 3; i++) {
    //   const randomIndex = Math.floor(Math.random() * albums.length);
    //   const selectedAlbum = albums[randomIndex];
    //   if (selectedAlbum) {
    //     newSelectedAlbums.push(selectedAlbum);
    //   }
    // }

    // 设置卷轴动画
    reelRefs.forEach((reelRef, index) => {
      if (reelRef.current) {
        const reel = reelRef.current;

        // 清空卷轴内容
        reel.innerHTML = '';

        // 构建卷轴内容，确保最终选中的专辑在可见位置
        const itemsInReel = 30; // 增加卷轴中的项目数量，确保有足够的滚动空间
        const finalAlbumIndexInReel = Math.floor(itemsInReel * 0.75); // 确保最终专辑在卷轴的后半部分，以便有足够的“滚动”感

        for (let i = 0; i < itemsInReel; i++) {
          let albumToDisplay;
          // if (i === finalAlbumIndexInReel) {
          //   // 在特定位置放置最终选中的专辑
          //   albumToDisplay = newSelectedAlbums[index];
          // } else {
            // 其他位置放置随机专辑
            albumToDisplay = albums[Math.floor(Math.random() * albums.length)];
          // }

          if (!albumToDisplay) continue; // Skip if albumToDisplay is undefined

          const albumElement = document.createElement('div');
          albumElement.className = 'album-item';
          albumElement.innerHTML = `
            <img src="${process.env.PUBLIC_URL}/optimized-images/${albumToDisplay.cover.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '')}.webp" alt="${albumToDisplay.title}" class="album-cover" onerror="this.onerror=null;this.src='${process.env.PUBLIC_URL}/${albumToDisplay.cover}';console.error('Image failed to load:', this.src)" onLoad="console.log('Image loaded:', this.src)">
            <div class="album-info">
              <div class="album-title" title="${albumToDisplay.music}">${albumToDisplay.music}</div>
              <div class="album-artist">${albumToDisplay.artist}</div>
            </div>
          `;
          reelRef.current.appendChild(albumElement);
        }
        
        // 设置初始位置
        const albumItemHeight = 310; // 每个专辑项的高度
        // 计算目标位置，使 finalAlbumIndexInReel 处的专辑显示在顶部
        const targetPosition = -(finalAlbumIndexInReel * albumItemHeight);

        // 重置位置
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';

        // 强制重绘
        void reel.offsetWidth;

        // 开始动画
        setTimeout(() => {
          reel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)';
          reel.style.transform = `translateY(${targetPosition}px)`;
        }, 50);
      }
    });

    // 设置结果
    spinTimeoutRef.current = setTimeout(() => {
      // setSelectedAlbums(newSelectedAlbums); // 动画结束后更新 selectedAlbums
      setIsSpinning(false);
      // setShowResult(true);

      // 添加脉冲动画
      // const slots = document.querySelectorAll('.slot');
      // slots.forEach(slot => {
      //   slot.classList.add('pulse');
      //   setTimeout(() => {
      //     slot.classList.remove('pulse');
      //   }, 2000);
      // });
    }, 5000); // 这里的延迟应该与动画时间一致
  };

  // 初始化卷轴
  useEffect(() => {
    if (albums.length > 0 && !initialized.current) {
      initializeReels();
      initialized.current = true;
    }
  }, [albums, initializeReels, reelRefs]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="music-slot-machine">
      <div className="container">
        
        <p className="subtitle">点击旋转按钮，发现三张随机音乐专辑</p>
        
        <div className="player-container">
          <div className="slots-container">
            {[0, 1, 2].map(index => (
              <div key={index} className="slot">
                <div className="slot-reel" ref={reelRefs[index]}></div>
                <div className="slot-overlay"></div>
              </div>
            ))}
          </div>
          
          <div className="controls">
            <button 
              className={`spin-btn ${isSpinning ? 'spinning' : ''}`} 
              onClick={spinSlots}
              disabled={isSpinning}
            >
              {isSpinning ? '旋转中...' : '开始旋转'}
            </button>
          </div>
        </div>
        
        {/* <div className={`result ${showResult ? 'show' : ''}`}>
          <h2 className="result-title">你的随机专辑组合</h2>
          <div className="result-albums">
            {selectedAlbums.map((album, index) => (
              <div key={index} className="result-album">
                <img src={`${process.env.PUBLIC_URL}/${album.cover}`} alt={album.title} onError={(e) => console.error('Image failed to load:', e.target.src)} onLoad={(e) => console.log('Image loaded:', e.target.src)} />
                <div className="album-title">{album.title}</div>
                <div className="album-artist">{album.artist}</div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MusicSlotMachine;