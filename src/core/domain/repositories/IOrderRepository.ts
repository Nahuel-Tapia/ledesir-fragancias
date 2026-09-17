import type { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(order: Order): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
}
