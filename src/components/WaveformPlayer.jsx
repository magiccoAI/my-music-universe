import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const WaveformPlayer = ({ audioUrl, height = 80, waveColor = '#818cf8', progressColor = '#4f46e5' }) => {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!audioUrl || !containerRef.current) return;

    // 清理旧实例
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    try {
      const wavesurfer = WaveSurfer.create({
        container: containerRef.current,
        height: height,
        waveColor: waveColor,
        progressColor: progressColor,
        cursorColor: '#ffffff',
        barWidth: 2,
        barGap: 3,
        responsive: true,
        normalize: true,
        backend: 'MediaElement', // 使用 MediaElement 后端以支持更好的流式传输和 CORS
      });

      wavesurfer.load(audioUrl);

      wavesurfer.on('ready', () => {
        setIsReady(true);
        setError(null);
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      wavesurfer.on('finish', () => setIsPlaying(false));
      
      wavesurfer.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setError('无法加载音频');
      });

      wavesurferRef.current = wavesurfer;
    } catch (err) {
      console.error('WaveSurfer init error:', err);
      setError('初始化播放器失败');
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, height, waveColor, progressColor]);

  const togglePlay = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  };

  if (error) {
    return <div className="text-red-400 text-sm py-4">{error}</div>;
  }

  return (
    <div className="w-full bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/5">
      <div ref={containerRef} className="w-full mb-3" />
      
      <div className="flex justify-center">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full 
            transition-all duration-300
            ${isReady 
              ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
          `}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>
      {!isReady && !error && (
        <div className="text-center text-xs text-gray-400 mt-2 animate-pulse">
          正在加载音频波形...
        </div>
      )}
    </div>
  );
};

export default WaveformPlayer;
