/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#141416',       // Deep graphite/obsidian
          surface: '#1c1c1f',    // Card surface
          elevated: '#242428',   // Overlays and dropdowns
          border: 'rgba(255, 255, 255, 0.08)',
          'border-strong': 'rgba(255, 255, 255, 0.16)',
          gold: '#c5a059',       // Refined champagne gold
          'gold-light': '#e5ca85',
          'gold-dark': '#9b7b38',
          sand: '#f5f4f0',       // Ivory/Sand highlight
          muted: '#94949e',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        script: ['"Pinyon Script"', 'cursive', 'Georgia'],
      },
      boxShadow: {
        luxury: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        glow: '0 0 25px -5px rgba(197, 160, 89, 0.25)',
      },
    },
  },
  plugins: [],
};