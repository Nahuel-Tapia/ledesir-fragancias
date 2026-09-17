import { Banner, type BannerProps } from '../../domain/entities/Banner';
import type { IBannerRepository } from '../../domain/repositories/IBannerRepository';
import { INITIAL_BANNERS } from '../../../data/initialBanners';

export class MockBannerRepository implements IBannerRepository {
  private static items: BannerProps[] = INITIAL_BANNERS.map((b, idx) => ({
    id: b.id,
    title: b.title,
    titleAccent: b.titleAccent,
    subtitle: b.subtitle,
    ctaText: b.ctaText,
    ctaLink: b.ctaLink,
    secondaryCtaText: b.secondaryCtaText,
    secondaryCtaLink: b.secondaryCtaLink,
    badge: b.badge,
    bgGradient: b.bgGradient,
    imageUrl: b.imageUrl,
    isActive: b.isActive,
    order: idx,
  }));

  async getAll(): Promise<Banner[]> {
    return MockBannerRepository.items.map(b => new Banner(b));
  }

  async save(banner: Banner): Promise<Banner> {
    const props = banner.toJSON();
    const index = MockBannerRepository.items.findIndex(b => b.id === props.id);
    if (index >= 0) {
      MockBannerRepository.items[index] = props;
    } else {
      MockBannerRepository.items.push(props);
    }
    return new Banner(props);
  }

  async delete(id: string): Promise<boolean> {
    const len = MockBannerRepository.items.length;
    MockBannerRepository.items = MockBannerRepository.items.filter(b => b.id !== id);
    return MockBannerRepository.items.length < len;
  }
}
