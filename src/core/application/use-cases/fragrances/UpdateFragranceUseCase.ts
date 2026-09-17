import type { Fragrance, FragranceProps } from '../../../domain/entities/Fragrance';
import type { IFragranceRepository } from '../../../domain/repositories/IFragranceRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';

export class UpdateFragranceUseCase {
  constructor(private readonly fragranceRepository: IFragranceRepository) {}

  async execute(id: string, updates: Partial<FragranceProps>): Promise<Fragrance> {
    const existing = await this.fragranceRepository.getById(id);
    if (!existing) {
      throw new EntityNotFoundError('Fragrance', id);
    }
    const updated = await this.fragranceRepository.update(id, updates);
    if (!updated) {
      throw new EntityNotFoundError('Fragrance', id);
    }
    return updated;
  }
}
