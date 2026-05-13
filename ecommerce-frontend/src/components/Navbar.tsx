import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount, refreshCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      refreshCart();
    }
  };

  const cartCount = getCartCount();

  return (
    <nav className="sticky top-0 z-50 border-b border-piora-border/80 bg-piora-cream shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-piora-forest hover:text-piora-leaf">
              <span>🌾</span>
              <span className="font-display tracking-tight">PiOra</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
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
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-piora-forest transition-colors hover:text-piora-leaf">
              Home
            </Link>
            <Link to="/products" className="text-piora-forest transition-colors hover:text-piora-leaf">
              Products
            </Link>
            <Link to="/categories" className="text-piora-forest transition-colors hover:text-piora-leaf">
              Categories
            </Link>
            
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative text-piora-forest transition-colors hover:text-piora-leaf"
              onClick={handleCartClick}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 text-piora-forest transition-colors hover:text-piora-leaf"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="text-sm">{user?.first_name || 'User'}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-piora-border bg-white py-1 shadow-lg">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-piora-ink hover:bg-piora-cream"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-piora-ink hover:bg-piora-cream"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      to="/my-products"
                      className="block px-4 py-2 text-sm text-piora-ink hover:bg-piora-cream"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Products
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-piora-ink hover:bg-piora-cream"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-piora-forest transition-colors hover:text-piora-leaf"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-piora-forest px-4 py-2 text-white transition-colors hover:bg-piora-leaf"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-piora-forest hover:text-piora-leaf"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
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

              <Link
                to="/"
                className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/cart"
                className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleCartClick();
                }}
              >
                Cart ({cartCount})
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/my-products"
                    className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Products
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-left text-piora-forest hover:text-piora-leaf"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-piora-forest hover:text-piora-leaf"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 