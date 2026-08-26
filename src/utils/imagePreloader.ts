import { SHOP_ITEMS } from '../data/shopItems';
import { getAvatarImagePath, BASE_AVATARS } from '../data/avatars';
import { ACCESSORY_FRAMES } from '../data/avatarAccessories';

/**
 * Cache tracker to prevent duplicate image network requests
 */
const preloadedUrls = new Set<string>();

/**
 * Preload a single image URL using the Web API `new Image().src = url`
 */
export function preloadSingleImage(url: string, priority: 'high' | 'low' | 'auto' = 'low'): Promise<void> {
  if (!url || typeof window === 'undefined') return Promise.resolve();
  if (preloadedUrls.has(url)) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.decoding = 'async';
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = priority;
      }
      img.onload = () => {
        preloadedUrls.add(url);
        resolve();
      };
      img.onerror = () => {
        // Resolve anyway to avoid blocking execution
        preloadedUrls.add(url);
        resolve();
      };
      img.src = url;
    } catch {
      resolve();
    }
  });
}

/**
 * Preload all shop assets, uniforms, and avatars in the background
 * to cache them in browser memory for instant UI rendering.
 */
export function preloadShopAndAvatarAssets(): void {
  if (typeof window === 'undefined') return;

  const urlsToPreload = new Set<string>([
    // Official insígnias and brand logos
    '/insignias-minint.webp',
    '/insignias_minint.webp',
    '/insignias-minint.png',
    '/icon-192.png',
    '/icon-512.png',
  ]);

  // Base Organ Avatars (Male and Female)
  const baseOrgans = ['pna', 'sic', 'sme', 'spcb', 'sp'];
  baseOrgans.forEach((organ) => {
    urlsToPreload.add(`/avatars/${organ}_male.png`);
    urlsToPreload.add(`/avatars/${organ}_female.png`);
  });

  // Base avatars list
  BASE_AVATARS.forEach((avatar) => {
    if (avatar.assetPath) {
      urlsToPreload.add(avatar.assetPath);
    }
  });

  // Special Tactical and Gala Uniforms (Male and Female)
  const tacticalUniformIds = [
    'pna_pir',
    'pna_gala',
    'pna_traffic',
    'sic_tactical',
    'sic_forensic',
    'sme_airport',
    'sme_border',
    'sp_honor',
    'spcb_rescue',
    'minint_commissar',
  ];

  tacticalUniformIds.forEach((uId) => {
    urlsToPreload.add(getAvatarImagePath(uId, 'male'));
    urlsToPreload.add(getAvatarImagePath(uId, 'female'));
  });

  // Items from SHOP_ITEMS
  SHOP_ITEMS.forEach((item) => {
    if ((item as any).assetPath) {
      urlsToPreload.add((item as any).assetPath);
    }
    if ((item as any).imageUrl && !(item as any).imageUrl.startsWith('data:')) {
      urlsToPreload.add((item as any).imageUrl);
    }
    if (item.type === 'avatar_farda' || (item as any).type === 'avatar' || item.category === 'fardas') {
      urlsToPreload.add(getAvatarImagePath(item.id, 'male'));
      urlsToPreload.add(getAvatarImagePath(item.id, 'female'));
    }
  });

  // Frames from accessories
  ACCESSORY_FRAMES.forEach((frame) => {
    if (frame.imageUrl && !frame.imageUrl.startsWith('data:')) {
      urlsToPreload.add(frame.imageUrl);
    }
  });

  // Execute in the background using requestIdleCallback or setTimeout
  const runner = () => {
    urlsToPreload.forEach((url) => {
      preloadSingleImage(url, 'low');
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runner, { timeout: 2000 });
  } else {
    setTimeout(runner, 150);
  }
}
