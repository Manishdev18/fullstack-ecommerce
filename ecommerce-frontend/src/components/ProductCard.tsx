import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full">
          <img
            src={product.image || '/placeholder-image.png'}
            alt={product.name}
            className="w-full h-48 object-cover object-center group-hover:opacity-75"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.desc}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || isAdding || !isAuthenticated}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>
              {isAdding ? 'Adding...' : !isAuthenticated ? 'Login to Buy' : 'Add to Cart'}
            </span>
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Category: {product.category.name}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 