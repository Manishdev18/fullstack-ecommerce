import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER =
  'https://via.placeholder.com/400x300/F4EFE4/1B3D2F?text=';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const fallbackSrc = `${PLACEHOLDER}${encodeURIComponent(product.name)}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-piora-border bg-piora-cream shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-white">
          <img
            src={product.image || fallbackSrc}
            alt={product.name}
            className="h-full w-full object-cover object-center transition group-hover:opacity-95"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackSrc;
            }}
          />
        </div>
      </Link>

      <div className="border-t border-piora-border/60 p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-piora-ink transition group-hover:text-piora-leaf">
            {product.name}
          </h3>
          {product.local_name ? <p className="mt-0.5 text-sm text-piora-forest/75">{product.local_name}</p> : null}
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-piora-forest/80">{product.desc}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-baseline rounded-full bg-piora-amber/35 px-3 py-1 ring-1 ring-piora-amber/50">
              <span className="text-[10px] font-bold uppercase tracking-wide text-piora-ink/70">MRP</span>
              <span className="ml-1.5 font-display text-xl font-bold text-piora-ink">
                NPR {parseFloat(product.price).toFixed(2)}
              </span>
            </span>
            <p className="mt-1 text-xs text-piora-forest/65">
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || isAdding}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-piora-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-piora-leaf disabled:cursor-not-allowed disabled:bg-piora-border disabled:text-piora-ink/50"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>{isAdding ? 'Adding…' : 'Add to cart'}</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-piora-forest/55">Category: {product.category.name}</p>
      </div>
    </div>
  );
};

export default ProductCard;
