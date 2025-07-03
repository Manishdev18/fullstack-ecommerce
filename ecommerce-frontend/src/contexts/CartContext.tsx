import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { toast } from 'react-toastify';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= product.quantity) {
          toast.success(`Updated ${product.name} quantity in cart`);
          return prevItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          toast.error(`Only ${product.quantity} items available in stock`);
          return prevItems;
        }
      } else {
        // Add new item
        if (quantity <= product.quantity) {
          toast.success(`Added ${product.name} to cart`);
          return [...prevItems, { product, quantity }];
        } else {
          toast.error(`Only ${product.quantity} items available in stock`);
          return prevItems;
        }
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.product.id === productId);
      if (item) {
        toast.success(`Removed ${item.product.name} from cart`);
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId) {
          if (quantity <= item.product.quantity) {
            return { ...item, quantity };
          } else {
            toast.error(`Only ${item.product.quantity} items available in stock`);
            return item;
          }
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 