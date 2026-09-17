import React, { useState } from 'react';
import type { Fragrance, DecantPrice } from '../../types/fragrance';
import { addToCart } from '../../stores/cartStore';
import { openQuickView } from '../../stores/catalogStore';
import { ShoppingBag, Eye, Sparkles, Check, Flame } from 'lucide-react';

interface ProductCardProps {
  fragrance: Fragrance;
}

export const ProductCard: React.FC<ProductCardProps> = ({ fragrance }) => {
  const [selectedPrice, setSelectedPrice] = useState<DecantPrice>(
    fragrance.prices[0] || { size: '100ml', label: '100ml', price: 0, inStock: true }
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

  return (
    <article
      onClick={() => openQuickView(fragrance)}
      className="group relative rounded-2xl bg-brand-surface/70 border border-white/10 hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-luxury hover:shadow-glow cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        <img
          src={fragrance.image}
          alt={fragrance.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {fragrance.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Flame className="w-3 h-3 text-amber-400" />
              Best Seller
            </span>
          )}
          {fragrance.isNew && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Novedad
            </span>
          )}
          {fragrance.discountPercentage && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              -{fragrance.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <button
            onClick={handleQuickView}
            className="px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-xs font-medium border border-white/20 hover:border-brand-gold hover:text-brand-gold transition-all flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Eye className="w-4 h-4" />
            Pirámide Olfativa
          </button>
        </div>

        {/* Perfume Category indicator */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 font-sans px-2 py-0.5 rounded bg-black/40 backdrop-blur-md border border-white/5">
            {fragrance.category === 'arabe' ? 'Colección Árabe' : fragrance.category === 'disenador' ? 'Diseñador' : 'Edición Especial'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Brand & Name */}
          <p className="text-xs text-brand-gold font-medium uppercase tracking-wider">
            {fragrance.brand}
          </p>
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-white tracking-wide group-hover:text-brand-gold-light transition-colors mt-0.5 line-clamp-1">
            {fragrance.name}
          </h3>

          {/* Inspiration hint */}
          {fragrance.inspiredBy && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium line-clamp-1">
              <Sparkles className="w-3 h-3 text-brand-gold flex-shrink-0" />
              <span>{fragrance.inspiredBy}</span>
            </div>
          )}

          {/* Key olfactory notes summary */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {fragrance.pyramid.top.slice(0, 3).map((note, idx) => (
              <span
                key={idx}
                className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Size / Decant Pill Selector */}
        {fragrance.prices.length > 1 && (
          <div className="pt-2 border-t border-white/5">
            <div className="text-[10px] text-zinc-400 mb-1.5 font-medium flex justify-between">
              <span>Seleccionar presentación:</span>
              <span className="text-brand-gold">{selectedPrice.size}</span>
            </div>
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              {fragrance.prices.map((p) => {
                const isSelected = selectedPrice.size === p.size;
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSelectedPrice(p)}
                    className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-brand-gold/20 text-brand-gold-light border-brand-gold shadow-sm'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    {p.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">
                ${selectedPrice.price.toLocaleString('es-AR')}
              </span>
              {selectedPrice.originalPrice && (
                <span className="text-xs text-zinc-500 line-through">
                  ${selectedPrice.originalPrice.toLocaleString('es-AR')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 block">
              {selectedPrice.size === '100ml' ? 'Frasco Sellado' : selectedPrice.size === 'unidad' ? 'Pack Completo' : 'Atomizador Decant'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-semibold shadow-lg shadow-brand-gold/20'
            }`}
            aria-label={`Añadir ${fragrance.name} al carrito`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">¡Listo!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};