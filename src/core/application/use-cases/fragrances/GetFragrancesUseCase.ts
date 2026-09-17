import type { Fragrance } from '../../../domain/entities/Fragrance';
import type { IFragranceRepository, FragranceFilters } from '../../../domain/repositories/IFragranceRepository';

export class GetFragrancesUseCase {
  constructor(private readonly fragranceRepository: IFragranceRepository) {}

  async execute(filters?: FragranceFilters): Promise<Fragrance[]> {
    return await this.fragranceRepository.getAll(filters);
  }
}
