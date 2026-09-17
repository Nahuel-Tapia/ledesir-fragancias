import React, { useState, useEffect } from 'react';
import { INITIAL_PROMO_BAR } from '../../data/initialBanners';

export const AnnouncementBar: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const messages = INITIAL_PROMO_BAR.messages;

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <aside aria-label="Anuncios y Promociones" className="bg-gradient-to-r from-zinc-950 via-brand-dark to-zinc-950 border-b border-white/5 py-2 px-4 text-center relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[22px]">
        <p className="text-[11px] sm:text-xs tracking-wider text-zinc-300 font-medium transition-all duration-500 transform inline-flex items-center gap-2">
          {messages[currentIdx]}
        </p>
      </div>
    </aside>
  );
};