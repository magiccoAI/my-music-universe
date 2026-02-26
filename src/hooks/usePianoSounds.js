// hooks/usePianoSounds.js
import { useCallback, useRef, useMemo } from 'react';

import logger from '../utils/logger';
const usePianoSounds = () => {
  const majoritySoundFiles = useMemo(() => [
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
  ], []);

  const minoritySoundFiles = useMemo(() => [
    `${process.env.PUBLIC_URL}/audio/2-notes-octave-guitar-83275.mp3`,
    `${process.env.PUBLIC_URL}/audio/bass-guitar-three-notes-43765.mp3`,
    `${process.env.PUBLIC_URL}/audio/sfx-piano-bar2.mp3`,
    `${process.env.PUBLIC_URL}/audio/sfx-piano-effect9.mp3`,
  ], []);

  // For loading and direct indexing, we still need a combined list.
  const pianoSoundFiles = useMemo(() => [...majoritySoundFiles, ...minoritySoundFiles], [majoritySoundFiles, minoritySoundFiles]);

  const audioContextRef = useRef(null);
  const audioBuffers = useRef({});
  const loadedCount = useRef(0);

  const loadAudioOnDemand = useCallback(async (soundFile) => {
    if (!audioContextRef.current) {
      // Initialize AudioContext if not already done (lazy init)
       try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        logger.error("AudioContext is not supported on this browser.", e);
        return null;
      }
    }

    // If the audio is already buffered, return it.
    if (audioBuffers.current[soundFile]) {
      return audioBuffers.current[soundFile];
    }

    // Otherwise, fetch, decode, and buffer it.
    try {
      const response = await fetch(soundFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBuffers.current[soundFile] = audioBuffer; // Cache the buffer
      loadedCount.current += 1;
      return audioBuffer;
    } catch (error) {
      logger.error(`Failed to load or decode audio: ${soundFile}`, error);
      return null;
    }
  }, []);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        logger.log('AudioContext initialized.');
      } catch (e) {
        logger.error("AudioContext is not supported on this browser.", e);
      }
    }
  }, []);

  const playPianoSound = useCallback(async (index) => {
    let soundFile;
    if (index === undefined) {
      // Weighted random selection
      if (Math.random() < 0.8) { // 80% chance for majority sounds
        soundFile = majoritySoundFiles[Math.floor(Math.random() * majoritySoundFiles.length)];
      } else { // 20% chance for minority sounds
        soundFile = minoritySoundFiles[Math.floor(Math.random() * minoritySoundFiles.length)];
      }
    } else {
      soundFile = pianoSoundFiles[index % pianoSoundFiles.length];
    }

    const audioBuffer = await loadAudioOnDemand(soundFile);
    if (!audioBuffer || !audioContextRef.current) return;

    // 恢复音频上下文
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      logger.error('Error playing sound:', error);
    }
  }, [majoritySoundFiles, minoritySoundFiles, pianoSoundFiles, loadAudioOnDemand]);

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
    return !!audioBuffers.current[soundFile];
  }, [pianoSoundFiles]);

  const cleanup = useCallback(() => {
    console.log('Cleaning up piano sounds...');
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      audioContextRef.current = null;
    }
    
    // Reset state
    audioBuffers.current = {};
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
    initAudio,
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