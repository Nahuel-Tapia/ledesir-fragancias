import { Order, type OrderProps, type OrderStatus } from '../../domain/entities/Order';
import type { IOrderRepository } from '../../domain/repositories/IOrderRepository';

export class MockOrderRepository implements IOrderRepository {
  private static items: OrderProps[] = [];

  async getAll(): Promise<Order[]> {
    return MockOrderRepository.items.map(o => new Order(o));
  }

  async getById(id: string): Promise<Order | null> {
    const item = MockOrderRepository.items.find(o => o.id === id);
    return item ? new Order(item) : null;
  }

  async create(order: Order): Promise<Order> {
    const props = {
      ...order.toJSON(),
      id: order.id || `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    MockOrderRepository.items.unshift(props);
    return new Order(props);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const item = MockOrderRepository.items.find(o => o.id === id);
    if (!item) return null;
    item.status = status;
    return new Order(item);
  }
}
