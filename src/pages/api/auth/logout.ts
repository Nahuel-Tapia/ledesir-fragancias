import type { APIRoute } from 'astro';
import { ADMIN_COOKIE_NAME } from '../../../core/application/services/AuthService';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    cookies.delete(ADMIN_COOKIE_NAME, {
      path: '/',
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Sesión cerrada correctamente.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al cerrar sesión.',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
