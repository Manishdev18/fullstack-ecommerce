import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, Cart } from '../types';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setLoading(true);
    try {
      const response = await cartAPI.addToCart(product.id, quantity);
      setCart(response.data);
      toast.success(`Added ${product.name} to cart`);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add item to cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage cart');
      return;
    }

    setLoading(true);
    try {
      const response = await cartAPI.removeFromCart(itemId);
      setCart(response.data);
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove item from cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage cart');
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    setLoading(true);
    try {
      const response = await cartAPI.updateCartItem(itemId, quantity);
      setCart(response.data);
      toast.success('Cart updated');
    } catch (error: any) {
      console.error('Failed to update cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update cart item';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage cart');
      return;
    }

    setLoading(true);
    try {
      const response = await cartAPI.clearCart();
      setCart(response.data);
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to clear cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart?.total_cost || 0;
  };

  const getCartCount = () => {
    return cart?.total_items || 0;
  };

  // Get cart items for backward compatibility
  const cartItems = cart?.cart_items || [];

  const value = {
    cart,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 