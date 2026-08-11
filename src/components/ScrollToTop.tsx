import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          type="button"
          title="Voltar ao topo"
          aria-label="Voltar ao topo da página"
          className="fixed bottom-20 right-4 sm:bottom-[88px] sm:right-6 z-40 h-11 w-11 rounded-2xl bg-slate-900/90 dark:bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-200 group"
        >
          <ChevronUp size={22} className="stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
