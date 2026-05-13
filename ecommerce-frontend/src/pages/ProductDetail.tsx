import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI, resolveApiMediaUrl } from '../services/api';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Seo } from '../seo/Seo';
import { JsonLd } from '../seo/JsonLd';
import { DEFAULT_OG_IMAGE_PATH, DEFAULT_PAGE_DESCRIPTION, getSiteUrl } from '../seo/site';
import { productJsonLd } from '../seo/structuredData';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : NaN;
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const { data: product, isLoading, isError } = useQuery<Product>(
    ['product', productId],
    () => productsAPI.getProduct(productId).then((res) => res.data as Product),
    { enabled: Number.isFinite(productId) }
  );

  const handleAddToCart = async () => {
    if (!product || product.quantity === 0) return;
    setIsAdding(true);
    try {
      await addToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  if (!Number.isFinite(productId)) {
    return (
      <div className="min-h-screen bg-piora-paper px-4 py-16 text-center text-piora-forest/80">
        <Seo title="Product" noindex />
        Invalid product.
        <Link to="/products" className="mt-4 block text-piora-leaf underline">
          Back to products
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-piora-paper px-4 py-16">
        <Seo title="Product" canonicalPath={`/products/${productId}`} />
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-slate-200" />
            <div className="space-y-4">
              <div className="h-6 w-full rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-piora-paper px-4 py-16 text-center">
        <Seo title="Product not found" noindex canonicalPath={`/products/${productId}`} />
        <p className="text-piora-forest/80">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-piora-leaf underline">
          Back to products
        </Link>
      </div>
    );
  }

  const siteUrl = getSiteUrl();
  const imageAbs = resolveApiMediaUrl(product.image);
  const metaDesc = (product.desc?.trim() ? product.desc : DEFAULT_PAGE_DESCRIPTION).slice(0, 320);
  const ogImage = imageAbs || DEFAULT_OG_IMAGE_PATH;

  return (
    <div className="min-h-screen bg-piora-paper">
      <Seo
        title={product.name}
        metaDescription={metaDesc}
        canonicalPath={`/products/${product.id}`}
        ogType="product"
        ogImagePathOrUrl={ogImage}
      />
      {siteUrl ? (
        <JsonLd
          data={productJsonLd(siteUrl, {
            id: product.id,
            name: product.name,
            desc: product.desc,
            price: product.price,
            imageAbsolute: imageAbs,
            quantity: product.quantity,
          })}
        />
      ) : null}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-piora-forest/70">
          <Link to="/" className="hover:text-piora-leaf">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-piora-leaf">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-piora-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 rounded-2xl border border-piora-border bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">
          <div className="overflow-hidden rounded-2xl bg-piora-cream ring-1 ring-piora-border">
            {product.image ? (
              <img
                src={imageAbs || product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-piora-forest/40">No image</div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-piora-leaf">{product.category.name}</p>
            <h1 className="font-display mt-2 text-3xl font-bold text-piora-ink sm:text-4xl">{product.name}</h1>
            {product.local_name ? (
              <p className="mt-1 text-lg text-piora-forest/80">{product.local_name}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <span className="inline-flex items-baseline rounded-full bg-piora-amber/25 px-4 py-2 ring-1 ring-piora-amber/40">
                <span className="text-xs font-semibold uppercase text-piora-ink/80">MRP</span>
                <span className="ml-2 font-display text-3xl font-bold text-piora-ink">
                  NPR {parseFloat(product.price).toFixed(2)}
                </span>
              </span>
              <span className="text-sm text-piora-forest/70">
                {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {product.desc ? (
              <p className="mt-6 leading-relaxed text-piora-ink/90">{product.desc}</p>
            ) : (
              <p className="mt-6 text-piora-forest/60">No description yet.</p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.quantity === 0 || isAdding}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-piora-forest px-8 py-3 text-base font-semibold text-white shadow transition hover:bg-piora-leaf disabled:cursor-not-allowed disabled:bg-piora-border disabled:text-piora-ink/50"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {isAdding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
