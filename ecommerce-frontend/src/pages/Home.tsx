import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI, resolveApiMediaUrl } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useRootCategories, promoStyleForIndex } from '../hooks/useRootCategories';
import { Seo } from '../seo/Seo';
import { JsonLd } from '../seo/JsonLd';
import { DEFAULT_PAGE_DESCRIPTION, getSiteUrl } from '../seo/site';
import { organizationJsonLd, websiteJsonLd } from '../seo/structuredData';

const Home: React.FC = () => {
  const { roots, catalogSentence, isLoading: categoriesLoading } = useRootCategories(60_000);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>(
    'homeProducts',
    () => productsAPI.getProducts({}).then((res) => res.data),
    { staleTime: 60_000 }
  );

  const heroSubline =
    catalogSentence.length > 0
      ? `We specialize in ${catalogSentence}. Sourced with care, packed with clarity.`
      : 'Add root categories in the admin catalog to drive this page from your live data.';

  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-piora-paper">
      <Seo title="Home" metaDescription={DEFAULT_PAGE_DESCRIPTION} canonicalPath="/" />
      {siteUrl ? (
        <>
          <JsonLd data={organizationJsonLd(siteUrl)} />
          <JsonLd data={websiteJsonLd(siteUrl)} />
        </>
      ) : null}
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-piora-forest via-piora-leaf to-piora-forest">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(232,180,77,0.25), transparent 40%)',
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 lg:flex-row lg:items-center lg:gap-12 lg:py-16">
          <div className="max-w-xl text-white lg:flex-1">
            <p className="font-accent mb-3 text-lg text-amber-200/95 sm:text-xl">PiOra</p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Hill-grown dry goods &amp; herbs
            </h1>
            <p className="mt-4 text-lg text-white/90 sm:text-xl">{heroSubline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-base font-semibold text-piora-ink shadow-lg transition hover:bg-piora-cream"
              >
                Shop now
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Browse categories
              </Link>
            </div>
          </div>
          <div className="relative flex flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-black/20 shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <img
                src={`${process.env.PUBLIC_URL ?? ''}/piora/hero-reference.png`}
                alt={catalogSentence ? `PiOra — ${catalogSentence}` : 'PiOra catalog'}
                className="h-auto w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-piora-forest/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Promo row — one card per root category from API */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        {categoriesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-h-[220px] animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : roots.length === 0 ? (
          <p className="rounded-2xl border border-piora-border bg-white px-4 py-6 text-center text-piora-forest/80">
            Category highlights will appear here when root categories exist in the API.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roots.map((cat, index) => {
              const { bg, accent } = promoStyleForIndex(index);
              return (
                <div
                  key={cat.id}
                  className={`${bg} ${accent} flex min-h-[220px] flex-col rounded-2xl p-5 shadow-md`}
                >
                  <h2 className="text-lg font-bold leading-snug">{cat.name}</h2>
                  <p className="mt-2 text-sm opacity-95">
                    Everything we list under this category — browse packs, sizes, and availability.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm opacity-90">
                    <li className="flex items-center gap-2">
                      <span className="text-base leading-none">✓</span>
                      <span>Live from your catalog</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-base leading-none">✓</span>
                      <span>Clear pricing on shelf</span>
                    </li>
                  </ul>
                  <Link
                    to={`/categories/${cat.id}`}
                    className="mt-auto inline-flex w-fit items-center rounded-xl bg-piora-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Shop category
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Category strip */}
      <section id="categories" className="border-y border-piora-border/60 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold text-piora-ink sm:text-3xl">Shop by category</h2>
              <p className="mt-1 text-piora-forest/80">Tap a category to browse that range.</p>
            </div>
            <Link
              to="/categories"
              className="text-sm font-semibold text-piora-leaf underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : roots.length === 0 ? (
            <p className="text-center text-piora-forest/70">Categories will appear here once they are added.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {roots.map((cat) => {
                const iconUrl = resolveApiMediaUrl(cat.icon);
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.id}`}
                    className="group flex flex-col items-center gap-2 text-center"
                  >
                    <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-[#e8eef6] p-2 shadow-sm ring-1 ring-slate-200/80 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-display text-2xl font-bold text-piora-forest/70">
                          {cat.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <span className="line-clamp-2 text-xs font-medium text-piora-ink sm:text-sm">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Product grid */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-piora-ink sm:text-3xl">Curated picks</h2>
            <p className="mt-1 text-piora-forest/80">From our catalog — updated as new lots arrive.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-xl bg-piora-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-piora-leaf"
          >
            View all products
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-piora-border bg-white p-4">
                <div className="mb-4 h-48 rounded-xl bg-slate-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(products ?? []).slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!productsLoading && (!products || products.length === 0) && (
          <p className="text-center text-piora-forest/70">No products yet — check back soon.</p>
        )}
      </section>
    </div>
  );
};

export default Home;
