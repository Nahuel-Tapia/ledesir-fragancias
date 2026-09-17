import { Order, type OrderProps } from '../../../domain/entities/Order';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(orderData: Omit<OrderProps, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    // Generate boutique order number (e.g., LD-98214)
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `LD-${randomCode}`;

    const order = new Order({
      ...orderData,
      orderNumber,
      createdAt: new Date(),
    });

    return await this.orderRepository.create(order);
  }
}
