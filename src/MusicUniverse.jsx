import React, { useRef, useState, useEffect, useContext, useCallback, memo } from 'react';
import useMusicData from './hooks/useMusicData';
import useIsMobile from './hooks/useIsMobile';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, Html, useTexture } from '@react-three/drei';
import { SunIcon, CloudIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import * as THREE from 'three';
// import Stars from './components/StarsOnly';
import EveningThemeControl, { EVENING_PRESETS } from './components/EveningThemeControl';
import SceneErrorBoundary from './components/SceneErrorBoundary';

const Stars = React.lazy(() => import('./components/StarsOnly'));
const Clouds = React.lazy(() => import('./components/CloudsOnly'));
const PaperPlanes = React.lazy(() => import('./components/PaperPlanes'));
const Evening = React.lazy(() => import('./components/EveningAssets'));
const Snowfall = React.lazy(() => import('./components/Snowfall'));
const SnowMountain = React.lazy(() => import('./components/SnowMountain'));
import UniverseNavigation from './components/UniverseNavigation';

import { UniverseContext } from './UniverseContext';
import Cover from './components/Cover';
import InfoCard from './components/InfoCard';

const AmbientSound = memo(({ enabled, volume = 1, theme = 'evening' }) => {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const userGainRef = useRef(null);
  // Refs for active nodes to clean up
  const activeNodesRef = useRef([]);

  // 1. Manage AudioContext Lifecycle (Create once, Resume on interaction)
  useEffect(() => {
    if (!enabled) {
      // Cleanup context if disabled
      if (ctxRef.current) {
        try { ctxRef.current.close(); } catch {}
        ctxRef.current = null;
      }
      return;
    }

    // Create Context if missing
    if (!ctxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;

    // Resume Logic
    const resumeAudio = () => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(e => console.warn("Audio resume failed", e));
      }
    };
    // Try immediate resume (works if triggered by click)
    resumeAudio();
    
    // Add listeners for future interaction
    ['click', 'touchstart', 'keydown'].forEach(event => 
      window.addEventListener(event, resumeAudio, { once: true })
    );

    return () => {
      // Don't close context on unmount immediately if we want to reuse? 
      // Actually, if component unmounts (e.g. ambient disabled), we should close.
      // But if just theme changes, this effect won't run (dep is [enabled]).
      ['click', 'touchstart', 'keydown'].forEach(event => 
        window.removeEventListener(event, resumeAudio)
      );
      if (ctxRef.current && !enabled) { // Double check
         try { ctxRef.current.close(); } catch {}
         ctxRef.current = null;
      }
    };
  }, [enabled]);

  // 2. Manage Audio Graph (Theme/Volume changes)
  useEffect(() => {
    if (!enabled || !ctxRef.current) return;

    const ctx = ctxRef.current;
    
    // Cleanup previous graph
    activeNodesRef.current.forEach(node => {
        try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
        } catch (e) { /* ignore */ }
    });
    activeNodesRef.current = [];

    // Master Gain for this theme
    const mainGain = ctx.createGain();
    const userGain = ctx.createGain();
    userGain.gain.value = Math.max(0, Math.min(volume, 1));
    
    mainGain.connect(userGain);
    userGain.connect(ctx.destination);
    
    activeNodesRef.current.push(mainGain, userGain);
    gainRef.current = mainGain;
    userGainRef.current = userGain;

    console.log(`[AmbientSound] Setting up theme: ${theme}`);

    if (theme === 'day') {
      // Day Theme: Brian Eno Style (Continuous)
      
      // Reverb
      const reverb = ctx.createConvolver();
      const duration = 8;
      const length = ctx.sampleRate * duration;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let i = 0; i < length; i++) {
        const n = i / length;
        const vol = Math.pow(1 - n, 3); 
        impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * vol;
        impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * vol;
      }
      reverb.buffer = impulse;

      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.6;
      reverb.connect(reverbGain);
      reverbGain.connect(mainGain);
      
      // Dry signal
      mainGain.gain.value = 0.5;

      const notes = [155.56, 196.00, 233.08, 261.63, 311.13, 349.23, 392.00];

      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const mod = ctx.createOscillator();
        mod.frequency.value = freq * 2;
        const modGain = ctx.createGain();
        modGain.gain.value = freq * 0.1;
        mod.connect(modGain);
        modGain.connect(osc.frequency);

        const voiceGain = ctx.createGain();
        voiceGain.gain.value = 0; 

        // LFO for volume
        const lfoRate = 0.02 + (Math.random() * 0.05);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = lfoRate;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3; // Depth
        lfo.connect(lfoGain);
        lfoGain.connect(voiceGain.gain);
        // Add base volume offset manually since we can't easily sum constant
        // Instead, let's use the LFO to drive 0..0.6 range by connecting to gain
        // A simple trick: Set voiceGain.gain to 0.3, and LFO mod +/- 0.3.
        voiceGain.gain.value = 0.3;

        const panner = ctx.createStereoPanner();
        panner.pan.value = (Math.random() * 2 - 1) * 0.6;

        osc.connect(voiceGain);
        voiceGain.connect(panner);
        panner.connect(reverb);
        
        const dryGain = ctx.createGain();
        dryGain.gain.value = 0.3; 
        panner.connect(dryGain);
        dryGain.connect(mainGain);

        const now = ctx.currentTime;
        osc.start(now);
        mod.start(now);
        lfo.start(now);

        activeNodesRef.current.push(osc, mod, lfo, modGain, voiceGain, lfoGain, panner, dryGain);
      });

    } else {
      // Evening Theme: Ocean/Rumble
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 500;
      lp.Q.value = 0.7;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12;

      mainGain.gain.value = 0.25;

      source.connect(lp);
      lp.connect(mainGain);
      lfo.connect(lfoGain);
      lfoGain.connect(mainGain.gain);
      
      source.start();
      lfo.start();

      activeNodesRef.current.push(source, lp, lfo, lfoGain);
    }
    
    // Ensure context is running (double check)
    if (ctx.state === 'suspended') ctx.resume();

  }, [enabled, theme]); // Re-run when theme changes, but reuse context

  // Volume update
  useEffect(() => {
    if (userGainRef.current && ctxRef.current) {
        const t = ctxRef.current.currentTime;
        userGainRef.current.gain.setTargetAtTime(Math.max(0, Math.min(volume, 1)), t, 0.2);
    }
  }, [volume]);

  // Ducking logic
  useEffect(() => {
    const onPlay = () => {
      if (!ctxRef.current || !gainRef.current) return;
      const t = ctxRef.current.currentTime;
      const targetVal = theme === 'day' ? 0.02 : 0.08;
      gainRef.current.gain.setTargetAtTime(targetVal, t, 0.5);
    };
    const onStop = () => {
      if (!ctxRef.current || !gainRef.current) return;
      const t = ctxRef.current.currentTime;
      const targetVal = theme === 'day' ? 0.08 : 0.25; // Note: Day uses lower base gain in this graph
      // Actually, in the graph above:
      // Day mainGain = 0.5. 
      // Evening mainGain = 0.25.
      // So we should restore to those values.
      // Let's dynamically read current base? No, hardcode is safer for restore.
      const restoreVal = theme === 'day' ? 0.5 : 0.25; 
      gainRef.current.gain.setTargetAtTime(restoreVal, t, 1.0);
    };

    window.addEventListener('preview-audio-play', onPlay);
    window.addEventListener('preview-audio-stop', onStop);
    return () => {
      window.removeEventListener('preview-audio-play', onPlay);
      window.removeEventListener('preview-audio-stop', onStop);
    };
  }, [theme]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
        if (ctxRef.current) {
            try { ctxRef.current.close(); } catch {}
            ctxRef.current = null;
        }
    };
  }, []);

  return null;
});

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

const CameraLogger = memo(() => {
  const { camera } = useThree();
  
  useEffect(() => {
    // 仅保留控制台输出，作为开发者工具，移除对用户的干扰
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'p') {
        const { x, y, z } = camera.position;
        const info = `Camera Position: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`;
        console.log(info);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);
  
  return null;
});

const ResetCameraHandler = memo(() => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    const handleReset = () => {
      // 重置相机位置
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      
      // 如果存在控制器，重置目标并更新
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    };

    window.addEventListener('reset-camera', handleReset);
    return () => window.removeEventListener('reset-camera', handleReset);
  }, [camera, controls]);

  return null;
});

const DayAtmosphere = ({ mode }) => {
  const { scene } = useThree();
  const fogRef = useRef();

  useEffect(() => {
    // Initial Fog Setup
    // 使用 FogExp2 营造更自然的远处朦胧感
    const fog = new THREE.FogExp2('#ffffff', 0.002); 
    scene.fog = fog;
    fogRef.current = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((state, delta) => {
    if (!fogRef.current) return;
    
    let targetDensity = 0.002;
    let targetColor = new THREE.Color('#dbeafe'); // Default: blue-100 equivalent

    if (mode === 'snow') {
        targetDensity = 0.01; // Reduced from 0.025 to allow visibility of background and albums from distance
        targetColor.set('#f1f5f9'); // Slate-100 (Snowy white/gray)
    } else {
        targetDensity = 0.002; // Clear
        targetColor.set('#dbeafe');
    }

    // Smooth transition
    fogRef.current.density = THREE.MathUtils.lerp(fogRef.current.density, targetDensity, delta * 0.5);
    fogRef.current.color.lerp(targetColor, delta * 0.5);
  });

  return null;
};

const MusicUniverse = ({ isInteractive = true, showNavigation = true, highlightedTag }) => {
  const { musicData, loading, error } = useMusicData();
  const { isConnectionsPageActive, universeState, setUniverseState } = useContext(UniverseContext);
  const [currentTheme, setCurrentTheme] = useState(universeState.currentTheme || 'night'); // 默认主题设置为night
  const [dayMode, setDayMode] = useState('normal'); // 'normal', 'snow'
  const [showHint, setShowHint] = useState(universeState.hasSeenHint === undefined ? true : !universeState.hasSeenHint);
  const [hoveredMusic, setHoveredMusic] = useState(null);
  const [wallpaperMode, setWallpaperMode] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(1);
  // const [positionedMusicData, setPositionedMusicData] = useState([]);
  const isMobile = useIsMobile();

  // 傍晚主题配置状态
  const [showEveningControl, setShowEveningControl] = useState(false);
  const [eveningConfig, setEveningConfig] = useState(() => {
    // 根据当前时间初始化推荐色调
    const hour = new Date().getHours();
    if (hour >= 19 && hour < 20) return { ...EVENING_PRESETS.lateSunset, hueRotate: 0, saturate: 100, brightness: 100 };
    if (hour >= 20 || hour < 5) return { ...EVENING_PRESETS.twilight, hueRotate: 0, saturate: 100, brightness: 100 };
    return { ...EVENING_PRESETS.sunset, hueRotate: 0, saturate: 100, brightness: 100 };
  });

  // Wallpaper Mode Logic
  useEffect(() => {
    // Check URL params for wallpaper mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('wallpaper') === 'true') {
        setWallpaperMode(true);
        setShowHint(false);
    }

    const handleKeyDown = (e) => {
        if (e.key.toLowerCase() === 'h' || e.key === 'Escape') {
            setWallpaperMode(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (currentTheme !== 'evening' && currentTheme !== 'day') {
      setAmbientEnabled(false);
    }
  }, [currentTheme]);

  useEffect(() => {
    const enable = () => {
      if (currentTheme === 'evening' || currentTheme === 'day') {
        setAmbientEnabled(true);
      }
    };
    window.addEventListener('pointerdown', enable, { once: true });
    window.addEventListener('touchstart', enable, { once: true });
    window.addEventListener('keydown', enable, { once: true });
    return () => {
      window.removeEventListener('pointerdown', enable);
      window.removeEventListener('touchstart', enable);
      window.removeEventListener('keydown', enable);
    };
  }, [currentTheme]);

  // Sync theme changes to context
  useEffect(() => {
    if (currentTheme !== universeState.currentTheme) {
        setUniverseState(prev => ({ ...prev, currentTheme }));
    }
  }, [currentTheme, setUniverseState, universeState.currentTheme]);

  // Sync hint state to context when it closes
  useEffect(() => {
    if (!showHint && !universeState.hasSeenHint) {
        setUniverseState(prev => ({ ...prev, hasSeenHint: true }));
    }
  }, [showHint, universeState.hasSeenHint, setUniverseState]);

  const positionedMusicData = React.useMemo(() => {
    // 1. Try to retrieve from Context first (Persistence)
    if (universeState.positionedMusicData && universeState.positionedMusicData.length > 0) {
        return universeState.positionedMusicData;
    }

    // 2. Calculate if not in context
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
  }, [musicData, universeState.positionedMusicData]);

  // Save calculated positions to context
  useEffect(() => {
    if (positionedMusicData.length > 0 && !universeState.positionedMusicData) {
        setUniverseState(prev => ({ ...prev, positionedMusicData }));
    }
  }, [positionedMusicData, universeState.positionedMusicData, setUniverseState]);

  const themes = React.useMemo(() => ({
    day: "bg-gradient-to-b from-blue-900 via-blue-600 to-blue-300", // 白天：飞机上看到的深蓝到浅蓝渐变
    // 替换您当前的傍晚渐变代码
    evening: "evening-symmetric", // 傍晚：日落海面多色渐变
    night: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // 夜晚：银河星系的深色弥散渐变
    default: "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800", // Add a default theme
  }), []);

  




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

  const handleCoverClick = useCallback((data, albumPosition) => {
    setHoveredMusic({ data, position: albumPosition });
  }, []);

  const themeStyle = React.useMemo(() => {
    if (currentTheme === 'evening') {
      return {
        background: eveningConfig.cssGradient,
        filter: `hue-rotate(${eveningConfig.hueRotate}deg) saturate(${eveningConfig.saturate}%) brightness(${eveningConfig.brightness}%)`,
        transition: 'background 1s ease, filter 0.3s ease'
      };
    }
    return {};
  }, [currentTheme, eveningConfig]);

  return (
    <div 
      className={`w-screen h-screen relative ${currentTheme === 'evening' ? '' : themes[currentTheme]}`}
      style={themeStyle}
      role="main"
      aria-label="音乐宇宙三维可视化"
    >
      {/* 屏幕阅读器提示 */}
      <div className="sr-only">
        <p>这是一个三维音乐专辑浏览界面。使用键盘方向键可以环绕浏览，空格键重置视角。</p>
      </div>

      {showNavigation && !wallpaperMode && <UniverseNavigation />}
      {ambientEnabled && (currentTheme === 'evening' || currentTheme === 'day') && <AmbientSound enabled={true} volume={ambientVolume} theme={currentTheme} />}
      {musicData.length > 0 && positionedMusicData.length > 0 && (
        <Canvas
          style={{ width: '100%', height: '100%', touchAction: 'none' }} // 禁用浏览器默认触摸行为
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          className={isConnectionsPageActive && !highlightedTag ? 'filter blur-lg scale-90 transition-all duration-500' : 'transition-all duration-500'}
          // 移动端强制使用 1.0 DPR 以防止内存崩溃，尤其是纹理加载较多时
          dpr={isMobile ? [1, 1] : [1, 2]}
        >
          <WebGLContextHandler />
          <CameraLogger />
          <CameraSetup />
          <ResetCameraHandler />
          {!isMobile && <KeyboardControls isMobile={isMobile} />}
          {/* <TouchControls /> */} {/* 移除触摸控制 */}
          <OrbitControls 
            makeDefault
            enabled={isInteractive}
            enableRotate={true} // 移动设备上启用旋转
            enableZoom={true} 
            enablePan={true} // 移动设备上启用平移
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {currentTheme === 'night' && (
            <React.Suspense fallback={null}>
              <Stars isMobile={isMobile} />
            </React.Suspense>
          )}
          {currentTheme === 'day' && (
            <React.Suspense fallback={null}>
              <DayAtmosphere mode={dayMode} />
              {dayMode === 'normal' && (
                <>
                  <Clouds isMobile={isMobile} />
                  <PaperPlanes 
                    count={4} 
                    musicData={musicData} 
                    onRecommend={(data, pos) => handleCoverClick(data, pos)} 
                    isMobile={isMobile}
                  />
                </>
              )}
              {dayMode === 'snow' && (
                <>
                  <Snowfall count={isMobile ? 500 : 1500} />
                  <SnowMountain />
                </>
              )}
            </React.Suspense>
          )}
          {currentTheme === 'evening' && (
            <SceneErrorBoundary>
              <React.Suspense fallback={null}>
                <Evening isMobile={isMobile} config={eveningConfig} />
              </React.Suspense>
            </SceneErrorBoundary>
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
                dimmed={highlightedTag && !data.tags.includes(highlightedTag)}
              />
          ))}
          {hoveredMusic && <InfoCard data={hoveredMusic.data} position={hoveredMusic.position} onClose={() => setHoveredMusic(null)} isMobile={isMobile} />}
        </Canvas>
      )}

      {!wallpaperMode && (
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end space-y-3">
        <div className="flex items-center space-x-3">
        {/* 主题切换组 */}
        <div className="relative z-30">
          {/* 白天模式子选项 */}
          {currentTheme === 'day' && (
            <div className="absolute bottom-full left-0 mb-4 flex gap-2 z-20">
              <button
                onClick={() => setDayMode('normal')}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 border border-white/10 ${dayMode === 'normal' ? 'bg-white text-orange-500 shadow-lg scale-110' : 'bg-black/20 text-white/70 hover:bg-black/30 hover:text-white'}`}
                aria-label="晴空模式"
                title="晴空"
              >
                <SunIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDayMode('snow')}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 border border-white/10 ${dayMode === 'snow' ? 'bg-white text-blue-400 shadow-lg scale-110' : 'bg-black/20 text-white/70 hover:bg-black/30 hover:text-white'}`}
                aria-label="飘雪模式"
                title="飘雪"
              >
                <CloudIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="flex bg-gray-900/50 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/10">
            <button
            key="day-theme-button"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentTheme === 'day' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            onClick={() => setCurrentTheme('day')}
            aria-pressed={currentTheme === 'day'}
            aria-label="切换到白天主题"
            >
            白天
            </button>
            <button
            key="evening-theme-button"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentTheme === 'evening' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            onClick={() => setCurrentTheme('evening')}
            aria-pressed={currentTheme === 'evening'}
            aria-label="切换到傍晚主题"
            >
            傍晚
            </button>
            <button
            key="night-theme-button"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentTheme === 'night' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            onClick={() => setCurrentTheme('night')}
            aria-pressed={currentTheme === 'night'}
            aria-label="切换到夜晚主题"
            >
            夜晚
            </button>
        </div>
        </div>
        
        {/* 傍晚主题调色板按钮 */}
        {currentTheme === 'evening' && (
          <div className="relative group">
            <button
              className={`p-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg bg-gray-900/50 text-orange-300 hover:bg-orange-500/80 hover:text-white hover:scale-110 ${showEveningControl ? 'bg-orange-500/80 text-white' : ''}`}
              onClick={() => setShowEveningControl(!showEveningControl)}
              aria-label="调色板"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <div className="absolute bottom-full right-0 mb-3 w-32 p-2 bg-gray-900/90 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm border border-white/10 text-center pointer-events-none">
                <span className="font-bold block mb-1 text-orange-400">暮色调音台</span>
                自定义你的傍晚
            </div>
          </div>
        )}

        {/* 沉浸模式按钮 - 次级按钮设计 */}
        <div className="relative group">
            <button
              className="p-2.5 rounded-full bg-gray-900/50 hover:bg-sky-500/80 text-gray-300 hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg hover:shadow-sky-500/30 hover:scale-110"
              onClick={() => window.dispatchEvent(new CustomEvent('reset-camera'))}
              aria-label="重置视角"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Tooltip 提示 */}
            <div className="absolute bottom-full right-0 mb-3 w-32 p-2 bg-gray-900/90 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-sm border border-white/10 text-center">
                <span className="font-bold block mb-1 text-sky-400">重置视角</span>
                回到初始位置
                <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-gray-900/90 transform rotate-45 border-r border-b border-white/10"></div>
            </div>
        </div>

        {/* 沉浸模式按钮 - 次级按钮设计 */}
        <div className="relative group">
            <button
              className="p-2.5 rounded-full bg-gray-900/50 hover:bg-sky-500/80 text-gray-300 hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg hover:shadow-sky-500/30 hover:scale-110"
              onClick={() => setWallpaperMode(true)}
              aria-label="进入沉浸模式"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            {/* Tooltip 提示 */}
            <div className="absolute bottom-full right-0 mb-3 w-48 p-2 bg-gray-900/90 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-sm border border-white/10 text-center">
                <span className="font-bold block mb-1 text-sky-400">沉浸模式</span>
                隐藏所有界面元素，享受纯净的视觉体验。适合截图或作为动态壁纸。
                <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-gray-900/90 transform rotate-45 border-r border-b border-white/10"></div>
            </div>
        </div>

        <div className="relative group">
            <button
              className={`p-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg ${(currentTheme === 'evening' || currentTheme === 'day') ? 'bg-gray-900/50 text-gray-300 hover:bg-emerald-500/80 hover:text-white hover:scale-110' : 'bg-gray-800/40 text-gray-500 cursor-not-allowed'}`}
              onClick={() => { if (currentTheme === 'evening' || currentTheme === 'day') setAmbientEnabled(v => !v); }}
              aria-label="环境声"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5a1 1 0 012 0v14a1 1 0 01-2 0V5zM5 9a1 1 0 012 0v6a1 1 0 01-2 0V9zm12-2a1 1 0 012 0v10a1 1 0 01-2 0V7z" />
              </svg>
            </button>
            <div className="absolute bottom-full right-0 mb-3 w-56 p-2 bg-gray-900/90 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm border border-white/10 z-10">
                <div className="font-bold mb-1 text-emerald-400">环境声</div>
                <div className="text-[11px] mb-2">
                  {currentTheme === 'day' ? '舒缓氛围背景音。' : '傍晚海浪与风的声景。'}
                  试听时自动降低音量。
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-gray-300">音量</span>
                  <input type="range" min="0" max="1" step="0.01" value={ambientVolume} onChange={(e) => setAmbientVolume(parseFloat(e.target.value))} className="w-32 accent-emerald-400" />
                  <span className="text-[11px] text-gray-300">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-gray-900/90 transform rotate-45 border-r border-b border-white/10"></div>
            </div>
        </div>
        </div>
      </div>
      )}

      {/* 退出沉浸模式的隐藏按钮 (仅在移动鼠标时显示，或者一直显示一个非常淡的退出提示) */}
      {wallpaperMode && (
         <button
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/30 text-white/50 hover:bg-black/60 hover:text-white transition-all"
            onClick={() => setWallpaperMode(false)}
            title="退出沉浸模式"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>
      )}

      {/* 傍晚主题控制面板 */}
      {currentTheme === 'evening' && showEveningControl && !wallpaperMode && (
        <EveningThemeControl 
          currentConfig={eveningConfig} 
          onConfigChange={setEveningConfig}
          onClose={() => setShowEveningControl(false)}
        />
      )}

      {showHint && !wallpaperMode && (
        <div 
          className="absolute bottom-4 left-4 z-10 p-3 bg-gray-800/90 backdrop-blur-sm text-white rounded-lg shadow-lg text-sm opacity-90 max-w-xs md:max-w-md"
          role="status"
          aria-live="polite"
        >
          {isMobile ? 
            "提示：单指拖动浏览，双指捏合缩放。" : 
            "提示：使用方向键 ⬅️⬆️➡️⬇️ 或鼠标浏览。"}
        </div>
      )}
    </div>
  );
};

export default MusicUniverse;
