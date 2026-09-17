import type { SupabaseClient } from '@supabase/supabase-js';
import { Banner, type BannerProps } from '../../domain/entities/Banner';
import type { IBannerRepository } from '../../domain/repositories/IBannerRepository';
import { RepositoryError } from '../../domain/errors/DomainError';

export class SupabaseBannerRepository implements IBannerRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getAll(): Promise<Banner[]> {
    try {
      const { data, error } = await this.supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        throw new RepositoryError(`Error al consultar banners: ${error.message}`, error);
      }

      return (data || []).map(row => new Banner({
        id: row.id,
        title: row.title,
        titleAccent: row.title_accent,
        subtitle: row.subtitle,
        badge: row.badge,
        ctaText: row.cta_text,
        ctaLink: row.cta_link,
        secondaryCtaText: row.secondary_cta_text,
        secondaryCtaLink: row.secondary_cta_link,
        bgGradient: row.bg_gradient,
        imageUrl: row.image_url,
        isActive: Boolean(row.is_active),
        order: row.sort_order ?? 0,
      }));
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Fallo al obtener banners', err);
    }
  }

  async save(banner: Banner): Promise<Banner> {
    try {
      const p = banner.toJSON();
      const payload = {
        id: p.id,
        title: p.title,
        title_accent: p.titleAccent,
        subtitle: p.subtitle,
        badge: p.badge,
        cta_text: p.ctaText,
        cta_link: p.ctaLink,
        secondary_cta_text: p.secondaryCtaText,
        secondary_cta_link: p.secondaryCtaLink,
        bg_gradient: p.bgGradient,
        image_url: p.imageUrl,
        is_active: p.isActive,
        sort_order: p.order ?? 0,
      };

      const { error } = await this.supabase
        .from('banners')
        .upsert(payload);

      if (error) {
        throw new RepositoryError(`Error al guardar banner: ${error.message}`, error);
      }

      return banner;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError('Fallo al guardar banner', err);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        throw new RepositoryError(`Error al eliminar banner: ${error.message}`, error);
      }

      return true;
    } catch (err: unknown) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(`Fallo al eliminar banner ${id}`, err);
    }
  }
}
