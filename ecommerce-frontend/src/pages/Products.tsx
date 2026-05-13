import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams, useLocation } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useRootCategories } from '../hooks/useRootCategories';
import { Seo } from '../seo/Seo';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [showFilters, setShowFilters] = useState(false);

  // Keep filters in sync when the query string changes without remount (e.g. /categories/2 → /products?category=2)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setSortBy(params.get('sort') || 'name');
  }, [location.search]);
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>(
    ['products', searchQuery, selectedCategory, sortBy],
    () => productsAPI.getProducts({
      search: searchQuery,
      category: selectedCategory,
      ordering: sortBy,
    }).then(res => res.data),
    {
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  const { allCategories: categories } = useRootCategories(60_000);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'name') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('name');
  };

  return (
    <div className="min-h-screen bg-piora-paper">
      <Seo
        title="Products"
        metaDescription="Browse the PiOra catalog: search products, filter by category, and sort results."
        canonicalPath="/products"
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-piora-ink sm:text-4xl">Products</h1>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-lg border border-piora-border bg-white px-4 py-2 pl-10 pr-4 text-piora-ink placeholder:text-piora-forest/40 focus:border-piora-leaf focus:outline-none focus:ring-2 focus:ring-piora-leaf/30"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-piora-forest/40" />
              </div>
            </form>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 rounded-lg border border-piora-border bg-white px-4 py-2 text-piora-ink hover:bg-piora-cream lg:hidden"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-lg border border-piora-border bg-white px-4 py-2 text-piora-ink focus:border-piora-leaf focus:outline-none focus:ring-2 focus:ring-piora-leaf/30"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price (Low to High)</option>
              <option value="-price">Sort by Price (High to Low)</option>
              <option value="-created_at">Sort by Newest</option>
              <option value="created_at">Sort by Oldest</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="rounded-2xl border border-piora-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-piora-ink">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-piora-leaf hover:text-piora-forest"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-piora-forest">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="mr-2 accent-piora-forest"
                    />
                    <span className="text-sm text-piora-ink">All Categories</span>
                  </label>
                  {categories?.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id.toString()}
                        checked={selectedCategory === category.id.toString()}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-2 accent-piora-forest"
                      />
                      <span className="text-sm text-piora-ink">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="mb-4 h-64 rounded-2xl bg-slate-200"></div>
                    <div className="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
                    <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {products && products.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-piora-forest/80">
                        Found {products.length} product{products.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-piora-border bg-white py-12 text-center">
                    <p className="text-lg text-piora-forest/80">No products found</p>
                    <p className="mt-2 text-piora-forest/60">Try adjusting your search or filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 