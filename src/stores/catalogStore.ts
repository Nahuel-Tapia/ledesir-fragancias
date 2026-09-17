import { atom } from 'nanostores';
import type { Fragrance, BannerSlide } from '../types/fragrance';
import { INITIAL_FRAGRANCES } from '../data/initialFragrances';
import { INITIAL_BANNERS } from '../data/initialBanners';

const FRAGRANCES_KEY = 'ledesir_catalog_v1';
const BANNERS_KEY = 'ledesir_banners_v1';

// Initial loaders
const getInitialFragrances = (): Fragrance[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(FRAGRANCES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing catalog', e);
      }
    }
  }
  return INITIAL_FRAGRANCES;
};

const getInitialBanners = (): BannerSlide[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BANNERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing banners', e);
      }
    }
  }
  return INITIAL_BANNERS;
};

// Atoms
export const $catalog = atom<Fragrance[]>(getInitialFragrances());
export const $banners = atom<BannerSlide[]>(getInitialBanners());
export const $quickViewFragrance = atom<Fragrance | null>(null);
export const $isSyncing = atom<boolean>(false);

// LocalStorage Persistence
if (typeof window !== 'undefined') {
  $catalog.subscribe((items) => {
    localStorage.setItem(FRAGRANCES_KEY, JSON.stringify(items));
  });

  $banners.subscribe((items) => {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(items));
  });
}

// Background API Synchronization
export const syncCatalogWithBackend = async () => {
  if (typeof window === 'undefined') return;
  try {
    $isSyncing.set(true);
    const res = await fetch('/api/fragrances');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        $catalog.set(data.data);
      }
    }
  } catch (err) {
    console.warn('API fetch offline/fallback mode, using local state', err);
  } finally {
    $isSyncing.set(false);
  }
};

// Fragrance Actions (Optimistic + Backend Sync)
export const addFragrance = async (fragrance: Fragrance) => {
  $catalog.set([fragrance, ...$catalog.get()]);
  try {
    await fetch('/api/fragrances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fragrance),
    });
  } catch (err) {
    console.warn('Backend sync failed, saved locally', err);
  }
};

export const updateFragrance = async (id: string, updated: Partial<Fragrance>) => {
  $catalog.set(
    $catalog.get().map((item) => (item.id === id ? { ...item, ...updated } : item))
  );
  try {
    await fetch(`/api/fragrances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (err) {
    console.warn('Backend sync failed, saved locally', err);
  }
};

export const deleteFragrance = async (id: string) => {
  $catalog.set($catalog.get().filter((item) => item.id !== id));
  try {
    await fetch(`/api/fragrances/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Backend sync failed, saved locally', err);
  }
};

export const resetToDefaults = () => {
  $catalog.set(INITIAL_FRAGRANCES);
  $banners.set(INITIAL_BANNERS);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FRAGRANCES_KEY);
    localStorage.removeItem(BANNERS_KEY);
  }
};

// Banner Actions
export const addBanner = async (banner: BannerSlide) => {
  $banners.set([...$banners.get(), banner]);
  try {
    await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner),
    });
  } catch (err) {
    console.warn('Backend banner sync failed, saved locally', err);
  }
};

export const updateBanner = (id: string, updated: Partial<BannerSlide>) => {
  $banners.set(
    $banners.get().map((item) => (item.id === id ? { ...item, ...updated } : item))
  );
};

export const deleteBanner = (id: string) => {
  $banners.set($banners.get().filter((item) => item.id !== id));
};

export const toggleBannerActive = (id: string) => {
  $banners.set(
    $banners.get().map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
  );
};

// Quick View Actions
export const openQuickView = (fragrance: Fragrance) => {
  $quickViewFragrance.set(fragrance);
};

export const closeQuickView = () => {
  $quickViewFragrance.set(null);
};
