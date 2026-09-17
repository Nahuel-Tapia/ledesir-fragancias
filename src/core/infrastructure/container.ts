import { getSupabaseClient, isSupabaseConfigured } from './database/supabaseClient';
import type { IFragranceRepository } from '../domain/repositories/IFragranceRepository';
import type { IBannerRepository } from '../domain/repositories/IBannerRepository';
import type { IOrderRepository } from '../domain/repositories/IOrderRepository';

import { MockFragranceRepository } from './repositories/MockFragranceRepository';
import { SupabaseFragranceRepository } from './repositories/SupabaseFragranceRepository';
import { MockBannerRepository } from './repositories/MockBannerRepository';
import { SupabaseBannerRepository } from './repositories/SupabaseBannerRepository';
import { MockOrderRepository } from './repositories/MockOrderRepository';
import { SupabaseOrderRepository } from './repositories/SupabaseOrderRepository';

import { GetFragrancesUseCase } from '../application/use-cases/fragrances/GetFragrancesUseCase';
import { GetFragranceByIdUseCase } from '../application/use-cases/fragrances/GetFragranceByIdUseCase';
import { CreateFragranceUseCase } from '../application/use-cases/fragrances/CreateFragranceUseCase';
import { UpdateFragranceUseCase } from '../application/use-cases/fragrances/UpdateFragranceUseCase';
import { DeleteFragranceUseCase } from '../application/use-cases/fragrances/DeleteFragranceUseCase';

import { GetBannersUseCase } from '../application/use-cases/banners/GetBannersUseCase';
import { SaveBannerUseCase } from '../application/use-cases/banners/SaveBannerUseCase';

import { CreateOrderUseCase } from '../application/use-cases/orders/CreateOrderUseCase';
import { GetOrdersUseCase } from '../application/use-cases/orders/GetOrdersUseCase';

class Container {
  private fragranceRepository: IFragranceRepository;
  private bannerRepository: IBannerRepository;
  private orderRepository: IOrderRepository;

  public readonly getFragrancesUseCase: GetFragrancesUseCase;
  public readonly getFragranceByIdUseCase: GetFragranceByIdUseCase;
  public readonly createFragranceUseCase: CreateFragranceUseCase;
  public readonly updateFragranceUseCase: UpdateFragranceUseCase;
  public readonly deleteFragranceUseCase: DeleteFragranceUseCase;

  public readonly getBannersUseCase: GetBannersUseCase;
  public readonly saveBannerUseCase: SaveBannerUseCase;

  public readonly createOrderUseCase: CreateOrderUseCase;
  public readonly getOrdersUseCase: GetOrdersUseCase;

  constructor() {
    const supabase = getSupabaseClient();
    const usingSupabase = isSupabaseConfigured() && supabase !== null;

    if (usingSupabase && supabase) {
      console.log('💎 [Clean Architecture] Persistencia activa: PostgreSQL vía Supabase');
      this.fragranceRepository = new SupabaseFragranceRepository(supabase);
      this.bannerRepository = new SupabaseBannerRepository(supabase);
      this.orderRepository = new SupabaseOrderRepository(supabase);
    } else {
      console.log('⚡ [Clean Architecture] Modo Resiliente Activo: Repositorio Mock en Memoria');
      this.fragranceRepository = new MockFragranceRepository();
      this.bannerRepository = new MockBannerRepository();
      this.orderRepository = new MockOrderRepository();
    }

    // Initialize Use Cases with Injected Repositories
    this.getFragrancesUseCase = new GetFragrancesUseCase(this.fragranceRepository);
    this.getFragranceByIdUseCase = new GetFragranceByIdUseCase(this.fragranceRepository);
    this.createFragranceUseCase = new CreateFragranceUseCase(this.fragranceRepository);
    this.updateFragranceUseCase = new UpdateFragranceUseCase(this.fragranceRepository);
    this.deleteFragranceUseCase = new DeleteFragranceUseCase(this.fragranceRepository);

    this.getBannersUseCase = new GetBannersUseCase(this.bannerRepository);
    this.saveBannerUseCase = new SaveBannerUseCase(this.bannerRepository);

    this.createOrderUseCase = new CreateOrderUseCase(this.orderRepository);
    this.getOrdersUseCase = new GetOrdersUseCase(this.orderRepository);
  }

  public isUsingDatabase(): boolean {
    return isSupabaseConfigured();
  }
}

// Singleton Container instance
export const container = new Container();

export const {
  getFragrancesUseCase,
  getFragranceByIdUseCase,
  createFragranceUseCase,
  updateFragranceUseCase,
  deleteFragranceUseCase,
  getBannersUseCase,
  saveBannerUseCase,
  createOrderUseCase,
  getOrdersUseCase,
} = container;
