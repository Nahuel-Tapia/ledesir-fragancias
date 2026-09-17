import { getSupabaseClient, isSupabaseConfigured } from '../../infrastructure/database/supabaseClient';

export interface AdminUser {
  email: string;
  role: 'admin';
  authenticatedAt: string;
}

interface TokenPayload {
  email: string;
  role: 'admin';
  exp: number;
  iat: number;
}

export const ADMIN_COOKIE_NAME = 'ledesir_admin_token';
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Helper to safely get environment variables across Astro SSR & Vercel Serverless
const getEnv = (key: string, defaultValue = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return String(import.meta.env[key]);
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return String(process.env[key]);
  }
  return defaultValue;
};

// Base64URL encoding/decoding helpers
const base64UrlEncode = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

export class AuthService {
  private static getSecretKey(): string {
    return (
      getEnv('ADMIN_SESSION_SECRET') ||
      getEnv('SUPABASE_SERVICE_ROLE_KEY') ||
      'ledesir-parfumerie-privee-default-security-key-2025'
    );
  }

  public static getAdminEmail(): string {
    return getEnv('ADMIN_EMAIL', 'admin@ledesir.com');
  }

  public static getAdminPassword(): string {
    return getEnv('ADMIN_PASSWORD', 'LeDesir2025!*');
  }

  /**
   * Generates a cryptographically signed HMAC-SHA256 session token
   */
  public static async createSessionToken(email: string): Promise<string> {
    const payload: TokenPayload = {
      email,
      role: 'admin',
      iat: Date.now(),
      exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
    };

    const payloadJson = JSON.stringify(payload);
    const encodedPayload = base64UrlEncode(payloadJson);

    const secret = this.getSecretKey();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(encodedPayload)
    );

    const signatureBytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < signatureBytes.byteLength; i++) {
      binary += String.fromCharCode(signatureBytes[i]);
    }
    const encodedSignature = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return `${encodedPayload}.${encodedSignature}`;
  }

  /**
   * Verifies an HMAC-SHA256 session token
   */
  public static async verifySessionToken(token: string | null | undefined): Promise<AdminUser | null> {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, encodedSignature] = parts;

    try {
      const secret = this.getSecretKey();
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Decode signature
      let base64Sig = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
      while (base64Sig.length % 4) base64Sig += '=';
      const binarySig = atob(base64Sig);
      const signatureBytes = new Uint8Array(binarySig.length);
      for (let i = 0; i < binarySig.length; i++) {
        signatureBytes[i] = binarySig.charCodeAt(i);
      }

      const isValid = await crypto.subtle.verify(
        'HMAC',
        cryptoKey,
        signatureBytes,
        encoder.encode(encodedPayload)
      );

      if (!isValid) return null;

      const payloadJson = base64UrlDecode(encodedPayload);
      const payload: TokenPayload = JSON.parse(payloadJson);

      if (payload.exp < Date.now()) {
        return null; // Expired
      }

      return {
        email: payload.email,
        role: 'admin',
        authenticatedAt: new Date(payload.iat).toISOString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Validates credentials against environment configuration or Supabase Auth
   */
  public static async validateCredentials(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const configuredEmail = this.getAdminEmail().trim().toLowerCase();
    const configuredPassword = this.getAdminPassword();

    // 1. Direct environment credentials check
    if (cleanEmail === configuredEmail && password === configuredPassword) {
      return {
        success: true,
        user: {
          email: cleanEmail,
          role: 'admin',
          authenticatedAt: new Date().toISOString(),
        },
      };
    }

    // 2. Supabase Auth check (if configured)
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data.user) {
            return {
              success: true,
              user: {
                email: data.user.email || cleanEmail,
                role: 'admin',
                authenticatedAt: new Date().toISOString(),
              },
            };
          }
        } catch {
          // Fall through to invalid credentials
        }
      }
    }

    return {
      success: false,
      error: 'Credenciales de administrador incorrectas. Verifica el correo y la contraseña.',
    };
  }

  /**
   * Helper to verify if an incoming request has valid admin credentials
   * Checks both Astro cookies and Authorization header
   */
  public static async isRequestAuthorized(
    request: Request,
    cookies?: { get: (name: string) => { value: string } | undefined }
  ): Promise<AdminUser | null> {
    // 1. Check cookie first
    if (cookies) {
      const cookieToken = cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (cookieToken) {
        const user = await this.verifySessionToken(cookieToken);
        if (user) return user;
      }
    }

    // 2. Check Cookie header directly from Request
    const rawCookieHeader = request.headers.get('cookie') || '';
    const cookieMatches = rawCookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
    if (cookieMatches && cookieMatches[1]) {
      const user = await this.verifySessionToken(decodeURIComponent(cookieMatches[1]));
      if (user) return user;
    }

    // 3. Check Authorization header: Bearer <token>
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      const user = await this.verifySessionToken(bearerToken);
      if (user) return user;
    }

    return null;
  }
}
