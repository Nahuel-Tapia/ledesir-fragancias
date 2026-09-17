import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-10', showTagline = true }) => {
  return (
    <div className={`inline-flex flex-col items-center select-none group cursor-pointer ${className}`}>
      <div className="flex items-center gap-3">
        {/* Monogram LD with stylized Crystal Perfume Bottle */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 160 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
          >
            {/* The 'L' block with triangle cut */}
            <path
              d="M15 15H35V95H48L35 75H15V15Z"
              fill="white"
              className="group-hover:fill-brand-gold-light transition-colors"
            />
            {/* The 'D' crescent curve */}
            <path
              d="M115 15C135 30 145 55 145 55C145 55 135 80 115 95C130 80 135 65 135 55C135 45 130 30 115 15Z"
              fill="white"
              className="group-hover:fill-brand-gold-light transition-colors"
            />
            {/* Crystal Perfume Bottle in the Center */}
            <g transform="translate(42, 5) scale(0.72)">
              {/* Bottle Cap with Facets */}
              <rect x="30" y="4" width="28" height="12" rx="2" stroke="white" strokeWidth="2.5" fill="#141416" />
              <line x1="38" y1="4" x2="38" y2="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="50" y1="4" x2="50" y2="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
              <rect x="36" y="16" width="16" height="6" stroke="white" strokeWidth="2" fill="white" fillOpacity="0.2" />

              {/* Glass Bottle Body with Hexagonal/Angled Shoulders */}
              <path
                d="M15 32 L34 22 L54 22 L73 32 L68 96 L20 96 Z"
                stroke="white"
                strokeWidth="2.5"
                fill="#18181b"
                fillOpacity="0.85"
              />
              {/* Inner Facet Reflection Lines */}
              <path d="M22 36 L36 28 L52 28 L66 36" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="22" y1="36" x2="26" y2="92" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="66" y1="36" x2="62" y2="92" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />

              {/* Perfume Liquid / Label Frame */}
              <rect
                x="28"
                y="46"
                width="32"
                height="22"
                rx="2"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity="0.8"
              />
              <path
                d="M26 68 Q44 76 62 68 L60 90 Q44 94 28 90 Z"
                fill="url(#liquidGold)"
                fillOpacity="0.4"
              />

              {/* Internal Dip Tube */}
              <line x1="44" y1="22" x2="44" y2="92" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />

              <defs>
                <linearGradient id="liquidGold" x1="26" y1="68" x2="62" y2="94" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#c5a059" />
                  <stop offset="1" stopColor="#e5ca85" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </g>
          </svg>
        </div>

        {/* Text Wordmark */}
        <div className="flex flex-col">
          <span className="font-editorial text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white leading-none">
            Le Désir
          </span>
          <span className="text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-zinc-400 font-sans font-medium mt-1">
            Parfumerie Privée
          </span>
        </div>
      </div>

      {showTagline && (
        <span className="font-script text-xs sm:text-sm text-brand-gold -mt-1 tracking-wider text-center opacity-90">
          fragancias árabes & diseñador
        </span>
      )}
    </div>
  );
};