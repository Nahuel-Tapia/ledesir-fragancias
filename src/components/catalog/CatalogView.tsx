import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $catalog } from '../../stores/catalogStore';
import { ProductCard } from './ProductCard';
import type { FragranceCategory, OlfactoryFamily } from '../../types/fragrance';
import { Search, X, Sparkles, SlidersHorizontal, User, Tag } from 'lucide-react';

const FAMILIES: OlfactoryFamily[] = [
  'Oriental / Especiado',
  'Gourmand / Dulce',
  'Amaderado',
  'Cítrico / Fresco',
  'Cuero / Ahumado',
  'Aromático / Fougère',
];

const GENDERS: Array<'all' | 'Unisex' | 'Masculino' | 'Femenino'> = [
  'all',
  'Unisex',
  'Masculino',
  'Femenino',
];

interface CatalogViewProps {
  initialCategory?: FragranceCategory | 'all';
}

export const CatalogView: React.FC<CatalogViewProps> = ({ initialCategory = 'all' }) => {
  const catalog = useStore($catalog);
  const [selectedCategory, setSelectedCategory] = useState<FragranceCategory | 'all'>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Unisex' | 'Masculino' | 'Femenino'>('all');
  const [selectedFamily, setSelectedFamily] = useState<OlfactoryFamily | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync category from URL params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('categoria') as FragranceCategory | null;
      if (cat && ['arabe', 'disenador', 'nicho', 'extra'].includes(cat)) {
        setSelectedCategory(cat);
      }
      const brandParam = params.get('marca');
      if (brandParam) {
        setSelectedBrand(brandParam);
      }
    }
  }, []);

  // Dynamically compute available brands with counts
  const availableBrands = useMemo(() => {
    const counts: Record<string, number> = {};
    catalog.forEach((item) => {
      if (item.brand) {
        counts[item.brand] = (counts[item.brand] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [catalog]);

  const filteredItems = useMemo(() => {
    return catalog
      .filter((item) => {
        // Category
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        // Brand
        if (selectedBrand !== 'all' && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
        // Gender
        if (selectedGender !== 'all' && item.gender !== selectedGender) {
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
            ...(item.pyramid?.top || []),
            ...(item.pyramid?.heart || []),
            ...(item.pyramid?.base || []),
          ].some((n) => n.toLowerCase().includes(q));
          const matchOccasion = [
            ...(item.occasions || []),
            item.occasion || '',
            ...item.families,
          ].some((o) => o.toLowerCase().includes(q));
          const matchInspired = item.inspiredBy?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchNotes && !matchOccasion && !matchInspired) return false;
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
  }, [catalog, selectedCategory, selectedBrand, selectedGender, selectedFamily, searchQuery, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedFamily !== 'all' ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedGender('all');
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

      {/* Main Filter & Search Control Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-white/10 shadow-xl space-y-4">
        {/* Top Row: Search + Mobile Filter Toggle + Sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por perfume, nota o inspiración..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-gold transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            {/* Toggle Advanced Filters Button (Mobile & Desktop) */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40'
                  : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/20'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-gold text-brand-dark text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                <option value="featured">Destacados & Bestsellers</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre: A - Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel (Collapsible / Expandable with Brand & Gender) */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 transition-all duration-300 ${
            showAdvancedFilters ? 'block' : 'hidden sm:grid'
          }`}
        >
          {/* Brand Filter */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-brand-gold" />
              <span>Filtrar por Marca:</span>
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-brand-gold cursor-pointer"
            >
              <option value="all">Todas las marcas ({catalog.length})</option>
              {availableBrands.map(([brand, count]) => (
                <option key={brand} value={brand}>
                  {brand} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3 h-3 text-brand-gold" />
              <span>Género / Estilo:</span>
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-brand-gold cursor-pointer"
            >
              <option value="all">Todos los géneros</option>
              <option value="Unisex">✨ Unisex (Versátil)</option>
              <option value="Masculino">🎩 Masculino</option>
              <option value="Femenino">🌸 Femenino</option>
            </select>
          </div>

          {/* Olfactory Family Filter */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-gold" />
              <span>Familia Olfativa:</span>
            </label>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-brand-gold cursor-pointer"
            >
              <option value="all">Todas las familias</option>
              {FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-400 font-medium">
            Mostrando <strong className="text-white">{filteredItems.length}</strong> de {catalog.length} fragancias
          </span>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 ml-2">
              {selectedCategory !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 flex items-center gap-1 text-[11px]">
                  Categoría: {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 text-[11px]">
                  Marca: {selectedBrand}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedBrand('all')} />
                </span>
              )}
              {selectedGender !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 text-[11px]">
                  {selectedGender}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedGender('all')} />
                </span>
              )}
              {selectedFamily !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1 text-[11px]">
                  {selectedFamily}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedFamily('all')} />
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10 flex items-center gap-1 text-[11px]">
                  "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
                </span>
              )}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-brand-gold hover:text-brand-gold-light underline flex items-center gap-1 font-semibold"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar todos los filtros
          </button>
        )}
      </div>

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
            Prueba seleccionando otra marca, género o familia olfativa, o restablece los filtros para ver la colección completa.
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