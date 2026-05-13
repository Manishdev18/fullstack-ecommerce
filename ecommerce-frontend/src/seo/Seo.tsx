import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE_PATH, DEFAULT_PAGE_DESCRIPTION, getSiteUrl } from './site';

export interface SeoProps {
  /** Short page title (suffix " | PiOra" is added unless `title` already contains PiOra). */
  title?: string;
  metaDescription?: string;
  /** Path including leading slash, e.g. `/products`. Used with `REACT_APP_SITE_URL` for canonical & OG url. */
  canonicalPath?: string;
  /** Use on checkout, account, seller tools — keeps URLs out of the public index. */
  noindex?: boolean;
  ogType?: 'website' | 'article' | 'product';
  /** Path (leading /) or absolute https URL for og:image */
  ogImagePathOrUrl?: string;
}

function fullTitle(title?: string): string {
  if (!title?.trim()) return 'PiOra — Dry fruits, seeds & Himalayan herbs';
  const t = title.trim();
  if (/piora/i.test(t)) return t;
  return `${t} | PiOra`;
}

function absoluteUrl(base: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export const Seo: React.FC<SeoProps> = ({
  title,
  metaDescription,
  canonicalPath,
  noindex,
  ogType = 'website',
  ogImagePathOrUrl,
}) => {
  const base = getSiteUrl();
  const desc = (metaDescription || DEFAULT_PAGE_DESCRIPTION).slice(0, 320);
  const pageTitle = fullTitle(title);
  const canonical =
    base && canonicalPath != null ? absoluteUrl(base, canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : undefined;
  const pageUrl = canonical || (base && canonicalPath ? absoluteUrl(base, canonicalPath) : undefined);

  let ogImage: string | undefined;
  if (base) {
    const raw = ogImagePathOrUrl || DEFAULT_OG_IMAGE_PATH;
    ogImage = absoluteUrl(base, raw);
  }

  const twitterHandle = (process.env.REACT_APP_TWITTER_HANDLE || '').replace(/^@/, '');

  return (
    <Helmet prioritizeSeoTags>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      <meta property="og:site_name" content="PiOra" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={ogType} />
      {pageUrl ? <meta property="og:url" content={pageUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImage ? <meta property="og:image:alt" content={title ? `${title} — PiOra` : 'PiOra'} /> : null}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      {twitterHandle ? <meta name="twitter:site" content={`@${twitterHandle}`} /> : null}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
    </Helmet>
  );
};
