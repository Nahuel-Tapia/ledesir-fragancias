import React, { useState, useMemo } from 'react';
import type { Fragrance, DecantPrice } from '../../types/fragrance';
import { addToCart } from '../../stores/cartStore';
import { openQuickView } from '../../stores/catalogStore';
import { ShoppingBag, Eye, Sparkles, Check, Flame } from 'lucide-react';

interface ProductCardProps {
  fragrance: Fragrance;
}

export const formatSizeLabel = (p: DecantPrice) => {
  if (p.size === '100ml' || p.size === 'sellado') return 'Sellado';
  if (p.label && p.label.toLowerCase().includes('sellado')) return 'Sellado';
  return p.size;
};

export const ProductCard: React.FC<ProductCardProps> = ({ fragrance }) => {
  // Ordenar presentaciones: 'Sellado' primero, luego decants de mayor a menor
  const sortedPrices = useMemo(() => {
    if (!fragrance.prices || fragrance.prices.length === 0) {
      return [{ size: '100ml', label: 'Sellado', price: 0, inStock: true } as DecantPrice];
    }
    return [...fragrance.prices].sort((a, b) => {
      const isSealedA = a.size === '100ml' || a.size === 'sellado' || a.label?.toLowerCase().includes('sellado');
      const isSealedB = b.size === '100ml' || b.size === 'sellado' || b.label?.toLowerCase().includes('sellado');
      if (isSealedA && !isSealedB) return -1;
      if (!isSealedA && isSealedB) return 1;
      return b.price - a.price;
    });
  }, [fragrance.prices]);

  // Precio inicial: el perfume sellado
  const [selectedPrice, setSelectedPrice] = useState<DecantPrice>(
    sortedPrices[0] || { size: '100ml', label: 'Sellado', price: 0, inStock: true }
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(fragrance);
  };

  const getPricePerMl = (p: DecantPrice) => {
    if (p.size === '5ml') return `$${Math.round(p.price / 5).toLocaleString('es-AR')}/ml`;
    if (p.size === '10ml') return `$${Math.round(p.price / 10).toLocaleString('es-AR')}/ml`;
    return null;
  };

  const isContainFit =
    fragrance.imageFit === 'contain' ||
    (!fragrance.imageFit &&
      (fragrance.image.toLowerCase().includes('.png') ||
        fragrance.image.startsWith('data:image/png')));

  const isSealedSelected =
    selectedPrice.size === '100ml' ||
    selectedPrice.size === 'sellado' ||
    selectedPrice.label?.toLowerCase().includes('sellado');

  return (
    <article
      onClick={() => openQuickView(fragrance)}
      className="group relative rounded-xl sm:rounded-2xl bg-brand-surface/80 border border-white/10 hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-luxury hover:shadow-glow cursor-pointer"
    >
      {/* Top Image Container with Studio Lighting Backdrop */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-zinc-800/90 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <img
          src={fragrance.image}
          alt={fragrance.name}
          className={`h-full w-full ${
            isContainFit ? 'object-contain p-2.5 sm:p-4' : 'object-cover'
          } object-center group-hover:scale-105 transition-transform duration-500 ease-out relative z-0`}
          loading="lazy"
        />

        {/* Studio Spotlight & Radial Lighting Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(255,255,255,0.08)_0%,_rgba(35,35,42,0.25)_45%,_rgba(15,15,18,0.8)_100%)] pointer-events-none z-[1]" />

        {/* Ambient Gradient Overlay blending into card */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-black/30 pointer-events-none z-[2]" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10 max-w-[85%]">
          {fragrance.stock > 0 && fragrance.stock <= 5 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold bg-rose-500/30 text-rose-200 border border-rose-500/40 backdrop-blur-md shadow-lg animate-pulse truncate">
              ⚡ Últimas {fragrance.stock}
            </span>
          )}
          {fragrance.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 flex-shrink-0" />
              <span>Best Seller</span>
            </span>
          )}
          {fragrance.isNew && !fragrance.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 flex-shrink-0" />
              <span>Novedad</span>
            </span>
          )}
          {fragrance.discountPercentage && (
            <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              -{fragrance.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Quick View cue on Hover (Desktop) */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px] z-10 p-4">
          <span className="px-3.5 py-2 rounded-xl bg-zinc-900/90 text-brand-gold-light text-xs font-semibold border border-brand-gold/40 flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 duration-300">
            <Eye className="w-3.5 h-3.5 text-brand-gold" />
            <span>Ver detalle & notas</span>
          </span>
        </div>

        {/* Perfume Category & Gender indicator (Bottom Left) */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 flex items-center gap-1 sm:gap-1.5">
          <span className="text-[8px] sm:text-[10px] font-semibold tracking-wider uppercase text-zinc-300 font-sans px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10">
            {fragrance.category === 'arabe' ? 'Árabe' : fragrance.category === 'disenador' ? 'Diseñador' : 'Especial'}
          </span>
          <span className="text-[8px] sm:text-[10px] font-semibold tracking-wider text-brand-gold-light font-sans px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10">
            {fragrance.gender}
          </span>
        </div>

        {/* Official Le Désir Luxury Watermark Stamp (Bottom Right, hidden on mobile for clean fit) */}
        <div className="hidden sm:flex absolute bottom-3 right-3 z-10 items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none select-none group-hover:border-brand-gold/40 group-hover:bg-black/75 transition-all duration-300">
          <svg
            className="w-3 h-3 text-brand-gold flex-shrink-0"
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
          <span className="text-[9px] font-editorial uppercase tracking-[0.2em] text-zinc-200 font-semibold leading-none">
            Le Désir
          </span>
        </div>
      </div>

      {/* Card Content - Clean, compact & perfectly proportioned for mobile 2-col & desktop */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow justify-between gap-2 sm:gap-3">
        <div>
          {/* Brand & Olfactory Family */}
          <div className="flex items-center justify-between gap-1.5">
            <p className="text-[9px] sm:text-[11px] text-brand-gold font-semibold uppercase tracking-wider truncate">
              {fragrance.brand}
            </p>
            {fragrance.families?.[0] && (
              <span className="text-[8px] sm:text-[10px] text-zinc-400 font-medium truncate max-w-[80px] sm:max-w-[120px] hidden xs:inline sm:inline">
                {fragrance.families[0]}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-editorial text-xs sm:text-base lg:text-lg font-bold text-white tracking-wide group-hover:text-brand-gold-light transition-colors mt-0.5 line-clamp-1">
            {fragrance.name}
          </h3>

          {/* Clean inspiration or subtitle hint (single line) */}
          {fragrance.inspiredBy ? (
            <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[9px] sm:text-[11px] text-amber-300/80 font-medium line-clamp-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-gold flex-shrink-0" />
              <span className="truncate">{fragrance.inspiredBy}</span>
            </div>
          ) : fragrance.subtitle ? (
            <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] text-zinc-400 line-clamp-1">
              {fragrance.subtitle}
            </p>
          ) : null}
        </div>

        {/* Size / Format Pills Selector (Sellado | 10ml | 5ml) */}
        {sortedPrices.length > 1 && (
          <div className="pt-1.5 sm:pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1 sm:gap-1.5">
              {sortedPrices.map((p) => {
                const isSelected = selectedPrice.size === p.size;
                const label = formatSizeLabel(p);
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSelectedPrice(p)}
                    className={`flex-1 py-0.5 sm:py-1 px-0.5 sm:px-1 text-[9px] sm:text-[11px] font-semibold rounded-md sm:rounded-lg border transition-all truncate text-center ${
                      isSelected
                        ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-sm font-bold'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price & Action Buttons */}
        <div className="pt-1.5 sm:pt-2.5 border-t border-white/10 flex flex-col gap-2 sm:gap-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div>
              <span className="text-[8px] sm:text-[10px] text-zinc-400 uppercase tracking-wider block font-medium truncate">
                {isSealedSelected ? 'Sellado' : `Decant ${selectedPrice.size}`}
              </span>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl lg:text-2xl font-bold text-white tracking-tight font-editorial">
                  ${selectedPrice.price.toLocaleString('es-AR')}
                </span>
                {selectedPrice.originalPrice && selectedPrice.originalPrice > selectedPrice.price && (
                  <span className="text-[9px] sm:text-xs text-zinc-500 line-through">
                    ${selectedPrice.originalPrice.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </div>

            {/* If Decant selected, show per ml tag */}
            {getPricePerMl(selectedPrice) && !isSealedSelected && (
              <span className="text-[8px] sm:text-[10px] text-amber-300/80 font-medium bg-amber-500/10 px-1 sm:px-2 py-0.5 rounded border border-amber-500/20 truncate">
                {getPricePerMl(selectedPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons: "Ver detalle" and "Añadir" */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleQuickView}
              className="py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/15 hover:border-brand-gold/40 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-gold flex-shrink-0" />
              <span className="hidden sm:inline">Ver detalle</span>
              <span className="sm:hidden">Ver</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 active:scale-95 shadow-md ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-brand-gold hover:bg-brand-gold-light text-brand-dark shadow-brand-gold/20'
              }`}
              aria-label={`Añadir ${fragrance.name} al carrito`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span>¡Listo!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span>Añadir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};