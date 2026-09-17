import { Fragrance, type FragranceProps } from '../../../domain/entities/Fragrance';
import type { IFragranceRepository } from '../../../domain/repositories/IFragranceRepository';

export class CreateFragranceUseCase {
  constructor(private readonly fragranceRepository: IFragranceRepository) {}

  async execute(props: FragranceProps): Promise<Fragrance> {
    const fragrance = new Fragrance(props);
    return await this.fragranceRepository.create(fragrance);
  }
}
