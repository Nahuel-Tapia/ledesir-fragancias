import type { APIRoute } from 'astro';
import { getFragrancesUseCase, createFragranceUseCase } from '../../../core/infrastructure/container';
import type { FragranceCategory, OlfactoryFamily } from '../../../core/domain/entities/Fragrance';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const category = url.searchParams.get('categoria') as FragranceCategory | undefined;
    const family = url.searchParams.get('familia') as OlfactoryFamily | undefined;
    const search = url.searchParams.get('q') || undefined;
    const isFeaturedParam = url.searchParams.get('destacado');
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === 'true' : undefined;

    const fragrances = await getFragrancesUseCase.execute({
      category: category || undefined,
      family: family || undefined,
      search,
      isFeatured,
    });

    return new Response(JSON.stringify({
      success: true,
      total: fragrances.length,
      data: fragrances.map(f => f.toJSON()),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error interno al consultar fragancias',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const fragrance = await createFragranceUseCase.execute(body);

    return new Response(JSON.stringify({
      success: true,
      data: fragrance.toJSON(),
      message: 'Fragancia creada exitosamente',
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error al crear la fragancia',
    }), {
      status: error.code === 'VALIDATION_ERROR' ? 400 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
