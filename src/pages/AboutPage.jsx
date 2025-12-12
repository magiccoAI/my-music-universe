import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UniverseNavigation from '../components/UniverseNavigation';
import StarBackground from '../components/StarBackground';
import { aboutContent } from '../data/aboutContent';

const DataJsonImage = process.env.PUBLIC_URL + '/images/data-json-id1.webp';
const BasicTableImage = process.env.PUBLIC_URL + '/images/Basic Music Data Table.webp';

const AboutPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('zh');

  const t = aboutContent[lang];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-sky-500/30">
      <StarBackground count={3000} />
      <UniverseNavigation />
      
      {/* Back Button */}
      <div className="fixed top-24 left-4 md:left-12 z-50 animate-fade-in-down">
         <button 
           onClick={() => navigate(-1)}
           className="p-2 rounded-full border border-sky-500/30 bg-black/40 backdrop-blur text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/60 transition-all shadow-[0_0_15px_rgba(14,165,233,0.1)] group"
           aria-label="Go Back"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform">
             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
           </svg>
         </button>
      </div>

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

                {t.techP3 && (
                  <p className="leading-loose">
                    {t.techP3}
                  </p>
                )}
            </div>

            {/* Close Button (Bottom) */}
            <div className="mt-8 pt-6 border-t border-sky-500/20 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 px-6 py-2 rounded-full border border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500/50 transition-all duration-300"
              >
                <span className="text-xs font-mono text-sky-400 group-hover:text-sky-300">CLOSE SIGNAL</span>
                <span className="text-sky-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
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
