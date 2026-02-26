// Updated HomePage.jsx
// Key changes:
// 1) More refined layout with balanced whitespace
// 2) Reduced headline size; improved hierarchy
// 3) Simplified trailing meteor effect (example hook usage shown)
// 4) Calmer color palette; subtle motion

import React, { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import StarBackground from '../components/StarBackground'; // Removed static import
import NetEaseCloudMusicIconWebP from '../assets/icons/netcloud-icon.webp';
import WeChatIconWebP from '../assets/icons/wechat-icon.webp';
import NetEaseCloudMusicIconPng from '../assets/icons/netcloud-icon.png';
import WeChatIconPng from '../assets/icons/wechat-icon.png';
import useMeteorTrail from '../hooks/useMeteorTrail';
import useIsMobile from '../hooks/useIsMobile';
import useMusicData from '../hooks/useMusicData'; // 引入数据钩子用于预取
import { aboutContent } from '../data/aboutContent';

const StarBackground = React.lazy(() => import('../components/StarBackground')); // Lazy load
const SnowBgImage = process.env.PUBLIC_URL + '/images/stars-snow.jpg';
const DataJsonImage = process.env.PUBLIC_URL + '/images/data-json-id1.webp';
const BasicTableImage = process.env.PUBLIC_URL + '/images/Basic Music Data Table.webp';

const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [aboutLang, setAboutLang] = useState('zh');

  const isMobile = useIsMobile();
  const [showBackground, setShowBackground] = useState(false);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);

  // 在首页静默预取音乐数据，利用 UniverseContext 缓存
  // 优化：将预取逻辑延迟到首页完全加载后，避免阻塞首屏资源（LCP 优化）
  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      setShouldPrefetch(true);
    }, 3500); // 延迟 3.5s 再开始获取大数据文件
    return () => clearTimeout(prefetchTimer);
  }, []);

  // 仅在 shouldPrefetch 为 true 时才激活钩子逻辑
  // 注意：useMusicData 内部已经处理了缓存，所以这里延迟调用是安全的
  useMusicData(shouldPrefetch); 

  // Update HTML lang attribute when aboutLang changes
  useEffect(() => {
    document.documentElement.lang = aboutLang === 'zh' ? 'zh-CN' : aboutLang;
  }, [aboutLang]);

  const t = aboutContent[aboutLang];

  const { handleMouseMove, MeteorRenderer } = useMeteorTrail();

  // Defer heavy visual components
  useEffect(() => {
    // 桌面端延迟 0.5s 显示 3D 背景，移动端不显示（或显示静态图）
    // 对于移动端，这里其实 showBackground 也会变 true，但渲染逻辑里我们会拦截
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, isMobile ? 50 : 500); // 移动端可以快一点显示静态背景
    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleMusicUniverseClick = (e) => {
    e.preventDefault();
    const hasVisited = localStorage.getItem('hasVisitedMusicUniverse');
    if (!hasVisited) {
      setShowModal(true);
    } else {
      navigate('/music-universe');
    }
  };

  const handleConfirmNavigation = () => {
    setShowModal(false);
    navigate('/music-universe');
  };

  return (
    <div
      className="relative min-h-screen w-full text-white overflow-x-hidden flex flex-col"
      onMouseMove={!isMobile ? handleMouseMove : undefined}
    >
      {isMobile ? (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/stars-snow.jpg)` }}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/50 to-black" />
        </div>
      ) : (
        <>
          {showBackground && (
            <Suspense fallback={<div className="fixed inset-0 bg-black -z-10" />}>
              <StarBackground starCount={5000} />
            </Suspense>
          )}
          <MeteorRenderer />
        </>
      )}

      {/* top nav */}
      <nav className="fixed top-0 left-0 right-0 z-20 py-3 backdrop-blur-md bg-black/20 flex justify-center items-center gap-8 md:gap-12 border-b border-white/5 transition-all duration-300">
        <Link 
          to="/" 
          className="relative group py-2"
        >
          <span className="font-sans font-medium text-xs md:text-sm tracking-widest text-gray-400 group-hover:text-white transition-colors duration-300">首页</span>
          <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full opacity-50"></span>
        </Link>
        
        <div className="w-1 h-1 rounded-full bg-white/10"></div>

        <a
          href="/music-universe"
          onClick={handleMusicUniverseClick}
          className="relative group py-2"
        >
          <span className="font-sans font-medium text-xs md:text-sm tracking-widest text-gray-400 group-hover:text-sky-300 transition-colors duration-300">音乐封面宇宙</span>
          <span className="absolute bottom-0 left-0 w-0 h-px bg-sky-300 transition-all duration-300 group-hover:w-full opacity-50"></span>
        </a>

        <div className="w-1 h-1 rounded-full bg-white/10"></div>

        <Link 
          to="/archive" 
          className="relative group py-2"
        >
          <span className="font-sans font-medium text-xs md:text-sm tracking-widest text-gray-400 group-hover:text-purple-300 transition-colors duration-300">我的音乐时光机</span>
          <span className="absolute bottom-0 left-0 w-0 h-px bg-purple-300 transition-all duration-300 group-hover:w-full opacity-50"></span>
        </Link>
      </nav>

      {/* hero */}
      <header className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-16 text-center z-10 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-300 via-sky-400 to-teal-300 bg-clip-text text-transparent">
          探索我的音乐星河
        </h1>
        <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6">
          这里是公众号「D小调片段记录」的音乐歌单可视化空间。每一首歌像一颗星，映照着某一时刻的心绪和记忆。
        </p>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-6">
          你可以按风格穿行；可以沿年份追溯；也可以随意漫游，
          让音乐轨迹引领记忆旅程。
        </p>
        <div className="w-40 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-60 mb-8" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/music-universe"
            onClick={handleMusicUniverseClick}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 transition font-semibold text-white text-sm md:text-base shadow-md shadow-sky-500/20"
          >
            探索音乐封面宇宙
          </a>
          <Link
            to="/archive"
            className="px-7 py-3 rounded-full border border-gray-600 hover:bg-gray-800 transition text-gray-300 text-sm md:text-base font-semibold"
          >
            查看音乐时光机数据
          </Link>
        </div>

        {/* Story Signal Trigger */}
        <button
          onClick={() => setShowAbout(true)}
          className="group relative flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sky-500/30 transition-all duration-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] mx-auto"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
          </div>
          <span className="text-xs md:text-sm text-gray-400 group-hover:text-sky-200 transition-colors font-mono tracking-wider">
            来自设计者的信号：关于这个网站
          </span>
        </button>

       
      </header>

      {/* external links */}
      <footer className="pb-12 flex flex-col items-center gap-5 z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-700"></div>
          <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Contact</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-700"></div>
        </div>
        
        <div className="flex justify-center gap-8">
          <a
            href="https://music.163.com/playlist?id=14356909162&uct2=U2FsdGVkX1/gFqE4/o/Ao72aJFZQeOfU4v1DPeNGiAE="
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2"
            title="「D小调片段记录」过往公众号推文歌单合集"
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-sky-500/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
              <picture>
                <source srcSet={NetEaseCloudMusicIconWebP} type="image/webp" />
                <source srcSet={NetEaseCloudMusicIconPng} type="image/png" />
                <img src={NetEaseCloudMusicIconPng} alt="网易云音乐" className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
              </picture>
            </div>
            <span className="text-[10px] text-gray-500 group-hover:text-sky-400 transition-colors font-mono">网易云歌单</span>
          </a>

          <a
            href="https://mp.weixin.qq.com/s/P-UimdNlkT5cUGt572dBAQ"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2"
            title="关注公众号：D小调片段记录"
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-green-500/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
              <picture>
                <source srcSet={WeChatIconWebP} type="image/webp" />
                <source srcSet={WeChatIconPng} type="image/png" />
                <img src={WeChatIconPng} alt="微信公众号" className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
              </picture>
            </div>
            <span className="text-[10px] text-gray-500 group-hover:text-green-400 transition-colors font-mono">公众号</span>
          </a>
        </div>

        <div className="mt-6 text-[10px] text-gray-600 font-mono opacity-60">
          © 2025 MagicCoAI (D小调片段记录)
        </div>
      </footer>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-gray-900/70 p-8 rounded-xl shadow-xl max-w-sm text-center border border-sky-500/40 backdrop-blur-md">
            <h3 className="text-lg font-bold text-sky-300 mb-4">欢迎来到音乐封面宇宙！</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              首次加载需要准备大量图像与3D资源，可能需要一点时间。
              加载完成后，{isMobile ? '你可以通过触摸拖拽来探索星空。' : '你可以用方向键或鼠标移动来探索星空。'}
            </p>
            <button
              onClick={handleConfirmNavigation}
              className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              了解了，开始探索
            </button>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
          <div className="relative bg-gray-900/80 p-8 rounded-xl shadow-[0_0_50px_rgba(14,165,233,0.15)] max-w-xl w-full mx-4 text-left border border-sky-500/30 backdrop-blur-md animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-6 border-b border-sky-500/20 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                <h3 className="text-lg font-bold text-sky-100 font-mono tracking-wider">
                  {t.title}
                </h3>
              </div>
              <button 
                onClick={() => setAboutLang(l => l === 'zh' ? 'en' : 'zh')}
                className="px-3 py-1 rounded-full border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-colors text-xs font-mono"
              >
                {aboutLang === 'zh' ? 'EN' : '中文'}
              </button>
            </div>
            
            <div className="space-y-6 text-gray-300 text-sm leading-8 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sky-500/30 scrollbar-track-transparent font-sans flex-1 min-h-0">
              <p className="tracking-wide first-letter:text-2xl first-letter:text-sky-400 first-letter:mr-1 first-letter:font-bold">
                {t.intro}
              </p>
              
              {/* Data Visualization Section */}
              <div className="my-6 space-y-4">
                <figure className="relative group rounded-lg overflow-hidden border border-sky-500/30 bg-black/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                  <div className="absolute inset-0 bg-sky-500/5 pointer-events-none mix-blend-overlay" />
                  <img 
                    src={BasicTableImage} 
                    alt="Original Music Data Table" 
                    className="w-full h-auto opacity-90 hover:opacity-100 transition-all duration-500"
                    onError={(e) => {
                      if (e.target.src.endsWith('.webp')) {
                        e.target.src = e.target.src.replace('.webp', '.png');
                      }
                    }}
                  />
                  <figcaption className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-[10px] text-sky-300/70 text-center font-mono tracking-wider">
                    {t.imageCaption1}
                  </figcaption>
                </figure>

                <div className="flex justify-center text-sky-500/50">
                  <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                <figure className="relative group rounded-lg overflow-hidden border border-sky-500/30 bg-black/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                  <div className="absolute inset-0 bg-sky-500/5 pointer-events-none mix-blend-overlay" />
                  <img 
                    src={DataJsonImage} 
                    alt="Music Collection Data JSON Source" 
                    className="w-full h-auto opacity-90 hover:opacity-100 transition-all duration-500"
                    onError={(e) => {
                      if (e.target.src.endsWith('.webp')) {
                        e.target.src = e.target.src.replace('.webp', '.png');
                      } else {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center text-xs text-sky-400/50 font-mono bg-gray-900/90">
                    <div className="text-left p-4">
                      &#123;<br/>
                      &nbsp;&nbsp;"id": 1,<br/>
                      &nbsp;&nbsp;"title": "The Other Side",<br/>
                      &nbsp;&nbsp;"artist": "Moonchild",<br/>
                      &nbsp;&nbsp;"date": "2022-06-22"<br/>
                      &#125;
                    </div>
                  </div>
                  <figcaption className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-[10px] text-sky-300/70 text-center font-mono tracking-wider">
                    {t.imageCaption2}
                  </figcaption>
                </figure>
              </div>

              <div className="relative pl-4 border-l-2 border-sky-500/30 my-6 italic">
                <p className="text-gray-200">{t.quote}</p>
              </div>

              <p className="leading-loose">
                {t.techP1}
              </p>
              
              <p className="leading-loose">
                {t.techP2}
              </p>

              {t.techP3 && (
                <p className="leading-loose">
                  {t.techP3}
                </p>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-sky-500/20 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="group flex items-center gap-2 px-6 py-2 rounded-full border border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500/50 transition-all duration-300"
              >
                <span className="text-xs font-mono text-sky-400 group-hover:text-sky-300">CLOSE SIGNAL</span>
                <span className="text-sky-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
