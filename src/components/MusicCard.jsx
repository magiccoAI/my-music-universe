import React, { useState } from 'react';
import AudioPreview from './AudioPreview';
import { getOptimizedImagePath } from '../utils/imageUtils';

const MusicCard = ({ 
  item, 
  playingCardId, 
  setPlayingCardId, 
  onHover, 
  onLeave, 
  onClick, 
  onKeyDown,
  showDate = true, 
  showNote = true,
  className = "" 
}) => {
  const isPlaying = playingCardId === item.id;
  const [localHover, setLocalHover] = useState(false);

  const splitNote = (note) => {
    if (!note) return [];
    return note.split(/\s*[,;\/]\s*|\s+and\s+/);
  };

  const handleMouseEnter = () => {
    setLocalHover(true);
    if (onHover) onHover(item.id);
  };

  const handleMouseLeave = () => {
    setLocalHover(false);
    if (onLeave) onLeave();
  };

  return (
    <div
      className={`
        relative group overflow-hidden
        rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90
        border ${isPlaying ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-slate-700/50'} 
        hover:border-indigo-500/30
        transition-all duration-500 ease-out
        shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10
        ${isPlaying ? 'scale-[1.02]' : 'hover:scale-[1.02]'}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {/* 专辑封面 */}
      <div className="relative overflow-hidden">
        <img
          src={getOptimizedImagePath(item.cover)}
          alt={`${item.album} - ${item.artist}`}
          className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${process.env.PUBLIC_URL}/${item.cover}`;
          }}
          loading="lazy"
        />
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent" />
        
        {/* 播放按钮覆盖层 */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying || localHover ? 'opacity-100' : 'opacity-0'}`}>
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayingCardId(isPlaying ? null : item.id);
                }}
                className="bg-black/30 hover:bg-indigo-600/80 backdrop-blur-md border border-white/20 text-white rounded-full p-4 transform transition-all duration-300 hover:scale-110 shadow-lg group-hover:shadow-indigo-500/50"
                aria-label={isPlaying ? "停止播放" : "播放预览"}
             >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
             </button>
        </div>

        {/* 悬停信息 */}
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          {showDate && <div className="text-slate-200 text-sm mb-2">分享于 {item.date}</div>}
          {showNote && (
            <div className="text-slate-300 text-xs">
              {splitNote(item.note).slice(0, 3).join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* 卡片底部信息 */}
      <div className="relative p-4">
        <div className="font-bold text-lg mb-1 text-white leading-tight">{item.music}</div>
        <div className="text-indigo-200 font-medium text-sm mb-2">{item.artist}</div>
        <div className="text-slate-300 text-xs">{item.album}</div>
        
        {/* Audio Preview Area */}
        {isPlaying && (
          <div className="mt-3 animate-fade-in" onClick={e => e.stopPropagation()}>
             <AudioPreview 
               term={`${item.artist} ${item.music}`} 
               previewUrl={item.previewUrl}
               isMobile={false} 
               autoPlay={true} 
               darkMode={true} 
             />
          </div>
        )}

        <div className={`absolute bottom-3 right-3 w-2 h-2 bg-indigo-400 rounded-full transition-opacity duration-300 ${isPlaying ? 'opacity-100 animate-ping' : 'opacity-0 group-hover:opacity-100'}`} />
      </div>
    </div>
  );
};

export default MusicCard;
