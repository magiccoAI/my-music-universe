// Updated HomePage.jsx
// Key changes:
// 1) More refined layout with balanced whitespace
// 2) Reduced headline size; improved hierarchy
// 3) Simplified trailing meteor effect (example hook usage shown)
// 4) Calmer color palette; subtle motion

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarBackground from '../components/StarBackground';
import NetEaseCloudMusicIcon from '../assets/icons/netcloud-icon.webp';
import WeChatIcon from '../assets/icons/wechat-icon.webp';
import useMeteorTrail from '../hooks/useMeteorTrail';
import useIsMobile from '../hooks/useIsMobile';

const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();
  const [showBackground, setShowBackground] = useState(false);

  const { handleMouseMove, MeteorRenderer } = useMeteorTrail();

  // Defer heavy visual components
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 100); // Small delay to let main content paint first
    return () => clearTimeout(timer);
  }, []);

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
      className="relative min-h-screen w-full text-white overflow-hidden flex flex-col"
      onMouseMove={!isMobile ? handleMouseMove : undefined}
    >
      {showBackground && <StarBackground starCount={isMobile ? 500 : 5000} />}
      {!isMobile && <MeteorRenderer />}

      {/* top nav */}
      <nav className="fixed top-0 left-0 right-0 z-20 py-4 backdrop-blur-md bg-white/5 flex justify-center gap-10 border-b border-white/10">
        <Link to="/" className="text-base font-medium hover:text-sky-300 transition">首页</Link>
        <a
          href="/music-universe"
          onClick={handleMusicUniverseClick}
          className="text-base font-medium hover:text-sky-300 transition"
        >音乐封面宇宙</a>
        <Link to="/archive" className="text-base font-medium hover:text-sky-300 transition">我的音乐时光机</Link>
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
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

       
      </header>

      {/* external links */}
      <footer className="pb-12 flex justify-center gap-6 z-10">
        <a
          href="https://music.163.com/playlist?id=14356909162&uct2=U2FsdGVkX1/gFqE4/o/Ao72aJFZQeOfU4v1DPeNGiAE="
          target="_blank"
          rel="noopener noreferrer"
          title="「D小调片段记录」过往公众号推文歌单合集"
          className="hover:opacity-80 transition"
        >
          <img src={NetEaseCloudMusicIcon} alt="网易云" className="w-8 h-8" />
        </a>
        <a
          href="https://mp.weixin.qq.com/s/P-UimdNlkT5cUGt572dBAQ"
          target="_blank"
          rel="noopener noreferrer"
          title="公众号"
          className="hover:opacity-80 transition"
        >
          <img src={WeChatIcon} alt="微信" className="w-8 h-8" />
        </a>
      </footer>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-gray-900/70 p-8 rounded-xl shadow-xl max-w-sm text-center border border-sky-500/40 backdrop-blur-md">
            <h3 className="text-lg font-bold text-sky-300 mb-4">欢迎来到音乐封面宇宙！</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              首次加载需要准备大量图像与3D资源，可能需要一点时间。
              加载完成后，你可以用方向键或鼠标移动来探索星空。
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
    </div>
  );
};

export default HomePage;
