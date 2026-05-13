import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { productsAPI } from '../services/api';
import { ProductCategory } from '../types';

/** Shared query key so Home, Footer, and other views reuse one cache. */
export const PRODUCT_CATEGORIES_QUERY_KEY = 'productCategories';

export function rootCategoriesFromList(list: ProductCategory[] | undefined): ProductCategory[] {
  if (!list?.length) return [];
  return list
    .filter((c) => c.parent == null)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Oxford-comma sentence from category names (for hero, footer, meta-style copy). */
export function formatCategoryNamesSentence(categories: ProductCategory[]): string {
  const names = categories.map((c) => c.name.trim()).filter(Boolean);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

const PROMO_STYLE_CYCLE = [
  { bg: 'bg-sky-500', accent: 'text-sky-50' },
  { bg: 'bg-teal-600', accent: 'text-teal-50' },
  { bg: 'bg-amber-400', accent: 'text-amber-950' },
  { bg: 'bg-slate-500', accent: 'text-slate-100' },
] as const;

export function promoStyleForIndex(i: number) {
  return PROMO_STYLE_CYCLE[i % PROMO_STYLE_CYCLE.length];
}

export function useRootCategories(staleTime = 60_000) {
  const { data: all, isLoading, isError, error } = useQuery<ProductCategory[]>(
    PRODUCT_CATEGORIES_QUERY_KEY,
    () => productsAPI.getCategories().then((res) => res.data),
    { staleTime }
  );

  const roots = useMemo(() => rootCategoriesFromList(all), [all]);
  const catalogSentence = useMemo(() => formatCategoryNamesSentence(roots), [roots]);

  return {
    roots,
    allCategories: all ?? [],
    catalogSentence,
    isLoading,
    isError,
    error,
  };
}
