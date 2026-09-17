import type { APIRoute } from 'astro';
import { getBannersUseCase, saveBannerUseCase } from '../../../core/infrastructure/container';
import { AuthService } from '../../../core/application/services/AuthService';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const banners = await getBannersUseCase.execute();
    return new Response(JSON.stringify({
      success: true,
      data: banners.map(b => b.toJSON()),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al obtener banners',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuth = await AuthService.isRequestAuthorized(request, cookies);
  if (!isAuth) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado. Se requieren credenciales de administrador para gestionar banners.',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const banner = await saveBannerUseCase.execute(body);

    return new Response(JSON.stringify({
      success: true,
      data: banner.toJSON(),
      message: 'Banner guardado correctamente',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al guardar banner',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
