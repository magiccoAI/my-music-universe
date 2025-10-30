import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
import useMusicData from './hooks/useMusicData';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, Html, useTexture } from '@react-three/drei';
import Stars from './components/StarsOnly';

import UniverseNavigation from './components/UniverseNavigation';
import * as THREE from 'three';
import { UniverseContext } from './UniverseContext';
import Cover from './components/Cover';
import InfoCard from './components/InfoCard';

const MusicUniverse = () => {
  const { musicData, loading, error } = useMusicData();
  const { isConnectionsPageActive } = useContext(UniverseContext);
  const [textures, setTextures] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allTexturesLoaded, setAllTexturesLoaded] = useState(false);
  const [additionalTextures, setAdditionalTextures] = useState({});
  const [currentTheme, setCurrentTheme] = useState('night'); // 默认主题设置为night
  const [showHint, setShowHint] = useState(true);
  const [hoveredMusic, setHoveredMusic] = useState(null);
  const [positionedMusicData, setPositionedMusicData] = useState([]);

  const themes = {
    day: "bg-gradient-to-b from-blue-900 via-blue-600 to-blue-300", // 白天：飞机上看到的深蓝到浅蓝渐变
    // 替换您当前的傍晚渐变代码
    evening: "evening-symmetric", // 傍晚：日落海面多色渐变
    night: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // 夜晚：银河星系的深色弥散渐变
    default: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // Add a default theme
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCoverVisible = useCallback((id) => {
    if (isMobile && !textures[id] && !additionalTextures[id]) {
      const itemToLoad = musicData.find(item => item.id === id);
      if (itemToLoad) {
        const loader = new THREE.TextureLoader();
        const getOptimizedImageUrl = (originalCoverPath) => {
          const fileName = originalCoverPath.split('/').pop().replace(/\.(png|jpg|jpeg)$/i, '');
          return `${process.env.PUBLIC_URL}/optimized-images/${fileName}.webp`;
        };

        loader.load(
          getOptimizedImageUrl(itemToLoad.cover),
          (texture) => {
            setAdditionalTextures(prev => ({ ...prev, [id]: texture }));
          },
          undefined,
          (error) => {
            console.error('Error loading additional texture:', itemToLoad.cover, error);
          }
        );
      }
    }
  }, [isMobile, textures, musicData, additionalTextures]);

  useEffect(() => {
    if (musicData.length > 0 && positionedMusicData.length === 0) {
      const newPositionedData = musicData.map(item => {
        if (!item.position) {
          // Generate random positions for items without a defined position
          const x = (Math.random() - 0.5) * 20; // -10 to 10
          const y = (Math.random() - 0.5) * 20; // -10 to 10
          const z = (Math.random() - 0.5) * 20; // -10 to 10
          return { ...item, position: [x, y, z] };
        }
        return item;
      });
      setPositionedMusicData(newPositionedData);
    }
  }, [musicData, positionedMusicData]);

  useEffect(() => {
    if (musicData.length > 0) {
      const loader = new THREE.TextureLoader();
      let loadedCount = 0;
      const totalTextures = musicData.length;
      
      const newTextures = {};
      
      const getOptimizedImageUrl = (originalCoverPath) => {
        if (!originalCoverPath) return null;
        const parts = originalCoverPath.split('/');
        const baseNameWithExtension = parts[parts.length - 1];
        const lastDotIndex = baseNameWithExtension.lastIndexOf('.');
        const fileName = lastDotIndex !== -1 ? baseNameWithExtension.substring(0, lastDotIndex) : baseNameWithExtension;
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
            if (loadedCount === totalTextures) { // 修正加载进度计算
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
              if (loadedCount === totalTextures) { // 修正加载进度计算
                setTextures(newTextures);
                setAllTexturesLoaded(true);
              }
            }
          }
        );
      };
      
      const itemsToLoad = musicData;
      itemsToLoad.forEach(item => loadTexture(item));
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
    const moveSpeed = 0.8;
    const orbitRadius = useRef(10);
    const orbitAngle = useRef(0);

    useEffect(() => {
      if (isMobile) return;

      const updateCameraPosition = () => {
        camera.position.x = Math.sin(orbitAngle.current) * orbitRadius.current;
        camera.position.z = Math.cos(orbitAngle.current) * orbitRadius.current;
        camera.lookAt(0, 0, 0);
      };

      const handleKeyDown = (event) => {
        switch (event.key) {
          case 'ArrowLeft':
            // 向左环绕
            orbitAngle.current += 0.1;
            updateCameraPosition();
            break;
          case 'ArrowRight':
            // 向右环绕
            orbitAngle.current -= 0.1;
            updateCameraPosition();
            break;
          case 'ArrowUp':
            // 拉近
            // if (orbitRadius.current > 3) { // 移除限制，允许穿透
              orbitRadius.current -= moveSpeed;
              updateCameraPosition();
            // }
            break;
          case 'ArrowDown':
            // 拉远
            if (orbitRadius.current < 25) {
              orbitRadius.current += moveSpeed;
              updateCameraPosition();
            }
            break;
          case ' ':
            // 重置
            orbitRadius.current = 10;
            orbitAngle.current = 0;
            updateCameraPosition();
            break;
          default:
            break;
        }
      };

      // 初始化相机位置
      updateCameraPosition();

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [camera, isMobile]);

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

          {positionedMusicData.map((data) => (
            <Cover
              key={data.id}
              data={data}
              position={data.position}
              rotation={data.rotation}
              scale={data.scale}
              onClick={handleCoverClick}
              texture={textures[data.id] || additionalTextures[data.id]}
              onVisible={handleCoverVisible}
              isMobile={isMobile}
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