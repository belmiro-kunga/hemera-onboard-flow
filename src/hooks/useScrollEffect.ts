import { useState, useEffect } from 'react';

const useScrollEffect = (sensitivity: number = 0.1, maxOffset: number = 20) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Inverte o movimento: scroll para baixo move formulário para cima
      const newOffset = Math.max(-maxOffset, Math.min(maxOffset, -scrollY * sensitivity));
      setOffset(newOffset);
    };

    // Adiciona log para debug
    console.log('Scroll effect initialized');
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Chama uma vez para definir posição inicial
    
    return () => {
      console.log('Scroll effect cleanup');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sensitivity, maxOffset]);

  return offset;
};

export default useScrollEffect;