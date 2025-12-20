import React, { useState, useEffect, useRef } from 'react';

const AudioPreview = ({ term, previewUrl: directUrl, isMobile, autoPlay = false, darkMode = false }) => {
  const [audioUrl, setAudioUrl] = useState(directUrl || null);
  const [applePreviewUrl, setApplePreviewUrl] = useState(null);
  const [useAppleFallback, setUseAppleFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Reset fallback state when directUrl changes
    setUseAppleFallback(false);
    
    // If we have a direct URL that is NOT NetEase, use it and skip fetching
    if (directUrl && !directUrl.includes('music.163.com')) {
      setAudioUrl(directUrl);
      setApplePreviewUrl(null);
      return;
    }

    // If it's NetEase or no URL, we try to fetch Apple Music preview
    if (!term) {
        if (directUrl) setAudioUrl(directUrl);
        return;
    }

    const fetchPreview = async () => {
      // If we don't have a direct URL, show loading. 
      // If we have a NetEase URL, we fetch in background (no loading indicator needed unless we want to show "checking fallback")
      if (!directUrl) setLoading(true);
      
      setError(null);
      try {
        // Encode the search term
        const encodedTerm = encodeURIComponent(term);
        // iTunes Search API
        // Limit to 1 result, media type music
        const response = await fetch(`https://itunes.apple.com/search?term=${encodedTerm}&media=music&limit=1`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.resultCount > 0) {
          const foundUrl = data.results[0].previewUrl;
          setApplePreviewUrl(foundUrl);
          if (!directUrl) {
            setAudioUrl(foundUrl);
          }
        } else {
          setApplePreviewUrl(null);
          if (!directUrl) setAudioUrl(null);
        }
      } catch (err) {
        console.error("Error fetching audio preview:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Set initial audioUrl if directUrl exists (NetEase)
    if (directUrl) setAudioUrl(directUrl);

    // Debounce or just fetch
    fetchPreview();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [term, directUrl]);

  // AutoPlay logic
  useEffect(() => {
      if (autoPlay && audioUrl && audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise
                  .then(() => setIsPlaying(true))
                  .catch(error => {
                    if (error.name === 'AbortError') {
                        // Ignore abort errors (component unmounted during load)
                        return;
                    }
                    console.warn("Auto-play prevented:", error);
                  });
          }
      }
  }, [audioUrl, autoPlay]);

  const togglePlay = (e) => {
    e.stopPropagation(); // Prevent closing the card
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (loading) return <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-400'} mt-2`}>正在寻找试听片段...</div>;
  if (!audioUrl) return null; // Hide if no audio found

  // Netease Cloud Music Iframe Support
  // Render NetEase if audioUrl is NetEase AND we are not forcing Apple Fallback
  const isNetEase = audioUrl && audioUrl.includes('music.163.com/outchain/player');
  
  if (isNetEase && !useAppleFallback) {
      // Extract height from URL params if present, default to 86
      let iframeHeight = 86;
      try {
        const urlObj = new URL(audioUrl.startsWith('//') ? 'https:' + audioUrl : audioUrl);
        const heightParam = urlObj.searchParams.get('height');
        if (heightParam) {
          // Add some padding/buffer or use exact height. Netease usually matches iframe height to param.
          // However, for safety, let's use the param value directly if it seems reasonable.
          // The standard heights are usually 32, 66 (requires iframe height 86), 430.
          // If param is 66, iframe usually needs to be 86 to fit the border/shadow? 
          // Actually user provided: src="...height=66" iframe height=86.
          // Let's stick to 86 as default, but if it's clearly a large player (like > 100), update it.
          const h = parseInt(heightParam, 10);
          if (!isNaN(h) && h > 100) {
             iframeHeight = h;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }

      return (
          <div 
            className={`mt-2 rounded-lg overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`} 
            onClick={(e) => e.stopPropagation()}
          >
              <iframe 
                  frameBorder="no" 
                  border="0" 
                  marginWidth="0" 
                  marginHeight="0" 
                  width="100%" 
                  height={iframeHeight}
                  src={audioUrl}
                  title="Netease Music Player"
              ></iframe>
              <div className="flex justify-between items-center px-2 pb-1">
                <div className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-300'}`}>
                    Provided by Netease Cloud Music
                </div>
                {applePreviewUrl && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setUseAppleFallback(true);
                            // Also update audioUrl to applePreviewUrl for the standard player
                            setAudioUrl(applePreviewUrl);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded border ${darkMode ? 'border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' : 'border-indigo-200 text-indigo-500 hover:bg-indigo-50'} transition-colors`}
                    >
                        内容不符/播放失败？试听 Apple Music
                    </button>
                )}
              </div>
          </div>
      );
  }

  // Use applePreviewUrl if fallback is active
  const activeUrl = useAppleFallback ? applePreviewUrl : audioUrl;

  if (!activeUrl) return null; // Hide if no audio found

  return (
    <div 
      className={`mt-2 rounded-lg p-2 border transition-colors duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-100'}`} 
      onClick={(e) => e.stopPropagation()}
    >
      <audio 
        ref={audioRef} 
        src={activeUrl} 
        onEnded={() => { handleEnded(); window.dispatchEvent(new CustomEvent('preview-audio-stop')); }} 
        onPause={() => { setIsPlaying(false); window.dispatchEvent(new CustomEvent('preview-audio-stop')); }}
        onPlay={() => { setIsPlaying(true); window.dispatchEvent(new CustomEvent('preview-audio-play')); }}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            Preview (30s)
        </span>
        <div className="flex items-center gap-2">
            {useAppleFallback && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setUseAppleFallback(false);
                        setAudioUrl(directUrl);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border ${darkMode ? 'border-slate-500/30 text-slate-400 hover:bg-slate-500/20' : 'border-gray-200 text-gray-400 hover:bg-gray-50'} transition-colors`}
                >
                    返回网易云
                </button>
            )}
            <button
            onClick={togglePlay}
            className={`
                flex items-center justify-center w-8 h-8 rounded-full 
                transition-all duration-200 
                ${isPlaying 
                    ? (darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600') 
                    : (darkMode ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700')}
            `}
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
            {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
            )}
            </button>
        </div>
      </div>
      {/* iTunes attribution (required by Apple usually, or good practice) */}
      <div className={`text-[10px] text-right mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-300'}`}>
        Provided by Apple Music
      </div>
    </div>
  );
};

export default AudioPreview;
