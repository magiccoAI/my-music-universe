import React, { useRef, useState, useEffect, useContext } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, Html, useTexture } from '@react-three/drei';
import Stars from './components/StarsOnly';

import UniverseNavigation from './components/UniverseNavigation';
import * as THREE from 'three';
import { UniverseContext } from './UniverseContext';
import Cover from './components/Cover';
import InfoCard from './components/InfoCard';

const MusicUniverse = () => {
  const [musicData, setMusicData] = useState([]);
  const [textures, setTextures] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allTexturesLoaded, setAllTexturesLoaded] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [hoveredMusic, setHoveredMusic] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('night');
  const { isConnectionsPageActive } = useContext(UniverseContext);
  const [showHint, setShowHint] = useState(true);
  
  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const themes = {
    day: "bg-gradient-to-b from-blue-900 via-blue-600 to-blue-300",
    evening: "evening-symmetric",
    night: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800",
    default: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800",
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/data/data.json')
      .then((res) => res.json())
      .then((data) => {
        const processedData = data.map((item, index) => {
          const randomOffsetX = (Math.random() - 0.5) * 25;
          const randomOffsetY = (Math.random() - 0.5) * 25;
          const randomOffsetZ = (Math.random() - 0.5) * 25;
          const rotationX = (Math.random() - 0.5) * Math.PI * 0.4;
          const rotationY = (Math.random() - 0.5) * Math.PI * 0.4;
          const rotationZ = (Math.random() - 0.5) * Math.PI * 0.4;
          const scale = 0.8 + (Math.random() * 0.4);

          return {
            ...item,
            position: [randomOffsetX, randomOffsetY, randomOffsetZ],
            rotation: [rotationX, rotationY, rotationZ],
            scale: scale,
          };
        });
        setMusicData(processedData);
      })
      .catch((error) => console.error('Error loading music data:', error));
  }, []);

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 触摸事件处理
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
    setIsDragging(false); // 重置拖动状态
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // 如果移动距离超过阈值，认为是拖动而非点击
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || !touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // 如果是点击（移动距离很小），不是拖动
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
      // 这里可以处理点击逻辑，比如选择专辑等
      console.log('Touch click detected');
    }
    
    setTouchStart(null);
    setIsDragging(false);
  };

  useEffect(() => {
    if (musicData.length > 0) {
      const loader = new THREE.TextureLoader();
      let loadedCount = 0;
      const totalTextures = musicData.length; // 移除移动端图片加载数量限制
      
      const newTextures = {};
      
      const getOptimizedImageUrl = (originalCoverPath) => {
        if (!originalCoverPath) return null;
        const fileName = originalCoverPath.split('/').pop().split('.')[0];
        return `${process.env.PUBLIC_URL}/optimized-images/${fileName}.webp`;
      };

      const loadTexture = (item, retryCount = 0) => {
        const maxRetries = 2;
        const textureUrl = isMobile && item.coverMobile
          ? getOptimizedImageUrl(item.coverMobile) || `${process.env.PUBLIC_URL}/${item.coverMobile}`
          : getOptimizedImageUrl(item.cover) || `${process.env.PUBLIC_URL}/${item.cover}`;
          
        loader.load(
          textureUrl,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            newTextures[item.id] = texture;
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalTextures) * 100));
            if (loadedCount === musicData.length) { // 修正加载进度计算
              setTextures(newTextures);
              setAllTexturesLoaded(true);
            }
          },
          undefined,
          (error) => {
            console.error('Error loading texture:', item.cover, error);
            if (retryCount < maxRetries) {
              console.log(`Retrying texture load (${retryCount + 1}/${maxRetries}):`, item.cover);
              setTimeout(() => loadTexture(item, retryCount + 1), 1000);
            } else {
              loadedCount++;
              setLoadingProgress(Math.round((loadedCount / totalTextures) * 100));
              if (loadedCount === musicData.length) { // 修正加载进度计算
                setTextures(newTextures);
                setAllTexturesLoaded(true);
              }
            }
          }
        );
      };
      
      musicData.forEach(item => loadTexture(item)); // 直接使用 musicData
    }
  }, [musicData, isMobile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 15000);

    const handleUserInteraction = () => {
      setShowHint(false);
      clearTimeout(timer);
    };

    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);
    // 添加触摸事件监听
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const handleCoverClick = (data, albumPosition) => {
    setHoveredMusic({ data, position: albumPosition });
  };

  const CameraSetup = () => {
    const { camera } = useThree();
    const cameraRef = useRef(camera);

    useEffect(() => {
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;
    }, [camera]);

    useFrame(() => {
      cameraRef.current = camera;
    });

    return null;
  };

  // 键盘控制组件（仅电脑端）
  const KeyboardControls = () => {
    const { camera } = useThree();
    const speed = 0.5;

    useEffect(() => {
      if (isMobile) return; // 移动设备上禁用键盘控制

      const handleKeyDown = (event) => {
        switch (event.key) {
          case 'ArrowLeft':
            camera.position.x -= speed;
            break;
          case 'ArrowRight':
            camera.position.x += speed;
            break;
          case 'ArrowUp':
            camera.position.z -= speed;
            break;
          case 'ArrowDown':
            camera.position.z += speed;
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [camera, speed, isMobile]); // 添加 isMobile 依赖

    return null;
  };

  // 移动设备触摸控制组件 (已移除)

  const WebGLContextHandler = () => {
    const { gl } = useThree();

    useEffect(() => {
      const handleContextLost = (event) => {
        event.preventDefault();
        console.warn('WebGL Context Lost. Attempting to restore...');
      };

      const handleContextRestored = () => {
        console.log('WebGL Context Restored!');
      };

      gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
      gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

      return () => {
        gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
        gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }, [gl]);

    return null;
  };

  return (
    <div 
      className={`w-screen h-screen ${themes[currentTheme] || themes.default}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!allTexturesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
          加载资源中... {loadingProgress}%
        </div>
      )}
      <UniverseNavigation />
      {allTexturesLoaded && (
        <Canvas
          style={{ width: '100%', height: '100%', touchAction: 'none' }} // 禁用浏览器默认触摸行为
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          className={isConnectionsPageActive ? 'filter blur-lg scale-90 transition-all duration-500' : 'transition-all duration-500'}
          dpr={[1, 2]}
        >
          <WebGLContextHandler />
          <CameraSetup />
          <KeyboardControls />
          {/* <TouchControls /> */} {/* 移除触摸控制 */}
          <OrbitControls 
            enableRotate={true} // 移动设备上启用旋转
            enableZoom={true} 
            enablePan={true} // 移动设备上启用平移
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {currentTheme === 'night' && <Stars />}

          {musicData.map((data) => (
            <Cover
              key={data.id}
              data={data}
              position={data.position}
              rotation={data.rotation}
              scale={data.scale}
              onClick={handleCoverClick}
              texture={textures[data.id]}
              isMobile={isMobile} // 传递移动设备状态给Cover组件
            />
          ))}
          {hoveredMusic && <InfoCard music={hoveredMusic.data} position={hoveredMusic.position} onCardClose={() => setHoveredMusic(null)} />}
        </Canvas>
      )}
      <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
        <button
          className={`px-4 py-2 rounded-full text-white font-bold ${currentTheme === 'day' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-blue-500'}`}
          onClick={() => setCurrentTheme('day')}
        >
          白天
        </button>
        <button
          className={`px-4 py-2 rounded-full text-white font-bold ${currentTheme === 'evening' ? 'bg-orange-500' : 'bg-gray-700 hover:bg-orange-500'}`}
          onClick={() => setCurrentTheme('evening')}
        >
          傍晚
        </button>
        <button
          className={`px-4 py-2 rounded-full text-white font-bold ${currentTheme === 'night' ? 'bg-purple-500' : 'bg-gray-700 hover:bg-purple-500'}`}
          onClick={() => setCurrentTheme('night')}
        >
          夜晚
        </button>
      </div>
      {showHint && (
        <div className="absolute bottom-4 left-4 z-10 p-3 bg-gray-800 text-white rounded-lg shadow-lg text-sm opacity-90">
          {isMobile ? 
            "提示：您可以通过单指拖动来浏览音乐专辑，双指捏合来缩放。" : 
            "提示：您可以通过键盘方向键⬅️⬆️➡️⬇️或鼠标移动来浏览音乐专辑。"}
        </div>
      )}
    </div>
  );
};

export default MusicUniverse;