/** Public site origin for canonical URLs, Open Graph, and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  const raw = process.env.REACT_APP_SITE_URL || '';
  return raw.replace(/\/$/, '');
}

export const DEFAULT_PAGE_DESCRIPTION =
  'PiOra — premium dry fruits, seeds, seed mixes, superfoods & berries, and Himalayan organic herbs. Shop our catalog online.';

export const DEFAULT_OG_IMAGE_PATH = '/piora/hero-reference.png';
