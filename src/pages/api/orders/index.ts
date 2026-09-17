import type { APIRoute } from 'astro';
import { createOrderUseCase, getOrdersUseCase } from '../../../core/infrastructure/container';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const orders = await getOrdersUseCase.execute();
    return new Response(JSON.stringify({
      success: true,
      total: orders.length,
      data: orders.map(o => o.toJSON()),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al obtener pedidos',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const order = await createOrderUseCase.execute(body);

    return new Response(JSON.stringify({
      success: true,
      data: order.toJSON(),
      message: 'Pedido registrado con éxito',
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al registrar pedido',
    }), {
      status: error.code === 'VALIDATION_ERROR' ? 400 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
