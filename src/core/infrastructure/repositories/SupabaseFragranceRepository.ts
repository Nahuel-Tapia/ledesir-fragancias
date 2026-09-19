import type { SupabaseClient } from '@supabase/supabase-js';
import { Fragrance, type FragranceProps, type DecantPrice } from '../../domain/entities/Fragrance';
import type { IFragranceRepository, FragranceFilters } from '../../domain/repositories/IFragranceRepository';
import { RepositoryError } from '../../domain/errors/DomainError';
import { INITIAL_FRAGRANCES } from '../../../data/initialFragrances';

export class SupabaseFragranceRepository implements IFragranceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAll(filters?: FragranceFilters): Promise<Fragrance[]> {
    try {
      let query = this.supabase
        .from('fragrances')
        .select(`
          id,
          name,
          brand,
          subtitle,
          category,
          families,
          description,
          image,
          gallery,
          top_notes,
          heart_notes,
          base_notes,
          longevity,
          sillage,
          gender,
          is_featured,
          is_best_seller,
          is_new,
          stock,
          discount_percentage,
          inspired_by,
          created_at,
          updated_at,
          decant_prices (
            size,
            label,
            price,
            original_price,
            in_stock
          )
        `);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.brand) {
        query = query.ilike('brand', filters.brand);
      }
      if (filters?.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,inspired_by.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new RepositoryError(`Error al consultar fragancias en Supabase: ${error.message}`, error);
      }

      return (data || []).map(row => this.mapRowToEntity(row));
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Fallo inesperado en SupabaseFragranceRepository.getAll', err);
    }
  }

  async getById(id: string): Promise<Fragrance | null> {
    try {
      const { data, error } = await this.supabase
        .from('fragrances')
        .select(`
          id,
          name,
          brand,
          subtitle,
          category,
          families,
          description,
          image,
          gallery,
          top_notes,
          heart_notes,
          base_notes,
          longevity,
          sillage,
          gender,
          is_featured,
          is_best_seller,
          is_new,
          stock,
          discount_percentage,
          inspired_by,
          created_at,
          updated_at,
          decant_prices (
            size,
            label,
            price,
            original_price,
            in_stock
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw new RepositoryError(`Error al consultar fragancia ${id}: ${error.message}`, error);
      }

      return data ? this.mapRowToEntity(data) : null;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(`Fallo inesperado al buscar fragancia ${id}`, err);
    }
  }

  async create(fragrance: Fragrance): Promise<Fragrance> {
    try {
      const p = fragrance.toJSON();
      
      const { error: fragError } = await this.supabase
        .from('fragrances')
        .insert({
          id: p.id,
          name: p.name,
          brand: p.brand,
          subtitle: p.subtitle,
          category: p.category,
          families: p.families,
          description: p.description,
          image: p.image,
          gallery: (() => {
            const metaPayload = JSON.stringify({
              occasions: p.occasions,
              occasion: p.occasion,
              season: p.season,
              seasons: p.seasons,
              fragranticaUrl: p.fragranticaUrl,
              imageFit: p.imageFit,
            });
            const clean = (p.gallery || []).filter((g) => typeof g === 'string' && !g.startsWith('__meta__:'));
            clean.push(`__meta__:${metaPayload}`);
            return clean;
          })(),
          top_notes: p.pyramid?.top ?? [],
          heart_notes: p.pyramid?.heart ?? [],
          base_notes: p.pyramid?.base ?? [],
          longevity: p.longevity,
          sillage: p.sillage,
          gender: p.gender,
          is_featured: Boolean(p.isFeatured),
          is_best_seller: Boolean(p.isBestSeller),
          is_new: Boolean(p.isNew),
          stock: p.stock,
          discount_percentage: p.discountPercentage,
          inspired_by: p.inspiredBy,
        });

      if (fragError) {
        throw new RepositoryError(`Error al insertar fragancia: ${fragError.message}`, fragError);
      }

      if (p.prices && p.prices.length > 0) {
        const pricesPayload = p.prices.map(price => ({
          fragrance_id: p.id,
          size: price.size,
          label: price.label,
          price: price.price,
          original_price: price.originalPrice ?? null,
          in_stock: price.inStock,
        }));

        const { error: pricesError } = await this.supabase
          .from('decant_prices')
          .insert(pricesPayload);

        if (pricesError) {
          throw new RepositoryError(`Error al insertar precios de decants: ${pricesError.message}`, pricesError);
        }
      }

      return fragrance;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Fallo inesperado al crear fragancia', err);
    }
  }

  async update(id: string, updates: Partial<FragranceProps>): Promise<Fragrance | null> {
    try {
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
      if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.families !== undefined) dbUpdates.families = updates.families;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
      if (updates.discountPercentage !== undefined) dbUpdates.discount_percentage = updates.discountPercentage;
      if (updates.inspiredBy !== undefined) dbUpdates.inspired_by = updates.inspiredBy;

      if (
        updates.occasions !== undefined ||
        updates.occasion !== undefined ||
        updates.season !== undefined ||
        updates.seasons !== undefined ||
        updates.fragranticaUrl !== undefined ||
        updates.imageFit !== undefined ||
        updates.gallery !== undefined
      ) {
        const metaPayload = JSON.stringify({
          occasions: updates.occasions,
          occasion: updates.occasion,
          season: updates.season,
          seasons: updates.seasons,
          fragranticaUrl: updates.fragranticaUrl,
          imageFit: updates.imageFit,
        });
        const clean = (updates.gallery || []).filter((g) => typeof g === 'string' && !g.startsWith('__meta__:'));
        clean.push(`__meta__:${metaPayload}`);
        dbUpdates.gallery = clean;
      }

      const { error } = await this.supabase
        .from('fragrances')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        throw new RepositoryError(`Error al actualizar fragancia ${id}: ${error.message}`, error);
      }

      return await this.getById(id);
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(`Fallo inesperado al actualizar fragancia ${id}`, err);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('fragrances')
        .delete()
        .eq('id', id);

      if (error) {
        throw new RepositoryError(`Error al eliminar fragancia ${id}: ${error.message}`, error);
      }

      return true;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(`Fallo inesperado al eliminar fragancia ${id}`, err);
    }
  }

  // Helper mapper to transform PostgreSQL snake_case row into Domain Entity Fragrance
  private mapRowToEntity(row: any): Fragrance {
    const rawPrices = row.decant_prices ?? [];
    const prices: DecantPrice[] = rawPrices.map((p: any) => ({
      size: p.size,
      label: p.label,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      inStock: Boolean(p.in_stock),
    }));

    // Extract extended metadata (occasions, season, fragranticaUrl, imageFit)
    let occasions: string[] | undefined = row.occasions;
    let occasion: string | undefined = row.occasion;
    let season: string | undefined = row.season;
    let seasons: string[] | undefined = row.seasons;
    let fragranticaUrl: string | undefined = row.fragrantica_url;
    let imageFit: 'cover' | 'contain' | undefined = row.image_fit;

    // Decode from gallery metadata if present: '__meta__:{...}'
    const rawGallery: string[] = row.gallery || [];
    const cleanGallery: string[] = [];

    for (const item of rawGallery) {
      if (typeof item === 'string' && item.startsWith('__meta__:')) {
        try {
          const meta = JSON.parse(item.slice(9));
          if (meta.occasions) occasions = meta.occasions;
          if (meta.occasion) occasion = meta.occasion;
          if (meta.season) season = meta.season;
          if (meta.seasons) seasons = meta.seasons;
          if (meta.fragranticaUrl) fragranticaUrl = meta.fragranticaUrl;
          if (meta.imageFit) imageFit = meta.imageFit;
        } catch (e) {}
      } else {
        cleanGallery.push(item);
      }
    }

    // Fallback to initialFragrances match if not populated in DB
    const initialMatch = INITIAL_FRAGRANCES.find((f) => f.id === row.id);
    if (initialMatch) {
      if ((!occasions || occasions.length === 0) && initialMatch.occasions) occasions = initialMatch.occasions;
      if (!occasion && initialMatch.occasion) occasion = initialMatch.occasion;
      if (!season && initialMatch.season) season = initialMatch.season;
      if (!fragranticaUrl && initialMatch.fragranticaUrl) fragranticaUrl = initialMatch.fragranticaUrl;
      if (!imageFit && initialMatch.imageFit) imageFit = initialMatch.imageFit;
    }

    return new Fragrance({
      id: row.id,
      name: row.name,
      brand: row.brand,
      subtitle: row.subtitle,
      category: row.category,
      families: row.families || [],
      description: row.description,
      image: row.image,
      gallery: cleanGallery,
      prices: prices.length > 0 ? prices : [
        { size: '100ml', label: 'Frasco Completo 100ml', price: 65000, inStock: row.stock > 0 }
      ],
      pyramid: {
        top: row.top_notes || [],
        heart: row.heart_notes || [],
        base: row.base_notes || [],
      },
      longevity: row.longevity || 'Larga Duración (8-12h)',
      sillage: row.sillage || 'Moderada',
      gender: row.gender || 'Unisex',
      occasion: occasion || occasions?.[0],
      occasions: occasions || (occasion ? [occasion] : []),
      season: season || 'Todo el Año',
      seasons,
      fragranticaUrl,
      imageFit: imageFit || (row.image?.toLowerCase().endsWith('.png') ? 'contain' : 'cover'),
      isFeatured: Boolean(row.is_featured),
      isBestSeller: Boolean(row.is_best_seller),
      isNew: Boolean(row.is_new),
      stock: Number(row.stock || 0),
      discountPercentage: row.discount_percentage ? Number(row.discount_percentage) : undefined,
      inspiredBy: row.inspired_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
