import React, { useCallback, useState } from 'react';

const MusicCard = ({ music, setHovered, cover }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseEnter = useCallback(() => {
    // 设置悬停状态
    if (setHovered) {
      setHovered(music.id);
    }
  }, [setHovered, music.id]);

  const handleMouseLeave = useCallback(() => {
    if (setHovered) {
      setHovered(null);
    }
  }, [setHovered]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // 获取占位符颜色基于音乐ID
  const getPlaceholderColor = () => {
    const colors = [
      'from-purple-500/20 to-pink-500/20',
      'from-blue-500/20 to-cyan-500/20',
      'from-green-500/20 to-emerald-500/20',
      'from-orange-500/20 to-red-500/20',
      'from-indigo-500/20 to-purple-500/20',
    ];
    return colors[music.id % colors.length];
  };

  return (
    <div
      className="
        group relative
        bg-gradient-to-br from-slate-800/80 to-slate-900/80
        rounded-2xl p-4
        border border-slate-700/50
        shadow-lg shadow-slate-900/50
        hover:shadow-cyan-500/20 hover:shadow-xl
        hover:border-cyan-500/30
        transition-all duration-500
        backdrop-blur-sm
        overflow-hidden
      "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 悬停光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      {/* 专辑封面 */}
      <div className={`relative mb-4 aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${getPlaceholderColor()}`}>
        {cover && !imageError ? (
          <>
            <img
              src={cover}
              alt={`${music.title} - ${music.artist}`}
              className={`
                w-full h-full object-cover transition-all duration-700
                ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
                group-hover:scale-105
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl text-slate-400">🎵</div>
          </div>
        )}
        

      </div>

      {/* 音乐信息 */}
      <div className="space-y-2">
        <h3 className="
          text-white font-semibold text-lg leading-tight
          line-clamp-2 group-hover:text-cyan-200 transition-colors duration-300
        ">
          {music.title}
        </h3>
        
        <p className="
          text-slate-400 text-sm
          line-clamp-1 group-hover:text-slate-300 transition-colors duration-300
        ">
          {music.artist}
        </p>

        {/* 标签列表 */}
        {music.tags && music.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {music.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="
                  px-2 py-1 text-xs rounded-full
                  bg-slate-700/50 text-slate-300
                  border border-slate-600/50
                  group-hover:bg-slate-600/50 group-hover:border-slate-500/50
                  transition-all duration-300
                "
              >
                {tag}
              </span>
            ))}
            {music.tags.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-slate-800/50 text-slate-400">
                +{music.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 角标 - 显示音乐类型或其他元数据 */}
      {music.year && (
        <div className="absolute top-3 right-3">
          <span className="
            px-2 py-1 text-xs rounded-full
            bg-slate-900/80 text-slate-300
            border border-slate-700/50
            backdrop-blur-sm
          ">
            {music.year}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MusicCard);