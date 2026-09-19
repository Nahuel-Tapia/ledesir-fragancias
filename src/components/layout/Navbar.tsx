import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cartCount, openCart } from '../../stores/cartStore';
import { $catalog, openQuickView, $isQuizOpen, openQuiz, closeQuiz } from '../../stores/catalogStore';
import { Logo } from './Logo';
import { FragranceQuizModal } from '../home/FragranceQuizModal';
import { ShoppingBag, Search, Menu, X, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const cartCount = useStore($cartCount);
  const catalog = useStore($catalog);
  const isQuizOpen = useStore($isQuizOpen);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered search results
  const searchResults = searchQuery.trim().length > 1
    ? catalog.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesNotes = [
          ...(item.pyramid?.top || []),
          ...(item.pyramid?.heart || []),
          ...(item.pyramid?.base || []),
          ...(item.families || []),
        ].some((note) => note.toLowerCase().includes(q));
        const matchesInspiration = item.inspiredBy?.toLowerCase().includes(q);
        return matchesName || matchesBrand || matchesNotes || matchesInspiration;
      }).slice(0, 5)
    : [];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-dark/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2'
            : 'bg-brand-dark/70 backdrop-blur-sm border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-zinc-300 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Brand Logo */}
          <a href="/" className="flex items-center">
            <Logo showTagline={!isScrolled} />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs tracking-[0.12em] uppercase font-medium text-zinc-300">
            <a href="/" className="hover:text-brand-gold transition-colors">
              Inicio
            </a>
            <a href="/catalogo" className="hover:text-brand-gold transition-colors">
              Catálogo
            </a>
            <a href="/catalogo?categoria=arabe" className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <span>Árabes</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 lowercase">top</span>
            </a>
            <span
              className="text-zinc-500 cursor-not-allowed flex items-center gap-1.5 select-none"
              title="Próximamente disponible"
            >
              <span>Diseñador</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 font-medium">
                Próximamente
              </span>
            </span>
            <a href="/decants" className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Decants
            </a>
            <a href="/autenticidad" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>¿Es Original?</span>
            </a>

            {/* Quiz Trigger button in Navbar */}
            <button
              onClick={() => openQuiz()}
              className="px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-dark transition-all flex items-center gap-1 text-[11px] font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              <span>Test Olfativo</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-zinc-300 hover:text-brand-gold rounded-full hover:bg-white/5 transition-colors"
              aria-label="Buscar fragancias"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 text-zinc-200 hover:text-brand-gold rounded-full hover:bg-white/5 transition-colors flex items-center gap-2 group"
              aria-label="Ver carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-brand-gold text-brand-dark text-[11px] font-bold flex items-center justify-center shadow-lg animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Instant Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
            {/* Input Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-gold" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por perfume (ej. Khamrah, Sauvage), inspiración o notas (Vainilla, Oud)..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results or Quick Suggestions */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {searchQuery.trim().length > 1 ? (
                searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold px-2 mb-2">
                      Resultados encontrados ({searchResults.length})
                    </p>
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchOpen(false);
                          openQuickView(item);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-white">{item.name}</h4>
                            <p className="text-xs text-brand-gold">{item.brand}</p>
                            {item.inspiredBy && (
                              <p className="text-[10px] text-amber-300/80 mt-0.5">
                                ✨ {item.inspiredBy}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-white">
                            desde ${item.prices[0]?.price.toLocaleString('es-AR')}
                          </span>
                          <span className="block text-[10px] text-zinc-400">Ver detalles →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    No encontramos fragancias con "{searchQuery}". Intenta buscar por notas como "Canela", "Ámbar" o marcas como "Lattafa".
                  </div>
                )
              ) : (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-3">
                    Búsquedas populares de la boutique:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Khamrah', 'Asad', '9 PM', 'Oud', 'Vainilla', 'Dior Elixir', 'Angels Share'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-brand-surface border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-slide-right">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Logo showTagline={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-3 text-sm tracking-wider uppercase font-medium">
                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-white/5 text-zinc-200 hover:text-brand-gold transition-colors"
                >
                  Inicio
                </a>
                <a
                  href="/catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-white/5 text-zinc-200 hover:text-brand-gold transition-colors"
                >
                  Catálogo Completo
                </a>
                <a
                  href="/catalogo?categoria=arabe"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-white/5 text-zinc-200 hover:text-brand-gold transition-colors flex items-center justify-between"
                >
                  <span>Perfumes Árabes</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">🔥 Viral</span>
                </a>
                <div className="py-2.5 px-3 rounded-lg text-zinc-500 flex items-center justify-between cursor-not-allowed select-none">
                  <span>Perfumes de Diseñador</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 font-medium">
                    Próximamente
                  </span>
                </div>
                <a
                  href="/decants"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-white/5 text-zinc-200 hover:text-brand-gold transition-colors"
                >
                  Decants & Muestras (5ml / 10ml)
                </a>
                <a
                  href="/autenticidad"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¿Cómo saber si es original?</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openQuiz();
                  }}
                  className="text-left py-2.5 px-3 rounded-lg bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-dark transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Test Olfativo Exprés</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-zinc-400 space-y-2">
              <p>📍 Envíos a todo el país</p>
              <p>📱 WhatsApp: 2645162780</p>
              <p>📸 Instagram: @ledesir.fragancias</p>
            </div>
          </div>
        </div>
      )}

      {/* Fragrance Quiz Modal */}
      <FragranceQuizModal isOpen={isQuizOpen} onClose={() => closeQuiz()} />
    </>
  );
};
