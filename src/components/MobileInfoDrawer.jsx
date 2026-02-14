import React, { useRef, useEffect, useState } from 'react';
import AudioPreview from './AudioPreview';

/**
 * MobileInfoDrawer - 移动端专用的信息抽屉 (Bottom Sheet)
 * 
 * 核心设计：
 * 1. 2D DOM 覆盖层：完全脱离 Canvas，解决 3D 卡片在手机上看不清、被遮挡的问题。
 * 2. 底部抽屉交互：符合手机用户习惯，半屏展示，手势友好。
 * 3. 沉浸式背景：带有毛玻璃效果 (backdrop-blur)，保持与背景的视觉联系。
 */
const MobileInfoDrawer = ({ data: music, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const drawerRef = useRef(null);

  // 入场动画
  useEffect(() => {
    if (music) {
      // 稍微延迟一下，让 DOM 挂载后再触发 transition
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [music]);

  // 处理关闭逻辑 (带离场动画)
  const handleClose = () => {
    setIsVisible(false);
    // 等待 transition 结束 (300ms) 再调用 onClose 卸载组件
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!music) return null;

  const isValidUrl = music.url && (music.url.startsWith('http://') || music.url.startsWith('https://'));

  // 获取封面图片 URL (简单处理，复用逻辑需谨慎，这里简单拼接)
  // 注意：这里没有复杂的纹理加载逻辑，直接用 img 标签，浏览器会自动缓存
  const publicUrl = process.env.PUBLIC_URL || '';
  const getCoverUrl = (path) => {
      if (!path) return '';
      // 优先尝试 webp (假设存在 optimized-images 目录，这与 Cover.jsx 逻辑一致)
      // 如果 Cover.jsx 里是动态加载纹理，这里为了简单和性能，直接加载原始图或 webp
      // 考虑到手机流量，尝试构建 webp 路径
      const parts = path.split('/');
      const filename = parts[parts.length - 1];
      const [name] = filename.split('.');
      return `${publicUrl}/optimized-images/${name}-mobile.webp`;
  };
  
  const coverUrl = getCoverUrl(music.cover);

  return (
    <>
      {/* 1. 背景遮罩 (Backdrop) - 点击空白处关闭 */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 2. 抽屉主体 (Drawer) */}
      <div 
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-[70] 
          bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]
          rounded-t-2xl p-5 pb-8 text-white
          transform transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
          flex flex-col max-h-[85vh] overflow-y-auto
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-description"
        onClick={(e) => e.stopPropagation()} // 防止点击抽屉内部触发背景关闭
      >
        {/* 顶部装饰条 (Handle) */}
        <div className="w-12 h-1.5 bg-gray-600/50 rounded-full mx-auto mb-6 flex-shrink-0" aria-hidden="true" />

        <div className="flex flex-col gap-5">
          {/* 头部：封面 + 标题信息 */}
          <div className="flex gap-4 items-start">
            {/* 封面缩略图 */}
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/10 bg-gray-800">
               <img 
                 src={coverUrl} 
                 alt={`Album cover for ${music.album}`}
                 className="w-full h-full object-cover"
                 onError={(e) => {
                     // 如果 webp 加载失败，回退到原始图片 (如果路径是相对的)
                     if (music.cover && !e.target.src.includes(music.cover)) {
                         e.target.src = music.cover.startsWith('http') ? music.cover : `${process.env.PUBLIC_URL}/${music.cover}`;
                     }
                 }}
               />
            </div>

            {/* 标题与艺术家 */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 id="drawer-title" className="font-bold text-xl leading-tight mb-1 truncate text-white">
                {music.music}
              </h3>
              <p id="drawer-description" className="text-indigo-300 font-medium mb-1 truncate">
                <span className="sr-only">Artist: </span>{music.artist}
              </p>
              <p className="text-gray-400 text-sm truncate">
                <span className="sr-only">Album: </span>{music.album}
              </p>
            </div>

            {/* 关闭按钮 */}
            <button 
              onClick={handleClose}
              className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-white rounded-full active:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="关闭信息卡片"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 播放器区域 */}
          <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
            <AudioPreview 
              term={`${music.artist} ${music.music}`} 
              previewUrl={music.previewUrl} 
              isMobile={true} 
            />
          </div>

          {/* 详细信息区 */}
          <div className="space-y-3 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">推文</span>
              <span 
                className="text-gray-200 text-right truncate max-w-[70%] cursor-help active:whitespace-normal active:text-clip active:overflow-visible transition-all"
                title={music.title}
                onClick={(e) => {
                  // 点击切换展开/折叠
                  const el = e.currentTarget;
                  if (el.classList.contains('truncate')) {
                    el.classList.remove('truncate');
                    el.classList.add('break-words', 'whitespace-normal');
                  } else {
                    el.classList.add('truncate');
                    el.classList.remove('break-words', 'whitespace-normal');
                  }
                }}
              >
                {music.title}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">时间</span>
              <span className="text-gray-200">{music.date}</span>
            </div>
            {music.note && (
              <div className="flex justify-between">
                <span className="text-gray-500">备注</span>
                <span className="text-indigo-200 italic">{music.note}</span>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          {isValidUrl && (
            <a
              href={music.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl font-semibold text-center shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>查看原文</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          
          {/* 底部安全区垫片 (Safe Area for iPhone Home Indicator) */}
          <div className="h-4 w-full" />
        </div>
      </div>
    </>
  );
};

export default MobileInfoDrawer;
