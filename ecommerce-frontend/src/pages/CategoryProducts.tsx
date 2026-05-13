import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI, resolveApiMediaUrl } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useRootCategories } from '../hooks/useRootCategories';
import { Seo } from '../seo/Seo';
import { DEFAULT_PAGE_DESCRIPTION } from '../seo/site';

const CategoryProducts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? parseInt(id, 10) : NaN;
  const validId = Number.isFinite(categoryId);

  const { allCategories } = useRootCategories(60_000);
  const category = validId ? allCategories.find((c) => c.id === categoryId) : undefined;

  const { data: products, isLoading } = useQuery<Product[]>(
    ['categoryProducts', categoryId],
    () => productsAPI.getProducts({ category: categoryId }).then((res) => res.data),
    { enabled: validId }
  );

  if (!validId) {
    return (
      <div className="min-h-screen bg-piora-paper px-4 py-16 text-center">
        <Seo title="Category" noindex />
        <p className="text-piora-forest/80">Invalid category.</p>
        <Link to="/categories" className="mt-4 inline-block text-piora-leaf underline">
          All categories
        </Link>
      </div>
    );
  }

  const title = category?.name ?? `Category ${categoryId}`;
  const iconUrl = resolveApiMediaUrl(category?.icon);
  const metaDesc = category?.name
    ? `Shop ${category.name} at PiOra — premium dry goods, seeds, and Himalayan herbs.`
    : DEFAULT_PAGE_DESCRIPTION;

  return (
    <div className="min-h-screen bg-piora-paper">
      <Seo title={title} metaDescription={metaDesc} canonicalPath={`/categories/${categoryId}`} />
      <div className="border-b border-piora-border/70 bg-gradient-to-r from-piora-cream to-piora-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-4 text-sm text-piora-forest/70">
            <Link to="/" className="hover:text-piora-leaf">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/categories" className="hover:text-piora-leaf">
              Categories
            </Link>
            <span className="mx-2">/</span>
            <span className="text-piora-ink">{title}</span>
          </nav>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {iconUrl ? (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-piora-border">
                <img src={iconUrl} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-piora-forest/10 font-display text-3xl font-bold text-piora-forest">
                {title.slice(0, 1)}
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-bold text-piora-ink sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-piora-forest/80">
                Everything we stock in this category. Use filters on the main catalog for search and sort.
              </p>
              <Link
                to={`/products?category=${categoryId}`}
                className="mt-4 inline-flex text-sm font-semibold text-piora-leaf underline-offset-4 hover:underline"
              >
                Open in products view
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-piora-border bg-white p-4">
                <div className="mb-4 h-48 rounded-xl bg-slate-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-piora-border bg-white py-16 text-center">
            <p className="text-lg text-piora-forest/80">No products in this category yet.</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-xl bg-piora-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-piora-leaf"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
