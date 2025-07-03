import React from 'react';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const { cartItems, getCartTotal, getCartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              {getCartCount()} item{getCartCount() !== 1 ? 's' : ''} in cart
            </p>
            <p className="text-2xl font-bold text-gray-900">
              Total: ${getCartTotal().toFixed(2)}
            </p>
            <div className="mt-8 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: ${item.product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 