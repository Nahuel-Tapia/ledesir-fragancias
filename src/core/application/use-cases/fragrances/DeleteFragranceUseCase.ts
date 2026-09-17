import type { IFragranceRepository } from '../../../domain/repositories/IFragranceRepository';
import { EntityNotFoundError } from '../../../domain/errors/DomainError';

export class DeleteFragranceUseCase {
  constructor(private readonly fragranceRepository: IFragranceRepository) {}

  async execute(id: string): Promise<boolean> {
    const existing = await this.fragranceRepository.getById(id);
    if (!existing) {
      throw new EntityNotFoundError('Fragrance', id);
    }
    return await this.fragranceRepository.delete(id);
  }
}
