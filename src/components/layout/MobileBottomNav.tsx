import React from 'react';
import { useStore } from '@nanostores/react';
import { $cartCount, openCart } from '../../stores/cartStore';
import { openQuiz } from '../../stores/catalogStore';
import { Compass, Droplets, Sparkles, ShoppingBag } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const cartCount = useStore($cartCount);

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-brand-dark/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 shadow-2xl safe-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Catálogo */}
        <a
          href="/catalogo"
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-white active:text-brand-gold transition group"
        >
          <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium tracking-wider uppercase">Catálogo</span>
        </a>

        {/* 2. Decants */}
        <a
          href="/decants"
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-white active:text-brand-gold transition group"
        >
          <Droplets className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium tracking-wider uppercase">Decants</span>
        </a>

        {/* 3. Test Olfativo */}
        <button
          type="button"
          onClick={() => openQuiz()}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-white active:text-brand-gold transition group"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-brand-gold group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-gold animate-ping" />
          </div>
          <span className="text-[10px] font-medium tracking-wider uppercase text-brand-gold">Test</span>
        </button>

        {/* 4. Carrito / Bolsa */}
        <button
          type="button"
          onClick={() => openCart()}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-white active:text-brand-gold transition group relative"
          aria-label={`Abrir carrito con ${cartCount} productos`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-gold text-brand-dark text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-wider uppercase">Bolsa</span>
        </button>
      </div>
    </nav>
  );
};
