import { useState, useEffect } from 'react';

const useScrollEffect = (sensitivity: number = 0.05, maxOffset: number = 12) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOffset = Math.max(-maxOffset, Math.min(maxOffset, scrollY * sensitivity));
      setOffset(newOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sensitivity, maxOffset]);

  return offset;
};

export default useScrollEffect;