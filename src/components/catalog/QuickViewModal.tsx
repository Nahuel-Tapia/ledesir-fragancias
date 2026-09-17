import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $quickViewFragrance, closeQuickView } from '../../stores/catalogStore';
import { addToCart, WHATSAPP_PHONE } from '../../stores/cartStore';
import type { DecantPrice } from '../../types/fragrance';
import { X, ShoppingBag, MessageCircle, Clock, Wind, Sparkles } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const fragrance = useStore($quickViewFragrance);
  const [selectedPrice, setSelectedPrice] = useState<DecantPrice | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (fragrance && fragrance.prices.length > 0) {
      setSelectedPrice(fragrance.prices[0]);
    }
  }, [fragrance]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!fragrance || !selectedPrice) return null;

  const handleAddToCart = () => {
    addToCart(
      {
        id: fragrance.id,
        name: fragrance.name,
        brand: fragrance.brand,
        image: fragrance.image,
      },
      selectedPrice.size,
      selectedPrice.price,
      1
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappDirectMsg = encodeURIComponent(
    `✨ *¡Hola Le Désir Fragancias!* Me interesa comprar:\n• *${fragrance.name}* (${fragrance.brand})\n• Medida: ${selectedPrice.size} ($${selectedPrice.price.toLocaleString('es-AR')})\n¿Tienen disponibilidad para coordinar el envío?`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={closeQuickView}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-brand-surface border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row gap-6 md:gap-8"
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition z-20"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10">
            <img
              src={fragrance.image}
              alt={fragrance.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-brand-gold border border-brand-gold/30">
              {fragrance.gender}
            </div>
          </div>

          {/* Performance meters */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-brand-gold text-xs font-semibold mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Longevidad</span>
              </div>
              <p className="text-[11px] text-zinc-300">{fragrance.longevity}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-brand-gold text-xs font-semibold mb-0.5">
                <Wind className="w-3.5 h-3.5" />
                <span>Estela (Sillage)</span>
              </div>
              <p className="text-[11px] text-zinc-300">{fragrance.sillage}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Olfactory Pyramid */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold">
              {fragrance.brand}
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-wide mt-1">
              {fragrance.name}
            </h2>
            {fragrance.subtitle && (
              <p className="text-xs text-zinc-400 mt-0.5">{fragrance.subtitle}</p>
            )}

            {fragrance.inspiredBy && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{fragrance.inspiredBy}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-3">
              {fragrance.description}
            </p>

            {/* Visual Olfactory Pyramid */}
            <div className="mt-5 p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
              <h3 className="text-xs font-semibold text-brand-gold-light uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Pirámide Olfativa
              </h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">
                    Notas de Salida (Primeros 15 min):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {fragrance.pyramid.top.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-zinc-200 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">
                    Notas de Corazón (El alma del perfume):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {fragrance.pyramid.heart.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">
                    Notas de Fondo (Fijación profunda):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {fragrance.pyramid.base.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-zinc-100 text-[11px]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                Selecciona tamaño o decant:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {fragrance.prices.map((p) => {
                  const active = selectedPrice.size === p.size;
                  return (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => setSelectedPrice(p)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        active
                          ? 'border-brand-gold bg-brand-gold/15 text-white shadow-md'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.size}</span>
                      <span className="block text-[11px] text-brand-gold mt-0.5">
                        ${p.price.toLocaleString('es-AR')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-gold hover:bg-brand-gold-light text-brand-dark shadow-lg shadow-brand-gold/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdded ? '¡Agregado al Carrito!' : `Añadir (${selectedPrice.size}) • $${selectedPrice.price.toLocaleString('es-AR')}`}
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${whatsappDirectMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Pedir directo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};