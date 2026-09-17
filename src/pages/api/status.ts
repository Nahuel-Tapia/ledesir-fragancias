import type { APIRoute } from 'astro';
import { isSupabaseConfigured } from '../../core/infrastructure/database/supabaseClient';

export const prerender = false;

export const GET: APIRoute = async () => {
  const databaseConnected = isSupabaseConfigured();

  return new Response(JSON.stringify({
    name: 'Le Désir Fragancias API',
    status: 'online',
    version: '1.0.0',
    architecture: 'Clean Architecture (Ports & Adapters)',
    environment: {
      persistence: databaseConnected ? 'Supabase PostgreSQL' : 'Mock Resilient In-Memory',
      databaseConfigured: databaseConnected,
      framework: 'Astro 5 (Server SSR)',
      adapter: 'Vercel Serverless',
    },
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
};
