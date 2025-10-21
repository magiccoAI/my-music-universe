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
    fetch('/data/data.json')
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
    }, 5000); // Hide hint after 5 seconds

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


  const InfoCard = ({ music, position, onCardClose }) => { 
    const { camera } = useThree(); 
    const cardRef = useRef(); 
 
    // Dynamic card positioning 
    const [cardPosition, setCardPosition] = useState([0, 0, 0]); 
 
    useFrame(() => { 
      if (cardRef.current && music) {
        console.log("InfoCard: music prop:", music);
        console.log("InfoCard: music.position:", music.position);
        // Get the cover's world position
        const coverWorldPosition = new THREE.Vector3(...music.position);
 
        // Get camera's forward vector 
        const cameraForward = new THREE.Vector3(); 
        camera.getWorldDirection(cameraForward); 
 
        // Calculate a position slightly in front of the cover along the camera's view direction 
        // Adjust this offset as needed to ensure it's always visible and not too close/far 
        const offsetDistance = 1.5; // Distance in front of the cover 
        const newCardPosition = new THREE.Vector3() 
          .copy(coverWorldPosition) 
          .add(cameraForward.multiplyScalar(-offsetDistance)); // Negative because cameraForward points away from camera 
 
        // Add a slight vertical offset for better placement 
        newCardPosition.y += 0.7; // Adjust vertical offset 
 
        setCardPosition([newCardPosition.x, newCardPosition.y, newCardPosition.z]); 
      } 
    }); 
  
   // 2. 增加对外部链接的鲁棒性检查 
   const isValidUrl = music.url && (music.url.startsWith('http://') || music.url.startsWith('https://')); 
    
   // 3. 增强：增加 ESC 键关闭卡片的功能 
   useEffect(() => {
     const handleKeyDown = (event) => {
       if (event.key === 'Escape') {
         onCardClose();
       }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [onCardClose]); 
  
   return ( 
     <Html position={cardPosition} transform ref={cardRef} onClick={onCardClose}> 
       <div  
         className="bg-white/90 p-3 rounded-xl shadow-2xl backdrop-blur-sm max-w-[200px] text-gray-800 text-sm border border-gray-100"  
         onClick={(e) => e.stopPropagation()} // Prevent clicks inside the card from closing it immediately
       > 
          
         {/* ... (内部结构保持上次优化后的样式) ... */} 
          
         {/* 1. 歌曲信息组 (主信息) */} 
         <div className="mb-2"> 
           <h3 className="font-extrabold text-xl text-indigo-800 leading-snug">{music.music}</h3> 
         </div> 
          
         <div className="space-y-1 text-base"> 
             <p> 
                 <span className="text-gray-500 mr-1">艺术家:</span>  
                 <strong className="font-semibold text-gray-900">{music.artist}</strong> 
             </p> 
             <p> 
                 <span className="text-gray-500 mr-1">专辑:</span>  
                 <span className="text-gray-700">{music.album}</span> 
             </p> 
         </div> 
  
         <div className="border-b border-gray-200 my-2"></div> 
  
         {/* 2. 推文信息组 (次要信息) */} 
         <div className="text-xs space-y-1"> 
             <p> 
                 <span className="text-gray-500 mr-1">推文:</span>  
                 <span className="text-gray-600">{music.title}</span> 
             </p> 
             <p> 
                 <span className="text-gray-500 mr-1">分享日期:</span>  
                 <span className="text-gray-600">{music.date}</span> 
             </p> 
             {music.note &&  
                 <p> 
                     <span className="text-gray-500 mr-1">备注:</span>  
                     <span className="italic text-gray-600">{music.note}</span> 
                 </p> 
             } 
         </div> 
  
         {/* 3. 行动召唤 (链接) - 增加鲁棒性判断和外部链接图标 */} 
         {isValidUrl ? ( 
           <a  
              href={music.url}  
              target="_blank"  
              rel="noopener noreferrer" 
              className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 mt-3 block text-center rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1" 
           > 
              <span>查看原文</span>  
              {/* 外部链接图标 */} 
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg> 
           </a> 
         ) : music.url && ( 
             <p className="text-red-500 text-xs mt-3">链接地址无效</p> 
         )} 
       </div> 
     </Html> 
   ); 
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
          提示：您可以通过键盘方向键或鼠标移动来浏览音乐专辑。
        </div>
      )}
    </div>
  );
};

export default MusicUniverse;