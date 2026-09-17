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

  const getPricePerMl = (p: DecantPrice) => {
    if (p.size === '5ml') return `$${Math.round(p.price / 5).toLocaleString('es-AR')}/ml`;
    if (p.size === '10ml') return `$${Math.round(p.price / 10).toLocaleString('es-AR')}/ml`;
    if (p.size === '100ml') return `$${Math.round(p.price / 100).toLocaleString('es-AR')}/ml`;
    return null;
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
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-800/90 via-zinc-900 to-zinc-950 border border-white/10 shadow-luxury">
            <img
              src={fragrance.image}
              alt={fragrance.name}
              className="w-full h-full object-cover object-center relative z-0"
            />

            {/* Studio Spotlight & Radial Lighting Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(255,255,255,0.08)_0%,_rgba(35,35,42,0.25)_45%,_rgba(15,15,18,0.8)_100%)] pointer-events-none z-[1]" />

            {/* Ambient Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30 pointer-events-none z-[2]" />

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-brand-gold border border-brand-gold/30 flex items-center gap-1.5 shadow-md z-10">
              <span>{fragrance.gender === 'Masculino' ? '🎩' : fragrance.gender === 'Femenino' ? '🌸' : '✨'}</span>
              <span>{fragrance.gender}</span>
            </div>

            {/* Official Le Désir Luxury Watermark Stamp (Bottom Right) */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none select-none">
              <svg
                className="w-3.5 h-3.5 text-brand-gold flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="9" y="2" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.25" />
                <path d="M10 6h4v2h-4z" fill="currentColor" fillOpacity="0.5" />
                <path d="M6 9h12l-1.5 12h-9L6 9z" stroke="currentColor" />
                <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
              </svg>
              <span className="text-[10px] font-editorial uppercase tracking-[0.2em] text-zinc-200 font-semibold leading-none">
                Le Désir
              </span>
            </div>
          </div>

          {/* Visual Performance meters */}
          <div className="w-full space-y-2.5 mt-4 p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5">
            {/* Longevity Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-brand-gold font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  Longevidad en Piel
                </span>
                <span className="text-[11px] text-zinc-300 font-medium">
                  {fragrance.longevity}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-brand-gold to-yellow-300 transition-all duration-500 shadow-sm"
                  style={{
                    width:
                      fragrance.longevity.includes('+12h') || fragrance.longevity.includes('Bestia')
                        ? '100%'
                        : fragrance.longevity.includes('8-12h')
                        ? '85%'
                        : '65%',
                  }}
                />
              </div>
            </div>

            {/* Sillage Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-brand-gold font-semibold text-[11px]">
                  <Wind className="w-3.5 h-3.5" />
                  Estela & Proyección
                </span>
                <span className="text-[11px] text-zinc-300 font-medium">
                  {fragrance.sillage}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-brand-gold to-amber-300 transition-all duration-500 shadow-sm"
                  style={{
                    width:
                      fragrance.sillage.includes('Pesada') || fragrance.sillage.includes('Enorme')
                        ? '100%'
                        : fragrance.sillage.includes('Moderada')
                        ? '70%'
                        : '35%',
                  }}
                />
              </div>
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
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        active
                          ? 'border-brand-gold bg-brand-gold/15 text-white shadow-md ring-1 ring-brand-gold/30'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.size}</span>
                      <span className="block text-[11px] text-brand-gold font-semibold mt-0.5">
                        ${p.price.toLocaleString('es-AR')}
                      </span>
                      {getPricePerMl(p) && (
                        <span className="block text-[9px] text-zinc-400 mt-0.5 font-medium">
                          {getPricePerMl(p)}
                        </span>
                      )}
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