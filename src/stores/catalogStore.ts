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
export const $isQuizOpen = atom<boolean>(false);

// LocalStorage Persistence
if (typeof window !== 'undefined') {
  $catalog.subscribe((items) => {
    try {
      localStorage.setItem(FRAGRANCES_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error persisting catalog', e);
    }
  });

  $banners.subscribe((items) => {
    try {
      localStorage.setItem(BANNERS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error persisting banners', e);
    }
  });
}

// Hydrate store from SSR data
export const initCatalogWithServerData = (items: Fragrance[]) => {
  if (Array.isArray(items) && items.length > 0) {
    $catalog.set(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FRAGRANCES_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving catalog to localStorage', e);
      }
    }
  }
};

export const initBannersWithServerData = (banners: BannerSlide[]) => {
  if (Array.isArray(banners) && banners.length > 0) {
    $banners.set(banners);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
      } catch (e) {
        console.error('Error saving banners to localStorage', e);
      }
    }
  }
};

// Background API Synchronization (Cache-busting enabled)
export const syncCatalogWithBackend = async () => {
  if (typeof window === 'undefined') return;
  try {
    $isSyncing.set(true);
    const res = await fetch(`/api/fragrances?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
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

export const syncBannersWithBackend = async () => {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(`/api/banners?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        $banners.set(data.data);
      }
    }
  } catch (err) {
    console.warn('API banner sync fallback mode', err);
  }
};

// Automatic background sync whenever loaded in browser
if (typeof window !== 'undefined') {
  syncCatalogWithBackend();
  syncBannersWithBackend();
}

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

export const updateBanner = async (id: string, updated: Partial<BannerSlide>) => {
  const currentList = $banners.get();
  const currentItem = currentList.find((b) => b.id === id);
  if (!currentItem) return;
  const mergedBanner = { ...currentItem, ...updated };
  $banners.set(
    currentList.map((item) => (item.id === id ? mergedBanner : item))
  );
  try {
    await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergedBanner),
    });
  } catch (err) {
    console.warn('Backend banner update sync failed, saved locally', err);
  }
};

export const deleteBanner = (id: string) => {
  $banners.set($banners.get().filter((item) => item.id !== id));
};

export const toggleBannerActive = async (id: string) => {
  const currentList = $banners.get();
  const currentItem = currentList.find((b) => b.id === id);
  if (!currentItem) return;
  const mergedBanner = { ...currentItem, isActive: !currentItem.isActive };
  $banners.set(
    currentList.map((item) => (item.id === id ? mergedBanner : item))
  );
  try {
    await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergedBanner),
    });
  } catch (err) {
    console.warn('Backend banner toggle sync failed, saved locally', err);
  }
};

// Quick View Actions
export const openQuickView = (fragrance: Fragrance) => {
  $quickViewFragrance.set(fragrance);
};

export const closeQuickView = () => {
  $quickViewFragrance.set(null);
};

// Quiz Modal Actions
export const openQuiz = () => {
  $isQuizOpen.set(true);
};

export const closeQuiz = () => {
  $isQuizOpen.set(false);
};
