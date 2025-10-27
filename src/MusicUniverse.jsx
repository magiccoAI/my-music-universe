import React, { useRef, useState, useEffect, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Plane, Html, useTexture } from '@react-three/drei';
import Stars from './components/StarsOnly';


import UniverseNavigation from './components/UniverseNavigation';
import * as THREE from 'three';
import { UniverseContext } from './UniverseContext';
import Cover from './components/Cover';
import InfoCard from './components/InfoCard';

const MusicUniverse = () => {
  const [musicData, setMusicData] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [hoveredMusic, setHoveredMusic] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('night'); // Default theme
  const { isConnectionsPageActive } = useContext(UniverseContext);
  const [showHint, setShowHint] = useState(true); // State for showing the hint
  

  const themes = {
    day: "bg-gradient-to-b from-blue-900 via-blue-600 to-blue-300", // 白天：飞机上看到的深蓝到浅蓝渐变
    // 替换您当前的傍晚渐变代码
    evening: "evening-symmetric", // 傍晚：日落海面多色渐变
    night: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // 夜晚：银河星系的深色弥散渐变
    default: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // Add a default theme
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/data/data.json')
      .then((res) => res.json())
      .then((data) => {
        const processedData = data.map((item, index) => {
          const randomOffsetX = (Math.random() - 0.5) * 25; // Larger spread
          const randomOffsetY = (Math.random() - 0.5) * 25;
          const randomOffsetZ = (Math.random() - 0.5) * 25;
          const rotationX = (Math.random() - 0.5) * Math.PI * 0.4; // Max 72 degrees
          const rotationY = (Math.random() - 0.5) * Math.PI * 0.4;
          const rotationZ = (Math.random() - 0.5) * Math.PI * 0.4;
          const scale = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 15000); // Hide hint after 10 seconds

    const handleUserInteraction = () => {
      setShowHint(false);
      clearTimeout(timer);
    };

    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
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
      // This will make sure the cameraRef is always up-to-date
      cameraRef.current = camera;
    });

    return null;
  };

  const KeyboardControls = () => {
    const { camera } = useThree();
    const speed = 0.5; // Adjust camera movement speed

    useEffect(() => {
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
    }, [camera, speed]);

    return null;
  };

  return (
    <div className={`w-screen h-screen ${themes[currentTheme] || themes.default}`}>
      <UniverseNavigation />
      <Canvas style={{ width: '100%', height: '100%' }} camera={{ fov: 75, near: 0.1, far: 1000 }} className={isConnectionsPageActive ? 'filter blur-lg scale-90 transition-all duration-500' : 'transition-all duration-500'}>
        <CameraSetup />
        <KeyboardControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {currentTheme === 'night' && <Stars />}


        {/* <OrbitControls /> */}

        {musicData.map((data) => (
          <Cover
            key={data.id}
            data={data}
            position={data.position}
            rotation={data.rotation}
            scale={data.scale}
            onClick={handleCoverClick}
          />
        ))}
        {hoveredMusic && <InfoCard music={hoveredMusic.data} position={hoveredMusic.position} onCardClose={() => setHoveredMusic(null)} />}
        {/* {selectedMusic && <InfoCard music={selectedMusic} />} */}
      </Canvas>
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
          提示：您可以通过键盘方向键⬅️⬆️➡️⬇️或鼠标移动来浏览音乐专辑。
        </div>
      )}
    </div>
  );
};

export default MusicUniverse;