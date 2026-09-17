import type { APIRoute } from 'astro';
import { AuthService } from '../../../core/application/services/AuthService';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const adminUser = await AuthService.isRequestAuthorized(request, cookies);

    if (!adminUser) {
      return new Response(JSON.stringify({
        authenticated: false,
        user: null,
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return new Response(JSON.stringify({
      authenticated: true,
      user: adminUser,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      authenticated: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
