import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $quickViewFragrance, closeQuickView } from '../../stores/catalogStore';
import { addToCart, WHATSAPP_PHONE } from '../../stores/cartStore';
import type { DecantPrice } from '../../types/fragrance';
import { X, ShoppingBag, MessageCircle, ExternalLink } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const fragrance = useStore($quickViewFragrance);
  const [selectedPrice, setSelectedPrice] = useState<DecantPrice | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const formatSizeLabel = (p: DecantPrice) => {
    if (p.size === '100ml' || p.size === 'sellado') return 'Sellado';
    if (p.label && p.label.toLowerCase().includes('sellado')) return 'Sellado';
    return p.size;
  };

  const sortedPrices = React.useMemo(() => {
    if (!fragrance || !fragrance.prices) return [];
    return [...fragrance.prices].sort((a, b) => {
      const isSealedA = a.size === '100ml' || a.size === 'sellado' || a.label?.toLowerCase().includes('sellado');
      const isSealedB = b.size === '100ml' || b.size === 'sellado' || b.label?.toLowerCase().includes('sellado');
      if (isSealedA && !isSealedB) return -1;
      if (!isSealedA && isSealedB) return 1;
      return b.price - a.price;
    });
  }, [fragrance]);

  useEffect(() => {
    if (fragrance && fragrance.prices.length > 0) {
      const sealed = fragrance.prices.find(
        (p) => p.size === '100ml' || p.size === 'sellado' || p.label?.toLowerCase().includes('sellado')
      ) || fragrance.prices[fragrance.prices.length - 1] || fragrance.prices[0];
      setSelectedPrice(sealed);
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

  const displaySelectedLabel = formatSizeLabel(selectedPrice);

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
    return null;
  };

  const whatsappDirectMsg = encodeURIComponent(
    `✨ *¡Hola Le Désir Fragancias!* Me interesa comprar:\n• *${fragrance.name}* (${fragrance.brand})\n• Presentación: ${displaySelectedLabel} ($${selectedPrice.price.toLocaleString('es-AR')})\n¿Tienen disponibilidad para coordinar el envío?`
  );

  const isContainFit =
    fragrance.imageFit === 'contain' ||
    (!fragrance.imageFit &&
      (fragrance.image.toLowerCase().includes('.png') ||
        fragrance.image.startsWith('data:image/png')));

  const occasionsList = (Array.isArray(fragrance.occasions) && fragrance.occasions.length > 0)
    ? fragrance.occasions
    : fragrance.occasion ? [fragrance.occasion] : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={closeQuickView}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-brand-surface border border-white/10 p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-5 md:gap-8"
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/60 sm:bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition z-30"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image & Clean Performance Specs */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] max-h-56 sm:max-h-80 md:max-h-none rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/5 flex items-center justify-center">
            <img
              src={fragrance.image}
              alt={fragrance.name}
              className={`w-full h-full ${
                isContainFit ? 'object-contain p-4 sm:p-6' : 'object-cover'
              } object-center relative z-0`}
            />
          </div>

          {/* Clean Editorial Performance Strip (Replaced progress bars) */}
          {(fragrance.longevity || fragrance.sillage) && (
            <div className="w-full mt-3 p-3 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center justify-around text-xs">
              {fragrance.longevity && (
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Longevidad</span>
                  <span className="font-medium text-zinc-200 mt-0.5 block">{fragrance.longevity}</span>
                </div>
              )}
              {fragrance.longevity && fragrance.sillage && (
                <div className="h-6 w-px bg-white/10" />
              )}
              {fragrance.sillage && (
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Estela</span>
                  <span className="font-medium text-zinc-200 mt-0.5 block">{fragrance.sillage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Info & Olfactory Notes */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brand-gold font-medium">
              {fragrance.brand}
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-wide mt-0.5">
              {fragrance.name}
            </h2>

            {fragrance.inspiredBy ? (
              <p className="mt-1 text-xs text-amber-300/80 italic">
                Inspirado en {fragrance.inspiredBy}
              </p>
            ) : fragrance.subtitle ? (
              <p className="mt-0.5 text-xs text-zinc-400">{fragrance.subtitle}</p>
            ) : null}

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-3">
              {fragrance.description}
            </p>

            {/* Familias Olfativas (Píldoras limpias sin emojis) */}
            {fragrance.families && fragrance.families.length > 0 && (
              <div className="mt-4">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1.5 tracking-wider">
                  Familia Olfativa:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {fragrance.families.map((fam, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-200 font-medium"
                    >
                      {fam}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ocasiones & Estación */}
            {(occasionsList.length > 0 || fragrance.season) && (
              <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
                {occasionsList.map((occ, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-zinc-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10"
                  >
                    {occ}
                  </span>
                ))}
                {fragrance.season && (
                  <span className="text-[11px] text-brand-gold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {fragrance.season}
                  </span>
                )}
              </div>
            )}

            {/* Fragrantica Link */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
              <span className="text-zinc-400 text-[11px]">
                Ficha oficial y notas olfativas:
              </span>
              {fragrance.fragranticaUrl ? (
                <a
                  href={fragrance.fragranticaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-brand-gold hover:text-white border border-brand-gold/20 text-xs font-medium flex items-center gap-1.5 transition flex-shrink-0"
                >
                  <span>Fragrantica</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${fragrance.brand} ${fragrance.name} fragrantica`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition flex-shrink-0"
                >
                  <span>Fragrantica</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Format Selection */}
            <div className="mt-4">
              <label className="text-xs font-medium text-zinc-300 block mb-2">
                Presentación:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sortedPrices.map((p) => {
                  const active = selectedPrice.size === p.size;
                  const label = formatSizeLabel(p);
                  return (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => setSelectedPrice(p)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        active
                          ? 'border-brand-gold bg-brand-gold/15 text-white font-semibold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{label}</span>
                      <span className="block text-[11px] text-brand-gold font-semibold mt-0.5">
                        ${p.price.toLocaleString('es-AR')}
                      </span>
                      {getPricePerMl(p) && p.size !== '100ml' && p.size !== 'sellado' && (
                        <span className="block text-[9px] text-zinc-500 mt-0.5">
                          {getPricePerMl(p)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action CTAs - Sticky bottom on mobile */}
          <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5 sm:gap-3 sticky bottom-0 bg-brand-surface/95 backdrop-blur-md -mx-4 -mb-4 p-4 sm:p-0 sm:m-0 sm:static sm:bg-transparent z-20">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-brand-gold hover:bg-brand-gold-light text-brand-dark shadow-md shadow-brand-gold/15'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdded ? '¡Agregado al Carrito!' : `Añadir (${displaySelectedLabel}) • $${selectedPrice.price.toLocaleString('es-AR')}`}
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${whatsappDirectMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 sm:py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition active:scale-[0.98]"
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
