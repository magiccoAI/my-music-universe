import React, { useState } from 'react';

const MusicPlayer = ({ isPlaying, onTogglePlayPause, songTitle, artistName }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-3">
      {songTitle && artistName && isHovered && (
        <div className="text-white text-right">
          <div className="text-sm font-bold">{songTitle}</div>
          <div className="text-xs opacity-75">{artistName}</div>
        </div>
      )}
      <button
        aria-label={isPlaying ? '暂停' : '播放'}
        onClick={onTogglePlayPause}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-11 h-11 rounded-full flex items-center justify-center
                   bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg
                   hover:from-indigo-600 hover:to-sky-600 transition-all duration-300 focus:outline-none"
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {isPlaying && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;