import { useState, useEffect } from 'react';

const useWindowOrientation = () => {
  const getOrientation = () => {
    if (typeof window === 'undefined') {
      return 'portrait'; // Default for SSR
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  };

  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const handleResize = () => {
      setOrientation(getOrientation());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return orientation;
};

export default useWindowOrientation;
