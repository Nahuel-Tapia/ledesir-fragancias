import { Fragrance, type FragranceProps } from '../../domain/entities/Fragrance';
import type { IFragranceRepository, FragranceFilters } from '../../domain/repositories/IFragranceRepository';
import { INITIAL_FRAGRANCES } from '../../../data/initialFragrances';

export class MockFragranceRepository implements IFragranceRepository {
  private static items: FragranceProps[] = [...INITIAL_FRAGRANCES];

  async getAll(filters?: FragranceFilters): Promise<Fragrance[]> {
    let result = [...MockFragranceRepository.items];

    if (filters?.category) {
      result = result.filter(f => f.category === filters.category);
    }
    if (filters?.brand) {
      result = result.filter(f => f.brand.toLowerCase() === filters.brand!.toLowerCase());
    }
    if (filters?.isFeatured !== undefined) {
      result = result.filter(f => Boolean(f.isFeatured) === filters.isFeatured);
    }
    if (filters?.family) {
      result = result.filter(f => f.families.some(fam => fam.toLowerCase().includes(filters.family!.toLowerCase())));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q) ||
        (f.inspiredBy && f.inspiredBy.toLowerCase().includes(q)) ||
        f.description.toLowerCase().includes(q)
      );
    }

    return result.map(p => new Fragrance(p));
  }

  async getById(id: string): Promise<Fragrance | null> {
    const item = MockFragranceRepository.items.find(f => f.id === id);
    return item ? new Fragrance(item) : null;
  }

  async create(fragrance: Fragrance): Promise<Fragrance> {
    const props = fragrance.toJSON();
    MockFragranceRepository.items.unshift(props);
    return new Fragrance(props);
  }

  async update(id: string, updates: Partial<FragranceProps>): Promise<Fragrance | null> {
    const index = MockFragranceRepository.items.findIndex(f => f.id === id);
    if (index === -1) return null;

    MockFragranceRepository.items[index] = {
      ...MockFragranceRepository.items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return new Fragrance(MockFragranceRepository.items[index]);
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = MockFragranceRepository.items.length;
    MockFragranceRepository.items = MockFragranceRepository.items.filter(f => f.id !== id);
    return MockFragranceRepository.items.length < initialLen;
  }
}
