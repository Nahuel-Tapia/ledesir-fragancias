import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Check, ArrowLeft, Tag } from 'lucide-react';

interface BrandSelectorProps {
  value: string;
  onChange: (brand: string) => void;
  catalogBrands?: string[];
}

export const DEFAULT_POPULAR_BRANDS = [
  // Perfumería Árabe & Oriental (Boutique Special)
  'Lattafa Perfumes',
  'Afnan Perfumes',
  'Armaf',
  'Al Haramain',
  'Rasasi',
  'Maison Alhambra',
  'Fragrance World',
  'Swiss Arabian',
  'Orientica',
  'Ahmed Al Maghribi',
  'Ajmal',
  'Zimaya',
  'Spectre',
  // Diseñador & Mainstream de Lujo
  'Dior',
  'Chanel',
  'Tom Ford',
  'Creed',
  'Yves Saint Laurent',
  'Giorgio Armani',
  'Jean Paul Gaultier',
  'Paco Rabanne',
  'Carolina Herrera',
  'Versace',
  'Bvlgari',
  'Prada',
  'Valentino',
  'Givenchy',
  'Dolce & Gabbana',
  'Hermès',
  'Gucci',
  // Alta Perfumería Nicho
  'Parfums de Marly',
  'Xerjoff',
  'Maison Francis Kurkdjian',
  'Mancera',
  'Montale',
  'Amouage',
  'Kilian Paris',
  'Initio Parfums Privés',
  'Byredo',
  'Acqua di Parma',
  'Clive Christian',
  'Roja Dove',
  'Nishane',
  'Le Labo',
  // Boutique Propia
  'Le Désir Privée',
];

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  value,
  onChange,
  catalogBrands = [],
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const newBrandInputRef = useRef<HTMLInputElement>(null);

  // Combine default popular brands with brands from existing catalog and user-added brands
  const allBrands = useMemo(() => {
    const list = new Set([
      ...DEFAULT_POPULAR_BRANDS,
      ...catalogBrands.filter(Boolean),
      ...customBrands.filter(Boolean),
    ]);
    if (value && !isCustomMode) {
      list.add(value);
    }
    return Array.from(list).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [catalogBrands, customBrands, value, isCustomMode]);

  useEffect(() => {
    if (isCustomMode && newBrandInputRef.current) {
      newBrandInputRef.current.focus();
    }
  }, [isCustomMode]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__NEW_BRAND__') {
      setIsCustomMode(true);
      setNewBrandInput('');
    } else {
      onChange(selected);
    }
  };

  const handleConfirmNewBrand = () => {
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;

    setCustomBrands((prev) => Array.from(new Set([...prev, trimmed])));
    onChange(trimmed);
    setIsCustomMode(false);
    setNewBrandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmNewBrand();
    } else if (e.key === 'Escape') {
      setIsCustomMode(false);
      setNewBrandInput('');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-zinc-400 font-medium text-xs flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-brand-gold" />
          <span>Marca / Casa *</span>
        </label>

        {!isCustomMode ? (
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(true);
              setNewBrandInput('');
            }}
            className="text-[11px] font-semibold text-brand-gold hover:text-brand-gold-light transition flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3 h-3" />
            <span>Cargar otra nueva</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsCustomMode(false)}
            className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Volver a la lista</span>
          </button>
        )}
      </div>

      {!isCustomMode ? (
        <div className="relative">
          <select
            required
            value={value || ''}
            onChange={handleSelectChange}
            className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-gold text-xs appearance-none pr-8 cursor-pointer"
          >
            <option value="" disabled>
              -- Seleccionar marca principal ({allBrands.length} casas) --
            </option>
            {allBrands.map((brand) => (
              <option key={brand} value={brand} className="bg-zinc-900 text-white py-1">
                {brand}
              </option>
            ))}
            <option disabled className="bg-zinc-800 text-zinc-500">
              ───────────────
            </option>
            <option value="__NEW_BRAND__" className="bg-zinc-800 text-brand-gold font-bold">
              ➕ Cargar otra nueva marca...
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            ref={newBrandInputRef}
            type="text"
            required
            placeholder="Ej: Initio Parfums, Byredo, Nishane..."
            value={newBrandInput}
            onChange={(e) => setNewBrandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-2.5 rounded-xl bg-zinc-900 border border-brand-gold/60 text-white text-xs focus:outline-none focus:border-brand-gold shadow-glow"
          />
          <button
            type="button"
            onClick={handleConfirmNewBrand}
            disabled={!newBrandInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 text-brand-dark font-bold text-xs flex items-center gap-1 transition shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Usar</span>
          </button>
        </div>
      )}
    </div>
  );
};
