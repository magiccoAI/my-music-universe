import React, { useState } from 'react';

const MusicPlayer = ({ 
  isPlaying, 
  onTogglePlayPause, 
  songTitle, 
  artistName,
  currentTime = 0,
  duration = 0,
  volume = 0.5,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  onSeek
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Circular progress calculations
  const radius = 22; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? currentTime / duration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {songTitle && artistName && isHovered && (
        <div className="text-white text-right animate-fade-in pr-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 mb-1">
          <div className="text-sm font-bold shadow-black drop-shadow-md text-cyan-300">{songTitle}</div>
          <div className="text-xs opacity-75 shadow-black drop-shadow-md">{artistName}</div>
        </div>
      )}

      <div 
        className="flex flex-row items-center gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Volume Control - Show on Hover (Horizontal) */}
        <div 
          className={`transition-all duration-300 origin-right transform ${
            isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          } bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex flex-row items-center gap-3 border border-white/10 h-10`}
        >
          <button
            onClick={onToggleMute}
            className="text-white/80 hover:text-white transition-colors flex items-center justify-center"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.972 7.972 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Play Button Container with Circular Progress */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Progress Circle Background */}
          <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
            />
            {/* Progress Circle Indicator */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="transparent"
              stroke="#00f2ea" // var(--accent-cyan)
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          <button
            aria-label={isPlaying ? '暂停' : '播放'}
            onClick={onTogglePlayPause}
            className="relative w-9 h-9 rounded-full flex items-center justify-center
                       bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg
                       hover:from-indigo-600 hover:to-sky-600 transition-all duration-300 focus:outline-none z-10"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
                className="h-5 w-5 ml-0.5"
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
            
            {/* Pulse Effect */}
            {isPlaying && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30"></span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
