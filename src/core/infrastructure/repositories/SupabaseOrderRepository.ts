import type { SupabaseClient } from '@supabase/supabase-js';
import { Order, type OrderProps, type OrderStatus } from '../../domain/entities/Order';
import type { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { RepositoryError } from '../../domain/errors/DomainError';

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAll(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new RepositoryError(`Error al consultar órdenes: ${error.message}`, error);
      }

      return (data || []).map(row => this.mapRowToEntity(row));
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Fallo al obtener órdenes', err);
    }
  }

  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new RepositoryError(`Error al consultar orden ${id}: ${error.message}`, error);
      }

      return data ? this.mapRowToEntity(data) : null;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(`Fallo al obtener orden ${id}`, err);
    }
  }

  async create(order: Order): Promise<Order> {
    try {
      const p = order.toJSON();
      const payload = {
        customer_name: p.customerName || 'Cliente Anónimo',
        customer_city: p.customerCity || '',
        payment_method: p.paymentMethod,
        subtotal: p.subtotal,
        discount: p.discount,
        total: p.total,
        coupon_code: p.couponCode ?? null,
        items: p.items,
        status: p.status ?? 'pending_whatsapp',
      };

      const { data, error } = await this.supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new RepositoryError(`Error al registrar orden: ${error.message}`, error);
      }

      return this.mapRowToEntity(data);
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Fallo al registrar orden', err);
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new RepositoryError(`Error al actualizar estado de orden ${id}: ${error.message}`, error);
      }

      return data ? this.mapRowToEntity(data) : null;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(`Fallo al actualizar orden ${id}`, err);
    }
  }

  private mapRowToEntity(row: any): Order {
    return new Order({
      id: row.id,
      customerName: row.customer_name,
      customerCity: row.customer_city,
      paymentMethod: row.payment_method,
      subtotal: Number(row.subtotal),
      discount: Number(row.discount || 0),
      total: Number(row.total),
      couponCode: row.coupon_code,
      items: row.items || [],
      status: row.status,
      createdAt: row.created_at,
    });
  }
}
