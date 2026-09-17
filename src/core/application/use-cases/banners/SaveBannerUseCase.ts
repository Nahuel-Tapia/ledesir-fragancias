import { Banner, type BannerProps } from '../../../domain/entities/Banner';
import type { IBannerRepository } from '../../../domain/repositories/IBannerRepository';

export class SaveBannerUseCase {
  constructor(private readonly bannerRepository: IBannerRepository) {}

  async execute(props: BannerProps): Promise<Banner> {
    const banner = new Banner(props);
    return await this.bannerRepository.save(banner);
  }
}
