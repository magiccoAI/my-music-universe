import React, { useState, useEffect } from 'react';
import WaveformPlayer from './WaveformPlayer';
import logger from '../utils/logger';

const SmartWaveformPlayer = ({ artist, title, initialUrl }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 辅助函数：判断 URL 是否可能是音频文件
    // 排除常见的网页链接，如网易云、QQ音乐、微信公众号文章等
    const isPotentialAudioFile = (url) => {
      if (!url) return false;
      const lowerUrl = url.toLowerCase();
      
      // 排除已知非音频页面
      const blockedDomains = [
        'music.163.com',
        'y.qq.com',
        'mp.weixin.qq.com',
        'open.spotify.com',
        'youtube.com',
        'youtu.be'
      ];
      
      if (blockedDomains.some(domain => lowerUrl.includes(domain))) {
        return false;
      }

      return true;
    };

    // 如果初始 URL 是直接音频链接且不是页面链接，直接使用
    if (isPotentialAudioFile(initialUrl)) {
      setAudioUrl(initialUrl);
      return;
    }

    // 封装搜索函数
    const searchItunes = async (searchTerm) => {
       const encodedTerm = encodeURIComponent(searchTerm);
       const response = await fetch(`https://itunes.apple.com/search?term=${encodedTerm}&media=music&limit=1`);
       if (!response.ok) throw new Error('Network response was not ok');
       const data = await response.json();
       return data;
    };

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 第一次尝试：完整艺术家 + 歌名
        let data = await searchItunes(`${artist} ${title}`);
        
        if (data.resultCount > 0 && data.results[0].previewUrl) {
          setAudioUrl(data.results[0].previewUrl);
        } else {
           // 失败处理：尝试分割艺术家名称（取第一位）
           const firstArtist = artist.split(/[,&]/)[0].trim();
           
           if (firstArtist && firstArtist !== artist) {
              logger.log(`音频搜索重试: ${firstArtist} ${title}`);
              data = await searchItunes(`${firstArtist} ${title}`);
              
              if (data.resultCount > 0 && data.results[0].previewUrl) {
                 setAudioUrl(data.results[0].previewUrl);
              } else {
                 setError('未找到试听音频');
              }
           } else {
              setError('未找到试听音频');
           }
        }
      } catch (err) {
        logger.error("Error fetching audio preview:", err);
        setError('加载音频失败');
      } finally {
        setLoading(false);
      }
    };

    if (artist && title) {
      fetchPreview();
    }
  }, [artist, title, initialUrl]);

  if (loading) {
    return (
      <div className="w-full h-24 bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/5">
        <div className="text-indigo-300 text-sm animate-pulse flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在搜寻音频信号...
        </div>
      </div>
    );
  }

  // 如果没有找到音频或发生错误，直接返回 null 以隐藏组件
  if (error || !audioUrl) {
    return null;
  }

  return (
    <WaveformPlayer audioUrl={audioUrl} height={80} waveColor="#818cf8" progressColor="#4f46e5" />
  );
};

export default SmartWaveformPlayer;
