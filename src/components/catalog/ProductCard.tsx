import React, { useState, useMemo } from 'react';
import type { Fragrance, DecantPrice } from '../../types/fragrance';
import { addToCart } from '../../stores/cartStore';
import { openQuickView } from '../../stores/catalogStore';
import { ShoppingBag, Eye, Check } from 'lucide-react';

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
    setTimeout(() => setIsAdded(false), 1600);
  };

  const isContainFit =
    fragrance.imageFit === 'contain' ||
    (!fragrance.imageFit &&
      (fragrance.image.toLowerCase().includes('.png') ||
        fragrance.image.startsWith('data:image/png')));

  return (
    <article
      onClick={() => openQuickView(fragrance)}
      className="group relative rounded-xl sm:rounded-2xl bg-brand-surface/60 hover:bg-brand-surface border border-white/5 hover:border-brand-gold/30 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Image Container - Clean luxury presentation */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950 flex items-center justify-center">
        <img
          src={fragrance.image}
          alt={fragrance.name}
          className={`h-full w-full ${
            isContainFit ? 'object-contain p-3 sm:p-5' : 'object-cover'
          } object-center group-hover:scale-105 transition-transform duration-500 ease-out relative z-0`}
          loading="lazy"
        />

        {/* Ambient Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface/80 via-transparent to-transparent pointer-events-none z-[1]" />

        {/* Single Subtle Priority Badge (Only when relevant) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {fragrance.discountPercentage ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              -{fragrance.discountPercentage}%
            </span>
          ) : fragrance.isBestSeller ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25 backdrop-blur-md">
              Bestseller
            </span>
          ) : fragrance.stock > 0 && fragrance.stock <= 5 ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/30 backdrop-blur-md">
              Últimas {fragrance.stock}
            </span>
          ) : fragrance.isNew ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 backdrop-blur-md">
              Novedad
            </span>
          ) : null}
        </div>

        {/* Hover cue (Desktop) */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 backdrop-blur-[1px] z-10">
          <span className="px-3 py-1.5 rounded-full bg-zinc-950/90 text-brand-gold-light text-xs font-medium border border-brand-gold/30 flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-brand-gold" />
            <span>Ver notas</span>
          </span>
        </div>
      </div>

      {/* Card Content - Clean, understated and elegant */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between gap-2.5">
        <div>
          {/* Brand */}
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest truncate">
            {fragrance.brand}
          </p>

          {/* Fragrance Name */}
          <h3 className="font-editorial text-sm sm:text-base lg:text-lg font-bold text-white tracking-wide group-hover:text-brand-gold-light transition-colors mt-0.5 line-clamp-1">
            {fragrance.name}
          </h3>

          {/* Inspiration hint (if available) */}
          {fragrance.inspiredBy ? (
            <p className="mt-0.5 text-[10px] text-zinc-400/90 italic truncate">
              Insp. {fragrance.inspiredBy}
            </p>
          ) : fragrance.subtitle ? (
            <p className="mt-0.5 text-[10px] text-zinc-500 truncate">
              {fragrance.subtitle}
            </p>
          ) : null}
        </div>

        {/* Size / Format Pills Selector (Sellado | 10ml | 5ml) */}
        {sortedPrices.length > 1 && (
          <div className="pt-1.5 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1">
              {sortedPrices.map((p) => {
                const isSelected = selectedPrice.size === p.size;
                const label = formatSizeLabel(p);
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSelectedPrice(p)}
                    className={`flex-1 py-1 px-1 text-[9px] sm:text-[10px] rounded-md transition-all truncate text-center ${
                      isSelected
                        ? 'bg-brand-gold text-brand-dark font-bold shadow-sm'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price & Single Clean Action Button */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-white font-editorial tracking-tight">
              ${selectedPrice.price.toLocaleString('es-AR')}
            </span>

            {selectedPrice.originalPrice && selectedPrice.originalPrice > selectedPrice.price && (
              <span className="text-[10px] text-zinc-500 line-through">
                ${selectedPrice.originalPrice.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-1.5 sm:py-2 px-3 rounded-lg sm:rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 hover:bg-brand-gold hover:text-brand-dark text-zinc-200 border border-white/10 hover:border-brand-gold'
            }`}
            aria-label={`Añadir ${fragrance.name} al carrito`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Listo!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
