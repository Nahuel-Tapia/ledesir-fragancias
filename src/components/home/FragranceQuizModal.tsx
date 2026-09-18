import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $catalog, openQuickView } from '../../stores/catalogStore';
import { addToCart, WHATSAPP_PHONE } from '../../stores/cartStore';
import type { Fragrance } from '../../types/fragrance';
import { Sparkles, X, ArrowRight, RotateCcw, ShoppingBag, Eye, MessageCircle, Check } from 'lucide-react';

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FragranceQuizModal: React.FC<QuizProps> = ({ isOpen, onClose }) => {
  const catalog = useStore($catalog);
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState<string>('');
  const [occasionId, setOccasionId] = useState<string>('');
  const [vibe, setVibe] = useState<string>('');
  const [format, setFormat] = useState<string>('');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setOccasion('');
    setOccasionId('');
    setVibe('');
    setFormat('');
    setAddedIds([]);
  };

  // Algoritmo inteligente que vincula Ocasión + Perfil de Notas Genérico (Familias)
  const getRecommendations = (): Fragrance[] => {
    const scored = catalog.map((item) => {
      let score = 0;

      // 1. Coincidencia con Perfil de Notas Genérico (Familias Olfativas) - Peso: 4 puntos
      const families = item.families || [];
      if (vibe === 'dulce') {
        if (families.some((f) => f.includes('Gourmand') || f.includes('Dulce'))) score += 4;
      } else if (vibe === 'especiado') {
        if (families.some((f) => f.includes('Oriental') || f.includes('Especiado') || f.includes('Cuero') || f.includes('Ahumado'))) score += 4;
      } else if (vibe === 'fresco') {
        if (families.some((f) => f.includes('Cítrico') || f.includes('Fresco') || f.includes('Aromático') || f.includes('Acuático') || f.includes('Marino'))) score += 4;
      } else if (vibe === 'amaderado') {
        if (families.some((f) => f.includes('Amaderado') || f.includes('Cuero') || f.includes('Ahumado'))) score += 4;
      }

      // 2. Coincidencia con Ocasión de Uso (Soporta múltiples ocasiones) - Peso: 3 puntos
      const allOccasions = [
        ...(Array.isArray(item.occasions) ? item.occasions : []),
        item.occasion || '',
      ].map((o) => o.toLowerCase());

      if (occasionId === 'noche') {
        if (allOccasions.some((o) => o.includes('noche') || o.includes('cita') || o.includes('nocturna') || o.includes('seductor'))) score += 3;
      } else if (occasionId === 'diario') {
        if (allOccasions.some((o) => o.includes('diario') || o.includes('oficina') || o.includes('casual') || o.includes('firma'))) score += 3;
      } else if (occasionId === 'fiesta') {
        if (allOccasions.some((o) => o.includes('fiesta') || o.includes('salidas') || o.includes('nocturna') || o.includes('boliche'))) score += 3;
      } else if (occasionId === 'gala') {
        if (allOccasions.some((o) => o.includes('gala') || o.includes('elegante') || o.includes('especial') || o.includes('alta gama'))) score += 3;
      }

      // 3. Bonificación por Best Seller o Destacado
      if (item.isBestSeller) score += 0.5;
      if (item.isFeatured) score += 0.5;

      return { item, score };
    });

    const matches = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);

    if (matches.length > 0) {
      return matches.slice(0, 2);
    }
    return catalog.slice(0, 2);
  };

  const recommended = getRecommendations().length > 0
    ? getRecommendations()
    : catalog.slice(0, 2);

  const handleAddDecant = (fragrance: Fragrance) => {
    const decantPrice = fragrance.prices[0];
    if (!decantPrice) return;
    addToCart(
      { id: fragrance.id, name: fragrance.name, brand: fragrance.brand, image: fragrance.image },
      decantPrice.size,
      decantPrice.price,
      1
    );
    setAddedIds((prev) => [...prev, fragrance.id]);
  };

  const whatsappQuizLink = () => {
    const vibeLabel =
      vibe === 'dulce'
        ? 'Dulce / Gourmand (Vainilla & Canela)'
        : vibe === 'especiado'
        ? 'Especiado / Oriental (Tabaco & Café)'
        : vibe === 'fresco'
        ? 'Cítrico / Fresco (Limpio & Versátil)'
        : 'Amaderado / Oud (Elegancia & Nobleza)';

    const text = `✨ *¡Hola Le Désir!* Hice el Test Olfativo en su tienda y me dio estos resultados:\n• Ocasión: ${occasion}\n• Perfil de Notas: ${vibeLabel}\n• Formato deseado: ${format}\nMe recomendó: *${recommended.map((r) => r.name).join(' y ')}*.\n¿Tienen stock y me cuentan un poco más sobre ellos?`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-brand-surface border border-brand-gold/30 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
          aria-label="Cerrar test"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Asesor Olfativo Inteligente
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-wide">
            {step <= 3 ? 'Encuentra tu Fragancia Ideal en 30 Segundos' : '¡Tus Fragancias Ideales!'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {step <= 3
              ? `Paso ${step} de 3 • Responde y te diremos con cuál vas a deslumbrar`
              : 'Seleccionadas según tus notas favoritas y ocasión de uso'}
          </p>
        </div>

        {/* STEP 1: OCASIÓN */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-300 mb-2">¿Para qué momento la buscas?</p>
            {[
              { id: 'noche', label: '🌙 Citas, Noche & Conquista', desc: 'Aromas envolventes, sensuales y misteriosos' },
              { id: 'diario', label: '☀️ Diario, Oficina & Universidad', desc: 'Elegancia limpia, versátil y no invasiva' },
              { id: 'fiesta', label: '🎉 Fiestas, Boliche & Noches Largas', desc: 'Modo bestia con proyección atómica para no pasar desapercibido' },
              { id: 'gala', label: '👑 Eventos Especiales & Alta Gama', desc: 'Sofisticación pura, maderas finas y exclusividad' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setOccasion(opt.label);
                  setOccasionId(opt.id);
                  setStep(2);
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-gold-light">{opt.label}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: VIBRA / FAMILIA */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-300 mb-2">¿Qué tipo de aroma disfrutas más al oler?</p>
            {[
              { id: 'dulce', label: '🍯 Dulce, Vainilla & Canela', desc: 'Como un postre licoroso de alta pastelería (ej. Khamrah)' },
              { id: 'especiado', label: '🌶️ Especias Cálidas, Tabaco & Café', desc: 'Oscuro, masculino y súper seductor (ej. Asad)' },
              { id: 'fresco', label: '🍋 Cítrico, Manzana & Lavanda', desc: 'Vibrante, juvenil y con cumplidos masivos (ej. 9 PM / Club de Nuit)' },
              { id: 'amaderado', label: '🪵 Maderas Nobles, Oud & Resinas', desc: 'La auténtica vibra de los palacios de Dubai (ej. Badee Al Oud)' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setVibe(opt.id);
                  setStep(3);
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-gold-light">{opt.label}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* STEP 3: FORMATO */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-300 mb-2">¿Cómo prefieres empezar tu experiencia?</p>
            {[
              { id: 'decant', label: '🧪 Quiero empezar con Decants (5ml / 10ml)', desc: 'Para probarlo en mi piel varias semanas sin gastar tanto' },
              { id: 'botella', label: '🍾 Busco la Botella Completa Sellada', desc: 'Quiero el frasco de 100ml original para mi colección' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setFormat(opt.label);
                  setStep(4);
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-gold-light">{opt.label}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* STEP 4: RESULTADOS */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommended.map((item) => {
                const isAdded = addedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-zinc-950/70 border border-brand-gold/30 flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-xl bg-zinc-900 mb-2"
                      />
                      <span className="text-[10px] uppercase tracking-wider text-brand-gold font-semibold block">
                        {item.brand}
                      </span>
                      <h4 className="font-editorial text-base font-bold text-white mt-0.5">{item.name}</h4>
                      {item.inspiredBy && (
                        <p className="text-[10px] text-amber-300 mt-1 line-clamp-1">
                          ✨ {item.inspiredBy}
                        </p>
                      )}

                      {/* Match Badges */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.families?.[0] && (
                          <span className="text-[9px] font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {item.families[0]}
                          </span>
                        )}
                        {(item.occasions?.[0] || item.occasion) && (
                          <span className="text-[9px] text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                            ✨ {item.occasions?.[0] || item.occasion}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        desde ${item.prices[0]?.price.toLocaleString('es-AR')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openQuickView(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs"
                          title="Ver pirámide"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAddDecant(item)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-brand-gold text-brand-dark hover:bg-brand-gold-light'
                          }`}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                          <span>{isAdded ? 'Agregado' : 'Decant'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={whatsappQuizLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp con mis respuestas
              </a>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rehacer test</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
