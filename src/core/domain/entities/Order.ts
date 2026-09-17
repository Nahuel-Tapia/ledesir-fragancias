/**
 * Clean Architecture - Domain Entity: Order
 * Represents boutique customer orders with items, pricing breakdown and status.
 */

export interface OrderItemProps {
  id: string;
  fragranceId: string;
  name: string;
  brand: string;
  image: string;
  size: '5ml' | '10ml' | '100ml' | 'unidad';
  price: number;
  quantity: number;
}

export type PaymentMethod = 'transfer' | 'card' | 'cash';
export type OrderStatus = 'pending_whatsapp' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderProps {
  id?: string;
  customerName?: string;
  customerCity?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  items: OrderItemProps[];
  status?: OrderStatus;
  createdAt?: string;
}

export class Order {
  constructor(public readonly props: OrderProps) {
    this.validate();
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get total(): number {
    return this.props.total;
  }

  get status(): OrderStatus {
    return this.props.status ?? 'pending_whatsapp';
  }

  private validate(): void {
    if (!this.props.items || this.props.items.length === 0) {
      throw new Error('El pedido debe incluir al menos un producto.');
    }
    if (this.props.total < 0) {
      throw new Error('El total del pedido no puede ser negativo.');
    }
  }

  public toJSON(): OrderProps {
    return { ...this.props };
  }
}
