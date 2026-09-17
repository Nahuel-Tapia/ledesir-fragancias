import type { APIRoute } from 'astro';
import { AuthService, ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS } from '../../../core/application/services/AuthService';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Debes proporcionar un correo electrónico y una contraseña.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authResult = await AuthService.validateCredentials(email, password);

    if (!authResult.success || !authResult.user) {
      return new Response(JSON.stringify({
        success: false,
        error: authResult.error || 'Credenciales inválidas.',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate signed session token
    const token = await AuthService.createSessionToken(authResult.user.email);

    // Determine secure flag (true in production/HTTPS)
    const isProd =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');

    // Set HttpOnly cookie
    cookies.set(ADMIN_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: Boolean(isProd),
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Inicio de sesión exitoso.',
      user: authResult.user,
      token, // Also return token for clients that prefer Bearer Authorization header
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error interno al procesar el inicio de sesión.',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
