import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $catalog } from '../../stores/catalogStore';
import { addToCart } from '../../stores/cartStore';
import type { Fragrance } from '../../types/fragrance';
import { Check, Sparkles, ShoppingBag, Plus, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DecantPackBuilder: React.FC = () => {
  const catalog = useStore($catalog);
  const [packSize, setPackSize] = useState<'5ml' | '10ml'>('5ml');
  const [selectedFragrances, setSelectedFragrances] = useState<Fragrance[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  const packPrice = packSize === '5ml' ? 19900 : 34900;
  const originalPackPrice = packSize === '5ml' ? 23000 : 41000;
  const discountAmount = originalPackPrice - packPrice;

  const toggleSelect = (fragrance: Fragrance) => {
    if (selectedFragrances.some((f) => f.id === fragrance.id)) {
      setSelectedFragrances(selectedFragrances.filter((f) => f.id !== fragrance.id));
    } else {
      if (selectedFragrances.length < 3) {
        setSelectedFragrances([...selectedFragrances, fragrance]);
      }
    }
  };

  const handleAddPackToCart = () => {
    if (selectedFragrances.length < 3) return;

    // Add each decant to cart at the promotional per-item rate
    const itemPrice = Math.round(packPrice / 3);
    selectedFragrances.forEach((fragrance) => {
      addToCart(
        {
          id: fragrance.id,
          name: `${fragrance.name} (Pack Combo 3x)`,
          brand: fragrance.brand,
          image: fragrance.image,
        },
        packSize,
        itemPrice,
        1
      );
    });

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#10b981', '#ffffff'],
      });
    } catch (e) {}

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setSelectedFragrances([]);
    }, 2000);
  };

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-brand-surface via-brand-dark to-brand-surface border border-brand-gold/30 shadow-2xl my-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Ahorro Directo en Combo
        </span>
        <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-white tracking-wide">
          Armá tu Propio Pack de 3 Decants
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
          Elige tus 3 fragancias favoritas del catálogo y llévate el combo con precio promocional exclusivo.
        </p>

        {/* Size Switcher */}
        <div className="mt-6 inline-flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-white/10">
          <button
            onClick={() => setPackSize('5ml')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              packSize === '5ml'
                ? 'bg-brand-gold text-brand-dark shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Combo 3x 5ml • $19.900
          </button>
          <button
            onClick={() => setPackSize('10ml')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition ${
              packSize === '10ml'
                ? 'bg-brand-gold text-brand-dark shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Combo 3x 10ml • $34.900
          </button>
        </div>
      </div>

      {/* Selected Slots Preview (3 slots) */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="text-xs font-semibold text-zinc-400 mb-3 flex items-center justify-between">
          <span>Tus fragancias seleccionadas ({selectedFragrances.length} de 3):</span>
          <span className="text-emerald-400">Ahorras ${discountAmount.toLocaleString('es-AR')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => {
            const item = selectedFragrances[idx];
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  item
                    ? 'bg-zinc-900 border-brand-gold/50 shadow-md'
                    : 'bg-zinc-950/50 border-dashed border-white/15 text-zinc-500'
                }`}
              >
                {item ? (
                  <>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-zinc-800 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-brand-gold">{item.brand}</p>
                      <span className="text-[9px] text-zinc-400 font-mono">{packSize}</span>
                    </div>
                    <button
                      onClick={() => toggleSelect(item)}
                      className="p-1 text-zinc-400 hover:text-rose-400 transition"
                      title="Quitar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-2">
                    <Plus className="w-5 h-5 mx-auto opacity-40 mb-1" />
                    <span className="text-[11px] text-zinc-500">Selecciona fragancia #{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add to Cart button when 3 are selected */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">${packPrice.toLocaleString('es-AR')}</span>
              <span className="text-xs text-zinc-500 line-through">
                ${originalPackPrice.toLocaleString('es-AR')}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                (Ahorro del {packSize === '5ml' ? '15%' : '18%'})
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">3 decants de {packSize} en atomizador de vidrio premium</p>
          </div>

          <button
            onClick={handleAddPackToCart}
            disabled={selectedFragrances.length < 3}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              selectedFragrances.length === 3
                ? isAdded
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-brand-gold hover:bg-brand-gold-light text-brand-dark shadow-lg shadow-brand-gold/30 hover:scale-105 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Combo Añadido!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {selectedFragrances.length < 3
                    ? `Faltan ${3 - selectedFragrances.length} fragancias`
                    : 'Añadir Pack al Carrito'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fragrances Selection Grid */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4 text-center">
          Toca para seleccionar tus fragancias:
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {catalog.map((fragrance) => {
            const isSelected = selectedFragrances.some((f) => f.id === fragrance.id);
            return (
              <div
                key={fragrance.id}
                onClick={() => toggleSelect(fragrance)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/15 shadow-glow scale-[1.02]'
                    : 'border-white/5 bg-brand-surface/60 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-900">
                  <img
                    src={fragrance.image}
                    alt={fragrance.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand-gold/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shadow">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] text-brand-gold font-semibold uppercase truncate">
                    {fragrance.brand}
                  </p>
                  <p className="text-xs font-bold text-white truncate">{fragrance.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
