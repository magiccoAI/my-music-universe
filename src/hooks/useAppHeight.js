import { useEffect } from 'react';

const useAppHeight = () => {
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    window.addEventListener('resize', setAppHeight);
    setAppHeight(); // Set initial value

    return () => window.removeEventListener('resize', setAppHeight);
  }, []);
};

export default useAppHeight;
