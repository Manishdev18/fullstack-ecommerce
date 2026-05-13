import { DEFAULT_OG_IMAGE_PATH, DEFAULT_PAGE_DESCRIPTION } from './site';

export function organizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PiOra',
    url: siteUrl,
    description: DEFAULT_PAGE_DESCRIPTION,
    logo: `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`,
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PiOra',
    url: siteUrl,
    description: DEFAULT_PAGE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productJsonLd(
  siteUrl: string,
  product: { id: number; name: string; desc: string; price: string; imageAbsolute?: string; quantity?: number }
) {
  const url = `${siteUrl}/products/${product.id}`;
  const images = product.imageAbsolute
    ? [product.imageAbsolute]
    : [`${siteUrl}${DEFAULT_OG_IMAGE_PATH}`];
  const inStock = (product.quantity ?? 0) > 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc || DEFAULT_PAGE_DESCRIPTION,
    image: images,
    sku: String(product.id),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'NPR',
      price: product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
}
