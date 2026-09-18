export type FragranceCategory = 'arabe' | 'disenador' | 'nicho' | 'extra';

export type OlfactoryFamily = 
  | 'Amaderado'
  | 'Oriental / Especiado'
  | 'Gourmand / Dulce'
  | 'Cítrico / Fresco'
  | 'Floral'
  | 'Cuero / Ahumado'
  | 'Aromático / Fougère';

export interface OlfactoryPyramid {
  top: string[];    // Notas de Salida
  heart: string[];  // Notas de Corazón
  base: string[];   // Notas de Fondo
}

export interface DecantPrice {
  size: '5ml' | '10ml' | '100ml' | 'unidad';
  label: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  subtitle?: string;
  category: FragranceCategory;
  families: OlfactoryFamily[];
  description: string;
  image: string;
  gallery?: string[];
  prices: DecantPrice[]; // 5ml, 10ml, 100ml
  pyramid: OlfactoryPyramid;
  longevity: 'Moderada (6-8h)' | 'Larga Duración (8-12h)' | 'Modo Bestia (+12h)';
  sillage: 'Íntima' | 'Moderada' | 'Pesada / Enorme';
  gender: 'Unisex' | 'Masculino' | 'Femenino';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  stock: number;
  discountPercentage?: number;
  inspiredBy?: string;
  imageFit?: 'cover' | 'contain';
}

export interface CartItem {
  id: string; // unique item id: fragranceId-size
  fragranceId: string;
  name: string;
  brand: string;
  image: string;
  size: '5ml' | '10ml' | '100ml' | 'unidad';
  price: number;
  quantity: number;
}

export interface BannerSlide {
  id: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  badge?: string;
  bgGradient?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface PromoBar {
  messages: string[];
  active: boolean;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  minAmount?: number;
  description: string;
}