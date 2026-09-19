import type { BannerSlide, PromoBar, Coupon } from '../types/fragrance';

export const INITIAL_BANNERS: BannerSlide[] = [
  {
    id: 'slide-1',
    title: "L'Opulence d'Orient",
    titleAccent: 'Perfumería Árabe Exclusiva',
    subtitle: 'Fragancias legendarias con estela arrolladora y fijación extrema. Notas de Oud real, dátiles caramelizados, ámbar y especias exóticas.',
    badge: '✨ Colección Dubai & Emiratos',
    ctaText: 'Explorar Fragancias Árabes',
    ctaLink: '/catalogo?categoria=arabe',
    secondaryCtaText: 'Ver Decants desde $6.800',
    secondaryCtaLink: '/decants',
    bgGradient: 'from-amber-950/40 via-zinc-950/80 to-zinc-950',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80',
    isActive: true,
  },
  {
    id: 'slide-2',
    title: 'El Arte del Decanting',
    titleAccent: 'Descubre sin arriesgar',
    subtitle: 'Accede a las fragancias más costosas del mundo en formatos de 5ml y 10ml con atomizador de alta precisión. La forma más inteligente de crear tu colección.',
    badge: '💎 Ahorra hasta un 85%',
    ctaText: 'Ver Guía y Catálogo Decants',
    ctaLink: '/decants',
    secondaryCtaText: 'Probar Coffrets',
    secondaryCtaLink: '/catalogo?categoria=extra',
    bgGradient: 'from-zinc-900/60 via-zinc-950/90 to-zinc-950',
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=80',
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Luxe de Créateur',
    titleAccent: 'Diseñador & Alta Gama',
    subtitle: 'Las creaciones emblemáticas de las casas de perfumería más prestigiosas de París y Milán: Tom Ford, Dior, Chanel e YSL en stock inmediato.',
    badge: '👑 Selecciones Privadas',
    ctaText: 'Ver Colección Diseñador',
    ctaLink: '/catalogo',
    secondaryCtaText: 'Contactar Asesor',
    secondaryCtaLink: 'https://wa.me/5492645162780?text=Hola!%20Quisiera%20asesoramiento%20sobre%20fragancias',
    bgGradient: 'from-stone-900/50 via-zinc-950/85 to-zinc-950',
    imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1600&q=80',
    isActive: false,
  },
];

export const INITIAL_PROMO_BAR: PromoBar = {
  active: true,
  messages: [
    '✨ Envíos express a todo el país • Decant de cortesía en compras superiores a $50.000',
    '💳 3 Cuotas sin interés con todas las tarjetas • 10% OFF pagando con Transferencia',
    '🌟 Fragancias 100% originales verificadas • Stock limitado por lote de importación',
  ],
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'DESIR10',
    discountPercentage: 10,
    description: '10% OFF en tu primera compra',
  },
  {
    code: 'DECANTLOVER',
    discountPercentage: 15,
    minAmount: 30000,
    description: '15% OFF en compras mayores a $30.000',
  },
];