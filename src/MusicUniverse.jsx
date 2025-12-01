import React, { useRef, useState, useEffect, useContext, useCallback, memo } from 'react';
import useMusicData from './hooks/useMusicData';
import useIsMobile from './hooks/useIsMobile';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, Html, useTexture } from '@react-three/drei';
// import Stars from './components/StarsOnly';
const Stars = React.lazy(() => import('./components/StarsOnly'));
import UniverseNavigation from './components/UniverseNavigation';

import { UniverseContext } from './UniverseContext';
import Cover from './components/Cover';
import InfoCard from './components/InfoCard';

const CameraSetup = memo(() => {
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
});

// 键盘控制组件（仅电脑端）
const KeyboardControls = memo(({ isMobile }) => {
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
});

const WebGLContextHandler = memo(() => {
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
});

const MusicUniverse = ({ isInteractive = true, showNavigation = true }) => {
  const { musicData, loading, error } = useMusicData();
  const { isConnectionsPageActive } = useContext(UniverseContext);
  const [currentTheme, setCurrentTheme] = useState('night'); // 默认主题设置为night
  const [showHint, setShowHint] = useState(true);
  const [hoveredMusic, setHoveredMusic] = useState(null);
  // const [positionedMusicData, setPositionedMusicData] = useState([]);
  const isMobile = useIsMobile();

  const positionedMusicData = React.useMemo(() => {
    if (musicData.length === 0) return [];
    return musicData.map(item => {
      if (!item.position) {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        return { ...item, position: [x, y, z] };
      }
      return item;
    });
  }, [musicData]);

  const themes = {
    day: "bg-gradient-to-b from-blue-900 via-blue-600 to-blue-300", // 白天：飞机上看到的深蓝到浅蓝渐变
    // 替换您当前的傍晚渐变代码
    evening: "evening-symmetric", // 傍晚：日落海面多色渐变
    night: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // 夜晚：银河星系的深色弥散渐变
    default: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // Add a default theme
  };

  



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

  return (
    <div 
      className={`w-screen h-screen ${themes[currentTheme]}`}
      role="main"
      aria-label="音乐宇宙三维可视化"
    >
      {/* 屏幕阅读器提示 */}
      <div className="sr-only">
        <p>这是一个三维音乐专辑浏览界面。使用键盘方向键可以环绕浏览，空格键重置视角。</p>
      </div>

      {showNavigation && <UniverseNavigation />}
      {musicData.length > 0 && positionedMusicData.length > 0 && (
        <Canvas
          style={{ width: '100%', height: '100%', touchAction: 'none' }} // 禁用浏览器默认触摸行为
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          className={isConnectionsPageActive ? 'filter blur-lg scale-90 transition-all duration-500' : 'transition-all duration-500'}
          dpr={isMobile ? [1, 1] : [1, 2]}
        >
          <WebGLContextHandler />
          <CameraSetup />
          {!isMobile && <KeyboardControls isMobile={isMobile} />}
          {/* <TouchControls /> */} {/* 移除触摸控制 */}
          <OrbitControls 
            enabled={isInteractive}
            enableRotate={true} // 移动设备上启用旋转
            enableZoom={true} 
            enablePan={true} // 移动设备上启用平移
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {currentTheme === 'night' && (
            <React.Suspense fallback={null}>
              <Stars />
            </React.Suspense>
          )}

          {positionedMusicData.map((data) => (
              <Cover
                key={data.id}
                data={data}
                position={data.position}
                rotation={data.rotation}
                scale={data.scale}
                onClick={handleCoverClick}
                isMobile={isMobile}
              />
          ))}
          {hoveredMusic && <InfoCard data={hoveredMusic.data} position={hoveredMusic.position} onClose={() => setHoveredMusic(null)} isMobile={isMobile} />}
        </Canvas>
      )}
      <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
        <button
          key="day-theme-button"
          className={`px-4 py-2 rounded-full text-white font-bold ${currentTheme === 'day' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-blue-500'}`}
          onClick={() => setCurrentTheme('day')}
          aria-pressed={currentTheme === 'day'}
          aria-label="切换到白天主题"
        >
          白天
        </button>
        <button
          key="evening-theme-button"
          className={`px-4 py-2 rounded-full text-white font-bold ${currentTheme === 'evening' ? 'bg-orange-500' : 'bg-gray-700 hover:bg-orange-500'}`}
          onClick={() => setCurrentTheme('evening')}
          aria-pressed={currentTheme === 'evening'}
          aria-label="切换到傍晚主题"
        >
          傍晚
        </button>
        <button
          key="night-theme-button"
          className={`px-4 py-2 rounded-full text-white font-bold ${currentTheme === 'night' ? 'bg-purple-800' : 'bg-gray-700 hover:bg-purple-800'}`}
          onClick={() => setCurrentTheme('night')}
          aria-pressed={currentTheme === 'night'}
          aria-label="切换到夜晚主题"
        >
          夜晚
        </button>
      
      </div>
      {showHint && (
        <div 
          className="absolute bottom-4 left-4 z-10 p-3 bg-gray-800 text-white rounded-lg shadow-lg text-sm opacity-90"
          role="status"
          aria-live="polite"
        >
          {isMobile ? 
            "提示：您可以通过单指拖动来浏览音乐专辑，双指捏合来缩放。" : 
            "提示：您可以通过键盘方向键⬅️⬆️➡️⬇️或鼠标移动来浏览音乐专辑。"}
        </div>
      )}
    </div>
  );
};

export default MusicUniverse;