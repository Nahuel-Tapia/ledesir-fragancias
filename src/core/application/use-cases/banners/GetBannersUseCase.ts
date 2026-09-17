import type { Banner } from '../../../domain/entities/Banner';
import type { IBannerRepository } from '../../../domain/repositories/IBannerRepository';

export class GetBannersUseCase {
  constructor(private readonly bannerRepository: IBannerRepository) {}

  async execute(): Promise<Banner[]> {
    return await this.bannerRepository.getAll();
  }
}
