import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logger from '../utils/logger';

const ArtistBio = ({ artist }) => {
  const [bio, setBio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'zh' or 'en'
  const [displayArtist, setDisplayArtist] = useState(artist);

  useEffect(() => {
    if (!artist) return;

    const fetchBioData = async (searchName) => {
      try {
        // 首先尝试中文维基百科
        let response = await axios.get(`https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`);
        return { data: response.data, lang: 'zh' };
      } catch (err) {
        // 如果中文失败，尝试英文
        try {
          let response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`);
          return { data: response.data, lang: 'en' };
        } catch (enErr) {
          throw enErr;
        }
      }
    };

    const fetchBio = async () => {
      setLoading(true);
      setError(null);
      setBio(null);

      try {
        try {
          // 第一次尝试：使用完整艺术家名称
          const { data, lang } = await fetchBioData(artist);
          if (data && (data.extract || data.description)) {
            setBio({
              extract: data.extract,
              description: data.description,
              thumbnail: data.thumbnail?.source,
              url: data.content_urls?.desktop?.page
            });
            setSource(lang);
            setDisplayArtist(artist);
          }
        } catch (err) {
          // 失败处理：尝试分割艺术家名称
          const firstArtist = artist.split(/[,&]/)[0].trim();
          if (firstArtist && firstArtist !== artist) {
            logger.log(`完整名称搜索失败，尝试搜索首位艺术家: ${firstArtist}`);
            const { data, lang } = await fetchBioData(firstArtist);
            if (data && (data.extract || data.description)) {
              setBio({
                extract: data.extract,
                description: data.description,
                thumbnail: data.thumbnail?.source,
                url: data.content_urls?.desktop?.page
              });
              setSource(lang);
              setDisplayArtist(firstArtist);
            } else {
              setError('未找到相关艺术家信息');
            }
          } else {
            setError('未找到相关艺术家信息');
          }
        }
      } catch (err) {
        logger.error('Fetch bio error:', err);
        setError('无法加载艺术家简介');
      } finally {
        setLoading(false);
      }
    };

    fetchBio();
  }, [artist]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="text-gray-400 text-sm italic border-l-2 border-gray-600 pl-3">
        {error || '暂无艺术家简介'}
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-start gap-4">
        {bio.thumbnail && (
          <img 
            src={bio.thumbnail} 
            alt={displayArtist} 
            className="w-24 h-24 object-cover rounded-lg shadow-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
            关于艺术家
            <span className="text-xs font-normal text-gray-500 px-1.5 py-0.5 rounded border border-gray-600">
              {source === 'zh' ? '维基百科' : 'Wikipedia'}
            </span>
          </h3>
          {bio.description && (
            <p className="text-sm text-gray-400 mb-2 italic">{bio.description}</p>
          )}
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-6 hover:line-clamp-none transition-all">
            {bio.extract}
          </p>
          {bio.url && (
            <a 
              href={bio.url} 
              // 移除 target="_blank" 以便在当前页打开，允许用户回退
              className="inline-block mt-2 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              阅读完整条目 &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistBio;
