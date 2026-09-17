import type { APIRoute } from 'astro';
import { getFragranceByIdUseCase, updateFragranceUseCase, deleteFragranceUseCase } from '../../../core/infrastructure/container';
import { AuthService } from '../../../core/application/services/AuthService';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'ID no provisto' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fragrance = await getFragranceByIdUseCase.execute(id);
    return new Response(JSON.stringify({
      success: true,
      data: fragrance.toJSON(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const isNotFound = error.code === 'ENTITY_NOT_FOUND';
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: isNotFound ? 404 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const isAuth = await AuthService.isRequestAuthorized(request, cookies);
  if (!isAuth) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado. Se requieren credenciales de administrador para modificar fragancias.',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'ID no provisto' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const updates = await request.json();
    const updated = await updateFragranceUseCase.execute(id, updates);

    return new Response(JSON.stringify({
      success: true,
      data: updated.toJSON(),
      message: 'Fragancia actualizada correctamente',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const isNotFound = error.code === 'ENTITY_NOT_FOUND';
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: isNotFound ? 404 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const isAuth = await AuthService.isRequestAuthorized(request, cookies);
  if (!isAuth) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado. Se requieren credenciales de administrador para eliminar fragancias.',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'ID no provisto' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const deleted = await deleteFragranceUseCase.execute(id);
    return new Response(JSON.stringify({
      success: true,
      deleted,
      message: 'Fragancia eliminada correctamente',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const isNotFound = error.code === 'ENTITY_NOT_FOUND';
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: isNotFound ? 404 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
