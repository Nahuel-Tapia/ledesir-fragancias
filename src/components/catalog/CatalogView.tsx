import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $catalog } from '../../stores/catalogStore';
import { ProductCard } from './ProductCard';
import type { FragranceCategory, OlfactoryFamily } from '../../types/fragrance';
import { Search, X, Sparkles } from 'lucide-react';

const FAMILIES: OlfactoryFamily[] = [
  'Oriental / Especiado',
  'Gourmand / Dulce',
  'Amaderado',
  'Cítrico / Fresco',
  'Cuero / Ahumado',
  'Aromático / Fougère',
];

interface CatalogViewProps {
  initialCategory?: FragranceCategory | 'all';
}

export const CatalogView: React.FC<CatalogViewProps> = ({ initialCategory = 'all' }) => {
  const catalog = useStore($catalog);
  const [selectedCategory, setSelectedCategory] = useState<FragranceCategory | 'all'>(initialCategory);
  const [selectedFamily, setSelectedFamily] = useState<OlfactoryFamily | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync category from URL params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('categoria') as FragranceCategory | null;
      if (cat && ['arabe', 'disenador', 'nicho', 'extra'].includes(cat)) {
        setSelectedCategory(cat);
      }
    }
  }, []);

  const filteredItems = useMemo(() => {
    return catalog
      .filter((item) => {
        // Category
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        // Olfactory Family
        if (selectedFamily !== 'all' && !item.families.includes(selectedFamily)) {
          return false;
        }
        // Search
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchBrand = item.brand.toLowerCase().includes(q);
          const matchNotes = [
            ...item.pyramid.top,
            ...item.pyramid.heart,
            ...item.pyramid.base,
          ].some((n) => n.toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const priceA = a.prices[0]?.price || 0;
          const priceB = b.prices[0]?.price || 0;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = a.prices[0]?.price || 0;
          const priceB = b.prices[0]?.price || 0;
          return priceB - priceA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        // Featured default
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      });
  }, [catalog, selectedCategory, selectedFamily, searchQuery, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedFamily !== 'all' || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedFamily('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="space-y-8">
      {/* Category Nav Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {[
          { id: 'all', label: 'Todas las Fragancias' },
          { id: 'arabe', label: 'Perfumería Árabe 🇦🇪' },
          { id: 'disenador', label: 'Diseñador & Nicho 🇫🇷' },
          { id: 'extra', label: 'Decants & Accesorios ✨' },
        ].map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                active
                  ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/20'
                  : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-brand-surface border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, nota o marca..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-gold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Olfactory Notes Filter & Sort Selector */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Family selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Familia:</span>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-brand-gold"
            >
              <option value="all">Todas las notas</option>
              {FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-brand-gold"
            >
              <option value="featured">Destacados & Bestsellers</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre: A - Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs text-brand-gold hover:text-white underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Active filters pill tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium">Filtros activos:</span>
          {selectedCategory !== 'all' && (
            <span className="px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 flex items-center gap-1">
              Categoría: {selectedCategory}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
            </span>
          )}
          {selectedFamily !== 'all' && (
            <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              Nota: {selectedFamily}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFamily('all')} />
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/10 flex items-center gap-1">
              "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((fragrance) => (
            <ProductCard key={fragrance.id} fragrance={fragrance} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl bg-brand-surface/40 border border-white/5 space-y-4">
          <p className="text-lg font-semibold text-white">No encontramos fragancias con esos filtros</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Prueba seleccionando otra familia olfativa o restablece los filtros para ver la colección completa.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-xl bg-brand-gold text-brand-dark text-xs font-bold uppercase tracking-wider"
          >
            Ver todas las fragancias
          </button>
        </div>
      )}
    </div>
  );
};