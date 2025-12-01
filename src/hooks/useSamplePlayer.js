import { useState, useCallback, useRef, useEffect } from 'react';

const useSamplePlayer = (soundUrls) => {
  const audioCtxRef = useRef(null);
  const buffersRef = useRef(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const isLoadingRef = useRef(false); // To prevent multiple initializations

  const initializeAudio = useCallback(async () => {
    if (isLoadingRef.current || isLoaded) return; // Prevent re-initialization
    isLoadingRef.current = true;

    try {
      // Create AudioContext here, triggered by user interaction via playSound
      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = context;

      const promises = soundUrls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch sound: ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        buffersRef.current.set(url, audioBuffer);
      });

      await Promise.all(promises);
      setIsLoaded(true);
    } catch (e) {
      console.error("Failed to load or decode audio samples", e);
      setError(e);
    } finally {
      isLoadingRef.current = false;
    }
  }, [soundUrls, isLoaded]);

  const playSound = useCallback(async (url) => {
    // Initialize on the first play attempt
    if (!isLoaded && !isLoadingRef.current) {
      await initializeAudio();
    }

    const audioCtx = audioCtxRef.current;
    
    // Check if initialization was successful and the buffer exists
    if (!audioCtx || !buffersRef.current.has(url)) {
      return;
    }

    // Resume context if it's suspended
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffersRef.current.get(url);
    source.connect(audioCtx.destination);
    source.start(0);
  }, [isLoaded, initializeAudio]);

  // Effect for cleanup
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(e => console.error("Failed to close AudioContext", e));
    };
  }, []);

  return { playSound, isLoaded, error };
};

export default useSamplePlayer;
