// hooks/usePianoSounds.js
import { useCallback, useRef, useMemo } from 'react';

const usePianoSounds = () => {
  const pianoSoundFiles = useMemo(() => [
    `${process.env.PUBLIC_URL}/audio/a6-82015.mp3`,
    `${process.env.PUBLIC_URL}/audio/b6-82017.mp3`,
    `${process.env.PUBLIC_URL}/audio/c6-102822.mp3`,
    `${process.env.PUBLIC_URL}/audio/d6-82018.mp3`,
    `${process.env.PUBLIC_URL}/audio/e6-82016.mp3`,
    `${process.env.PUBLIC_URL}/audio/f6-102819.mp3`,
    `${process.env.PUBLIC_URL}/audio/g6-82013.mp3`,   
    `${process.env.PUBLIC_URL}/audio/re-78500.mp3`,
    `${process.env.PUBLIC_URL}/audio/fa-78409.mp3`,
    `${process.env.PUBLIC_URL}/audio/sol-101774.mp3`,
    `${process.env.PUBLIC_URL}/audio/si-80238.mp3`,
    `${process.env.PUBLIC_URL}/audio/2-notes-octave-guitar-83275.mp3`,
    `${process.env.PUBLIC_URL}/audio/bass-guitar-three-notes-43765.mp3`,
    `${process.env.PUBLIC_URL}/audio/sfx-piano-bar2.mp3`,
    `${process.env.PUBLIC_URL}/audio/sfx-piano-effect9.mp3`,
  ], []);

  const audioContextRef = useRef(null);
  const audioBuffers = useRef({});

  const loadAudioOnDemand = useCallback(async (index) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error("AudioContext is not supported on this browser.", e);
        return;
      }
    }

    const soundFile = pianoSoundFiles[index % pianoSoundFiles.length];
    if (audioBuffers.current[soundFile]) {
      return audioBuffers.current[soundFile];
    }

    try {
      const response = await fetch(soundFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBuffers.current[soundFile] = audioBuffer;
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load or decode audio:', soundFile, error);
    }
  }, [pianoSoundFiles]);

  const playPianoSound = useCallback(async (index) => {
    if (!audioContextRef.current) return;

    // 恢复音频上下文
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const audioBuffer = await loadAudioOnDemand(index);
    if (!audioBuffer) return;

    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [loadAudioOnDemand]);

  const preloadSounds = useCallback((count = 3) => {
    console.log(`Preloading ${count} piano sounds...`);
    const preloadPromises = [];
    
    for (let i = 0; i < Math.min(count, pianoSoundFiles.length); i++) {
      preloadPromises.push(loadAudioOnDemand(i).catch(console.error));
    }
    
    return Promise.allSettled(preloadPromises);
  }, [loadAudioOnDemand, pianoSoundFiles.length]);

  const getLoadedCount = useCallback(() => {
    return loadedCount.current;
  }, []);

  const getTotalCount = useCallback(() => {
    return pianoSoundFiles.length;
  }, [pianoSoundFiles.length]);

  const isSoundLoaded = useCallback((index) => {
    const soundFile = pianoSoundFiles[index % pianoSoundFiles.length];
    return !!pianoSounds.current[soundFile];
  }, [pianoSoundFiles]);

  const cleanup = useCallback(() => {
    console.log('Cleaning up piano sounds...');
    
    // 停止所有播放中的音频
    Object.values(pianoSounds.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        // 注意：不要移除 src，这会导致错误
      }
    });
    
    // 重置状态
    pianoSounds.current = {};
    audioLoadPromises.current = {};
    loadedCount.current = 0;
  }, []);

  // 批量播放多个音效（用于复杂交互）
  const playSoundSequence = useCallback(async (indices, delay = 100) => {
    for (let i = 0; i < indices.length; i++) {
      await playPianoSound(indices[i]);
      if (i < indices.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [playPianoSound]);

  return {
    // 主要功能
    playPianoSound,
    playSoundSequence,
    preloadSounds,
    
    // 状态查询
    getLoadedCount,
    getTotalCount,
    isSoundLoaded,
    
    // 资源管理
    loadAudioOnDemand,
    cleanup,
    
    // 元数据
    soundFiles: pianoSoundFiles,
  };
};

export default usePianoSounds;