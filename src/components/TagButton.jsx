import React, { useCallback } from 'react';

const TagButton = ({ tag, count, relatedTags, index, onClick }) => {
  const isRelated = relatedTags.includes(tag);

  // 根据关系状态计算样式
  const getButtonStyles = () => {
    const baseStyles = `
      px-4 py-2 rounded-full text-sm font-medium 
      transition-all duration-300 transform-gpu
      border border-transparent
      relative overflow-hidden
    `;
    
    if (isRelated) {
      return `
        ${baseStyles}
        bg-gradient-to-r from-cyan-500 to-blue-600 
        text-white shadow-lg shadow-cyan-500/30
        scale-105 border-cyan-400/50
        hover:shadow-cyan-500/50 hover:scale-110
      `;
    }
    
    return `
      ${baseStyles}
      bg-gradient-to-r from-slate-700 to-slate-800
      text-slate-200 hover:text-white
      hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-700
      hover:shadow-lg hover:shadow-blue-500/20
      hover:scale-105 hover:border-slate-500/50
    `;
  };

  // 添加发光效果对于相关标签
  const glowEffect = isRelated ? (
    <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md -z-10 animate-pulse" />
  ) : null;

  return (
    <button
      onClick={() => onClick(tag)}
      className={getButtonStyles()}
      aria-label={`探索 ${tag} 风格的音乐，共 ${count} 首`}
    >
      {glowEffect}
      <span className="relative z-10">
        {tag} 
        <span className="text-slate-300 ml-1">({count})</span>
      </span>
    </button>
  );
};

export default React.memo(TagButton);