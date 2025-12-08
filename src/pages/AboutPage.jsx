import React, { useState } from 'react';
import UniverseNavigation from '../components/UniverseNavigation';
import StarBackground from '../components/StarBackground';

const DataJsonImage = process.env.PUBLIC_URL + '/images/data-json-id1.webp';
const BasicTableImage = process.env.PUBLIC_URL + '/images/Basic Music Data Table.webp';

const AboutPage = () => {
  const [lang, setLang] = useState('zh');

  const content = {
    zh: {
      title: "< 关于这个宇宙 />",
      intro: (
        <>
          这个网站，是我为自己打造的<span className="text-sky-200 font-semibold">“音乐记忆合集宇宙”</span>。它暂时没有集成全面的播放资源，只是从一份基础的音乐数据表格（ <code className="bg-black/40 px-2 py-1 rounded text-sky-400 font-mono text-sm">data.json</code> ）延伸出来的星图，但对我而言，它是一个外部记忆体——帮助我在看到封面的瞬间，重新提取当时的旋律、心境与感受。
        </>
      ),
      imageCaption1: "STEP 1: RAW DATA COLLECTION",
      imageCaption2: "STEP 2: STRUCTURED JSON DATA",
      quote: "“在公众号 2022–2023 的推文尾声，我分享了一些歌。把那些零散片段收拢到同一个入口，记录的意义就被再次点亮：当你按下播放键（或只是停留在封面上），一系列声波与触感的体验就有机会被启动。”",
      techP1: (
        <>
          我一直对可视化着迷：像《黑客帝国》的数据流、维基百科的关系图、各种创意交互。于是我用 <span className="text-sky-300 font-mono font-bold">React</span> 和 <span className="text-purple-300 font-mono font-bold">TraeAI</span> 及多种大语言模型，一点点摸索，把这份歌单做成一个可视化空间。
        </>
      ),
      techP2: (
        <>
          未来它或许会迁移发展成更多与我生命相关的东西，但在此刻，它只想温柔地提醒我：这些歌，曾经陪伴我，也仍在陪伴我。这是一位非专业开发者的持续实践，也是一段与工具共创的旅程；每一次迭代，都是在把<span className="text-white font-bold border-b border-sky-500/50">“听过什么歌”</span>变成<span className="text-sky-300 font-bold border-b border-sky-500/50">“看见我的故事”</span>。
        </>
      )
    },
    en: {
      title: "< About This Universe />",
      intro: (
        <>
          This digital expanse is my personal <span className="text-sky-200 font-semibold">"Cosmos of Musical Memories."</span> It is not merely a player, but a star map born from a humble spreadsheet (<code className="bg-black/40 px-2 py-1 rounded text-sky-400 font-mono text-sm">data.json</code>). To me, it serves as an external memory bank—one where a single glance at an album cover instantly retrieves the melodies, moods, and emotions of days past.
        </>
      ),
      imageCaption1: "STEP 1: RAW DATA COLLECTION",
      imageCaption2: "STEP 2: STRUCTURED JSON DATA",
      quote: "“From 2022 to 2023, I shared musical fragments at the end of my blog posts. Gathering these scattered pieces here reignites the purpose of documentation: whether you press play or simply gaze upon a cover, a symphony of sonic and emotional experiences is reawakened.”",
      techP1: (
        <>
          I have always been captivated by the art of visualization—from the digital rain of <em>The Matrix</em> to the knowledge webs of Wikipedia. Guided by this fascination, I utilized <span className="text-sky-300 font-mono font-bold">React</span>, <span className="text-purple-300 font-mono font-bold">TraeAI</span>, and various LLMs to meticulously sculpt this playlist into an immersive visual dimension.
        </>
      ),
      techP2: (
        <>
          While this universe may evolve to hold more of my life's data, for now, it stands as a gentle testament: these songs have been, and remain, my constant companions. This is the ongoing journey of an amateur developer co-creating with AI—where every iteration transforms <span className="text-white font-bold border-b border-sky-500/50">"what I heard"</span> into <span className="text-sky-300 font-bold border-b border-sky-500/50">"seeing my story."</span>
        </>
      )
    }
  };

  const t = content[lang];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-sky-500/30">
      <StarBackground count={3000} />
      <UniverseNavigation />
      
      {/* Language Switcher */}
      <div className="fixed top-24 right-4 md:right-12 z-50 animate-fade-in-down">
         <button 
           onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
           className="px-4 py-2 rounded-full border border-sky-500/30 bg-black/40 backdrop-blur text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/60 transition-all font-mono text-xs md:text-sm tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.1)]"
         >
           {lang === 'zh' ? 'EN' : '中文'}
         </button>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold text-sky-400 mb-12 font-mono tracking-wider text-center animate-fade-in-up">
          {t.title}
        </h1>
        
        <div className="bg-gray-900/40 backdrop-blur-lg rounded-2xl p-6 md:p-12 border border-sky-500/10 shadow-[0_0_50px_rgba(14,165,233,0.1)] space-y-8 leading-relaxed text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Introduction */}
            <p className="tracking-wide text-lg md:text-xl leading-8">
              {t.intro}
            </p>

            {/* Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                <figure className="relative group rounded-xl overflow-hidden border border-sky-500/20 bg-black/50 shadow-lg hover:shadow-sky-500/20 transition-all duration-500">
                    <div className="absolute inset-0 bg-sky-500/5 pointer-events-none mix-blend-overlay" />
                    <img 
                    src={BasicTableImage} 
                    alt="Original Music Data Table" 
                    loading="lazy"
                    className="w-full h-48 md:h-64 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => {
                      if (e.target.src.endsWith('.webp')) {
                        e.target.src = e.target.src.replace('.webp', '.png');
                      }
                    }}
                    />
                    <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-xs text-sky-300/70 text-center font-mono tracking-widest">
                    {t.imageCaption1}
                    </figcaption>
                </figure>

                <figure className="relative group rounded-xl overflow-hidden border border-sky-500/20 bg-black/50 shadow-lg hover:shadow-sky-500/20 transition-all duration-500">
                    <div className="absolute inset-0 bg-sky-500/5 pointer-events-none mix-blend-overlay" />
                    <img 
                    src={DataJsonImage} 
                    alt="Music Collection Data JSON Source" 
                    loading="lazy"
                    className="w-full h-48 md:h-64 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
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
                        <div className="text-left p-6">
                            &#123;<br/>
                            &nbsp;&nbsp;"id": 1,<br/>
                            &nbsp;&nbsp;"title": "The Other Side",<br/>
                            &nbsp;&nbsp;"artist": "Moonchild",<br/>
                            &nbsp;&nbsp;"date": "2022-06-22"<br/>
                            &#125;
                        </div>
                    </div>
                    <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-xs text-sky-300/70 text-center font-mono tracking-widest">
                    {t.imageCaption2}
                    </figcaption>
                </figure>
            </div>

            {/* Quote Block */}
            <div className="relative pl-8 border-l-4 border-sky-500/40 italic bg-gradient-to-r from-sky-900/20 to-transparent p-6 rounded-r-xl">
                <p className="text-gray-100 text-lg">{t.quote}</p>
            </div>

            {/* Tech Stack & Philosophy */}
            <div className="space-y-6 text-lg">
                <p className="leading-loose">
                  {t.techP1}
                </p>
                
                <p className="leading-loose">
                  {t.techP2}
                </p>
            </div>
        </div>
        
        <div className="text-center mt-16 text-gray-600 text-sm font-mono">
             Music Universe Collection · Powered by TraeAI
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
