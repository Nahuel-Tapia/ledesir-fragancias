import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $banners } from '../../stores/catalogStore';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export const HeroCarousel: React.FC = () => {
  const allBanners = useStore($banners);
  const activeBanners = allBanners.filter((b) => b.isActive);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;
  const slide = activeBanners[currentSlide];

  return (
    <section className="relative overflow-hidden bg-brand-dark min-h-[560px] sm:min-h-[640px] flex items-center justify-center border-b border-white/5">
      {/* Background Image with Ambient Luxury Overlay */}
      {slide.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Slide Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        {/* Pill Badge */}
        {slide.badge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold-light text-xs font-semibold tracking-wider mb-6 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>{slide.badge}</span>
          </div>
        )}

        {/* Main Editorial Headline */}
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
          {slide.title} <br />
          {slide.titleAccent && (
            <span className="gold-gradient-text italic font-normal">
              {slide.titleAccent}
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
          {slide.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <a
            href={slide.ctaLink}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
          >
            <span>{slide.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {slide.secondaryCtaText && slide.secondaryCtaLink && (
            <a
              href={slide.secondaryCtaLink}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/15 text-xs font-semibold tracking-wider uppercase backdrop-blur-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              {slide.secondaryCtaText}
            </a>
          )}
        </div>

        {/* Dot Pagination */}
        {activeBanners.length > 1 && (
          <div className="mt-12 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all rounded-full ${
                  idx === currentSlide ? 'w-8 bg-brand-gold' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
            }
            className="hidden sm:flex absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white/70 hover:text-white backdrop-blur-sm transition"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
            className="hidden sm:flex absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white/70 hover:text-white backdrop-blur-sm transition"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </section>
  );
};