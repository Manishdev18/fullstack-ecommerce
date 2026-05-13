import React from 'react';
import { Link } from 'react-router-dom';
import { useRootCategories } from '../hooks/useRootCategories';
import { resolveApiMediaUrl } from '../services/api';
import { Seo } from '../seo/Seo';

const Categories: React.FC = () => {
  const { roots, isLoading } = useRootCategories(60_000);

  return (
    <div className="min-h-screen bg-piora-paper">
      <Seo
        title="Categories"
        metaDescription="Browse PiOra product categories — dry fruits, seeds, superfoods, and Himalayan herbs."
        canonicalPath="/categories"
      />
      <div className="border-b border-piora-border/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-piora-ink sm:text-4xl">Categories</h1>
          <p className="mt-2 text-piora-forest/80">Choose a category to see everything we list there.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : roots.length === 0 ? (
          <p className="text-center text-piora-forest/70">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {roots.map((cat) => {
              const iconUrl = resolveApiMediaUrl(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.id}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-piora-border bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex aspect-square w-full max-w-[140px] items-center justify-center rounded-2xl bg-[#e8eef6] p-3 ring-1 ring-slate-200/80">
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
                      <span className="font-display text-3xl font-bold text-piora-forest/70">
                        {cat.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <span className="line-clamp-2 text-sm font-semibold text-piora-ink">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
