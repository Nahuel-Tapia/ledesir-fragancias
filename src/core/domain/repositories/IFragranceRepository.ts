import type { Fragrance, FragranceCategory, FragranceProps, OlfactoryFamily } from '../entities/Fragrance';

export interface FragranceFilters {
  category?: FragranceCategory;
  family?: OlfactoryFamily;
  brand?: string;
  search?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface IFragranceRepository {
  getAll(filters?: FragranceFilters): Promise<Fragrance[]>;
  getById(id: string): Promise<Fragrance | null>;
  create(fragrance: Fragrance): Promise<Fragrance>;
  update(id: string, updates: Partial<FragranceProps>): Promise<Fragrance | null>;
  delete(id: string): Promise<boolean>;
}
