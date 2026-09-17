import type { Banner } from '../entities/Banner';

export interface IBannerRepository {
  getAll(): Promise<Banner[]>;
  save(banner: Banner): Promise<Banner>;
  delete(id: string): Promise<boolean>;
}
