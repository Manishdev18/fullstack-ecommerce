import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { Product, ProductCategory } from '../types';
import ProductCard from '../components/ProductCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>(
    ['products', searchQuery, selectedCategory, sortBy],
    () => productsAPI.getProducts({
      search: searchQuery,
      category: selectedCategory,
      ordering: sortBy,
    }).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: categories } = useQuery<ProductCategory[]>(
    'categories',
    () => productsAPI.getCategories().then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories?.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id.toString()}
                        checked={selectedCategory === category.id.toString()}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
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
                    <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                    <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
                    <div className="bg-gray-200 rounded h-4 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {products && products.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-gray-600">
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
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found</p>
                    <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
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