import React, { useState, useEffect, useRef } from 'react';

const AudioPreview = ({ term, previewUrl: directUrl, isMobile, autoPlay = false, darkMode = false }) => {
  const [audioUrl, setAudioUrl] = useState(directUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // If we have a direct URL, use it and skip fetching
    if (directUrl) {
      setAudioUrl(directUrl);
      return;
    }

    if (!term) return;

    const fetchPreview = async () => {
      setLoading(true);
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
          setAudioUrl(data.results[0].previewUrl);
        } else {
          // If strict search fails, try relaxing it (maybe just song name if artist+song failed?)
          // For now, let's just say no result found to keep it simple and accurate
          setAudioUrl(null);
        }
      } catch (err) {
        console.error("Error fetching audio preview:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce or just fetch
    fetchPreview();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [term]);

  // AutoPlay logic
  useEffect(() => {
      if (autoPlay && audioUrl && audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise
                  .then(() => setIsPlaying(true))
                  .catch(error => console.warn("Auto-play prevented:", error));
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

  return (
    <div 
      className={`mt-2 rounded-lg p-2 border transition-colors duration-300 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-100'}`} 
      onClick={(e) => e.stopPropagation()}
    >
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onEnded={() => { handleEnded(); window.dispatchEvent(new CustomEvent('preview-audio-stop')); }} 
        onPause={() => { setIsPlaying(false); window.dispatchEvent(new CustomEvent('preview-audio-stop')); }}
        onPlay={() => { setIsPlaying(true); window.dispatchEvent(new CustomEvent('preview-audio-play')); }}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
            Preview (30s)
        </span>
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
      {/* iTunes attribution (required by Apple usually, or good practice) */}
      <div className={`text-[10px] text-right mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-300'}`}>
        Provided by Apple Music
      </div>
    </div>
  );
};

export default AudioPreview;
