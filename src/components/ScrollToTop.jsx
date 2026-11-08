import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-red-600 text-red-950 font-black shadow-2xl shadow-amber-500/40 border-2 border-amber-300 hover:scale-110 active:scale-95 transition-all group animate-fade-in-up flex items-center space-x-1.5"
    >
      <ArrowUp className="w-5 h-5 stroke-[2.8] text-red-950 group-hover:-translate-y-0.5 transition-transform" />
      <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Top</span>
    </button>
  );
}
