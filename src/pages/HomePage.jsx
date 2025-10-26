import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarBackground from '../components/StarBackground';
import NetEaseCloudMusicIcon from '../assets/icons/netcloud-icon.png';
import WeChatIcon from '../assets/icons/wechat-icon.png';
import useParticleSystem from '../hooks/useParticleSystem';

const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  // 使用自定义 Hook 管理粒子系统
  const particleConfig = {
    EMOJIS: ['⭐', '✨', '🎵', '🎶'],
    LIFE: {
      BASE: 40,
      RANDOM: 20,
      BURST: 50
    },
    SIZE: {
      BASE: 12,
      RANDOM: 8,
      BURST: 18
    },
    LIMITS: {
      NORMAL: 200,
      BURST: 300
    }
  };
  
  const { 
    handleMouseMove, 
    handleMouseClick, 
    ParticleRenderer 
  } = useParticleSystem(particleConfig);

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
      className="min-h-screen relative text-white flex flex-col items-center p-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleMouseClick}
    >
      {/* 粒子渲染器 */}
      <ParticleRenderer />

      <StarBackground />

      {/* 顶部导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-20 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-4 flex justify-center space-x-8 shadow-md">
        <Link to="/" className="text-white text-lg font-semibold hover:text-blue-300 transition duration-300">首页</Link>
        <a href="/music-universe" onClick={handleMusicUniverseClick} className="text-white text-lg font-semibold hover:text-blue-300 transition duration-300">音乐封面宇宙</a>
        <Link to="/archive" className="text-white text-lg font-semibold hover:text-blue-300 transition duration-300">我的音乐时光机</Link>
      </nav>

      {/* 主体内容 */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24 pb-8 px-6 relative z-10 text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-text-glow">
          探索我的音乐星河
        </h1>

        <div className="text-lg md:text-xl leading-relaxed text-gray-100 space-y-6">
          <p>这是我为公众号「<span className="font-semibold text-indigo-300">D小调片段记录</span>」的音乐歌单所建的可视化空间。每一首歌都是一颗星，映照着某个时刻的心绪与记忆。</p>

          <p className="text-indigo-200 font-medium">在这里，你可以<span className="text-pink-300">按风格穿行</span>，<span className="text-pink-300">沿年份追溯</span>，亦可<span className="text-pink-300">随意漫游</span>，
          让音乐轨迹引领记忆旅程。</p>

          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full opacity-70"></div>
        </div>
      </div>
      {/* 下方导航按钮 */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <a
          href="/music-universe"
          onClick={handleMusicUniverseClick}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          探索音乐封面宇宙
        </a>
        <Link to="/archive" className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
          查看音乐时光机数据
        </Link>
      </div>

      <p>我把这些旋律当作生命的注脚。愿它们在此停驻片刻，也在你的世界里，泛起一点微光。</p>
      {/* 外部链接 */}
      <div className="flex justify-center space-x-6 mt-8 mb-12">
        <a
          href="https://music.163.com/playlist?id=14356909162&uct2=U2FsdGVkX1/gFqE4/o/Ao72aJFZQeOfU4v1DPeNGiAE="
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-red-500 transition-colors duration-300"
          title="「D小调片段记录」公众号音乐分享-歌单合集"
        >
          <img src={NetEaseCloudMusicIcon} alt="网易云音乐" className="w-9 h-9" loading="lazy" />
        </a>
        <a
          href="https://mp.weixin.qq.com/s/P-UimdNlkT5cUGt572dBAQ"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-green-500 transition-colors duration-300"
          title="公众号：D小调片段记录"
        >
          <img src={WeChatIcon} alt="微信公众号" className="w-9 h-9" loading="lazy" />
        </a>
      </div>

      {/* 首次访问提示模态框 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-gray-900 p-8 rounded-lg shadow-xl max-w-md text-center border border-cyan-400">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">欢迎来到音乐封面宇宙！</h3>
            <p className="text-gray-300 mb-6">
              首次加载需要准备大量资源（包括音乐封面、3D 效果等），可能需要一些时间。
              <br /><br />
              加载完成后，您可以通过键盘方向键或鼠标移动来探索这片音乐星空。
            </p>
            <button
              onClick={handleConfirmNavigation}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
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



