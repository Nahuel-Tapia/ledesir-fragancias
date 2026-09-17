import type { Order } from '../../../domain/entities/Order';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';

export class GetOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<Order[]> {
    return await this.orderRepository.getAll();
  }
}
