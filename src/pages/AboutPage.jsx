import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import StarBackground from '../components/StarBackground';
import { aboutContent } from '../data/aboutContent';

const DataJsonImage = process.env.PUBLIC_URL + '/images/data-json-id1.webp';
const BasicTableImage = process.env.PUBLIC_URL + '/images/Basic Music Data Table.webp';

const AUDIO_MAP = {
  zh: null,
  en: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-en.mp3',
  wuu: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-wuu.mp3',
  yue: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-yue.mp3',
  fr: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-fr.mp3',
  it: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-it.mp3',
  es: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-es.mp3',
  de: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-de.mp3',
  ja: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-ja.mp3',
  ko: process.env.PUBLIC_URL + '/audio/aboutpage-multilang/about-ko.mp3',
};

const LANG_LABELS = {
  zh: '简中',
  en: 'EN',
  wuu: '沪语',
  yue: '粤语',
  fr: 'FR',
  it: 'IT',
  es: 'ES',
  de: 'DE',
  ja: 'JP',
  ko: 'KR'
};

const AboutPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('zh');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // Mobile collapsible menu state
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Set initial lang attribute
    document.documentElement.lang = lang;

    audioRef.current = new Audio();
    
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };

    audioRef.current.addEventListener('timeupdate', updateProgress);
    audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handleLangChange = (newLang) => {
    if (newLang === lang) return;
    
    setLang(newLang);
    // Update HTML lang attribute for accessibility and Lighthouse
    document.documentElement.lang = newLang;
    
    // Stop current audio and reset progress
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current || !AUDIO_MAP[lang]) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = AUDIO_MAP[lang];
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed:", e);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !isPlaying) return;
    
    const progressBar = progressBarRef.current;
    if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        
        if (audioRef.current.duration) {
            audioRef.current.currentTime = percentage * audioRef.current.duration;
            setProgress(percentage * 100);
        }
    }
  };

  const t = aboutContent[lang] || aboutContent['en']; // Fallback

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-sky-500/30">
      <StarBackground count={1000} />
      
      
      {/* Back Button */}
      <div className="fixed top-24 left-4 md:left-12 z-40 animate-fade-in-down">
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

      {/* Language Switcher & Audio Player */}
      <div className="fixed top-24 right-4 md:right-12 z-40 animate-fade-in-down flex flex-col items-end gap-4">
         <div className="bg-black/40 backdrop-blur rounded-2xl p-2 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)] flex flex-col items-end">
             <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`text-[10px] font-mono text-right mb-2 pr-2 tracking-widest transition-all duration-300 flex items-center gap-2 group ${
                   isLangMenuOpen ? 'text-sky-300' : 'text-sky-400/70 hover:text-sky-300'
                }`}
                aria-expanded={isLangMenuOpen}
             >
                <span>SIGNAL FREQUENCY</span>
                <svg 
                   xmlns="http://www.w3.org/2000/svg" 
                   viewBox="0 0 20 20" 
                   fill="currentColor" 
                   className={`w-3 h-3 transition-transform duration-300 md:hidden ${isLangMenuOpen ? 'rotate-180' : ''}`}
                >
                   <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
             </button>
             
             <div className={`${isLangMenuOpen ? 'grid' : 'hidden md:grid'} grid-cols-3 md:grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-2 duration-300`}>
                {Object.keys(aboutContent).map(l => (
                   <button 
                     key={l}
                     onClick={() => {
                        handleLangChange(l);
                        if (window.innerWidth < 768) setIsLangMenuOpen(false);
                     }}
                     className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300 ${
                       lang === l 
                       ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.3)] scale-105' 
                       : 'bg-transparent border-sky-500/10 text-gray-400 hover:text-sky-300 hover:border-sky-500/40'
                     }`}
                     aria-label={`Switch language to ${LANG_LABELS[l] || l}`}
                     aria-pressed={lang === l}
                   >
                     {LANG_LABELS[l] || l.toUpperCase()}
                   </button>
                ))}
             </div>
         </div>

         {/* Audio Player Control */}
         {AUDIO_MAP[lang] && (
            <div className="flex flex-col gap-2 w-full items-end">
                <button
                onClick={toggleAudio}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-500 group backdrop-blur-md will-change-transform transform-gpu ${
                    isPlaying 
                    ? 'bg-sky-900/40 border-sky-400/60 text-sky-300' 
                    : 'bg-black/60 border-sky-500/30 text-sky-400/80 hover:bg-sky-500/10 hover:border-sky-500/60 hover:text-sky-300'
                }`}
                >
                {isPlaying ? (
                    <>
                        <div className="relative flex h-3 w-3">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-50"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
                        </div>
                        <span className="text-xs font-mono tracking-widest animate-pulse will-change-opacity">TRANSMITTING...</span>
                        {/* Animated Bars */}
                        <div className="flex gap-0.5 items-end h-3 ml-1 will-change-transform transform-gpu">
                            <span className="w-0.5 bg-sky-400 animate-[pulse_1.5s_ease-in-out_infinite] h-full"></span>
                            <span className="w-0.5 bg-sky-400 animate-[pulse_2.1s_ease-in-out_infinite] h-2/3"></span>
                            <span className="w-0.5 bg-sky-400 animate-[pulse_1.8s_ease-in-out_infinite] h-full"></span>
                            <span className="w-0.5 bg-sky-400 animate-[pulse_2.0s_ease-in-out_infinite] h-1/2"></span>
                        </div>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-mono tracking-widest">PLAY AUDIO</span>
                    </>
                )}
                </button>

                {/* Progress Bar */}
                {isPlaying && (
                    <div 
                        className="w-full max-w-[200px] h-1.5 bg-sky-900/30 rounded-full overflow-hidden cursor-pointer group"
                        ref={progressBarRef}
                        onClick={handleProgressClick}
                    >
                        <div 
                            className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-100 ease-linear relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                )}
            </div>
         )}
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
                    <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-xs text-sky-200 text-center font-mono tracking-widest">
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
                    <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-xs text-sky-200 text-center font-mono tracking-widest">
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
        
        <div className="text-center mt-16 text-gray-500 text-sm font-mono">
             Music Universe Collection · Powered by TraeAI
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
