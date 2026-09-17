import type { Fragrance } from '../../../domain/entities/Fragrance';
import type { IFragranceRepository } from '../../../domain/repositories/IFragranceRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';

export class GetFragranceByIdUseCase {
  constructor(private readonly fragranceRepository: IFragranceRepository) {}

  async execute(id: string): Promise<Fragrance> {
    const fragrance = await this.fragranceRepository.getById(id);
    if (!fragrance) {
      throw new EntityNotFoundError('Fragrance', id);
    }
    return fragrance;
  }
}
