/**
 * Clean Architecture - Domain Entity: Fragrance
 * Represents a fragrance in the boutique catalog.
 * Decoupled from frameworks, databases and UI.
 */

export type FragranceCategory = 'arabe' | 'disenador' | 'nicho' | 'extra';

export interface DecantPrice {
  size: '5ml' | '10ml' | '100ml' | 'unidad';
  label: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface OlfactoryPyramid {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragranceProps {
  id: string;
  name: string;
  brand: string;
  subtitle?: string;
  category: FragranceCategory;
  families: string[];
  description: string;
  image: string;
  gallery?: string[];
  prices: DecantPrice[];
  pyramid?: OlfactoryPyramid;
  longevity: string;
  sillage: string;
  gender: 'Unisex' | 'Masculino' | 'Femenino';
  occasion?: string;
  occasions?: string[];
  season?: string;
  seasons?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  stock: number;
  discountPercentage?: number;
  inspiredBy?: string;
  imageFit?: 'cover' | 'contain';
  fragranticaUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Fragrance {
  constructor(public readonly props: FragranceProps) {
    this.validate();
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get brand(): string {
    return this.props.brand;
  }

  get category(): FragranceCategory {
    return this.props.category;
  }

  get stock(): number {
    return this.props.stock;
  }

  get inStock(): boolean {
    return this.props.stock > 0;
  }

  get prices(): DecantPrice[] {
    return this.props.prices;
  }

  get mainPrice(): number {
    return this.props.prices[0]?.price ?? 0;
  }

  public calculateTransferDiscountPrice(discountPercentage = 0.10): number {
    return Math.round(this.mainPrice * (1 - discountPercentage));
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('El nombre de la fragancia no puede estar vacío.');
    }
    if (this.props.stock < 0) {
      throw new Error('El stock no puede ser negativo.');
    }
    if (!this.props.prices || this.props.prices.length === 0) {
      throw new Error('La fragancia debe incluir al menos una presentación de precio.');
    }
  }

  public toJSON(): FragranceProps {
    return { ...this.props };
  }
}
