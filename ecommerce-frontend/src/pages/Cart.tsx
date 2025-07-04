import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, getCartTotal, getCartCount, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleRemoveFromCart = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
            <p className="text-gray-500 text-lg mb-6">Please login to view your cart</p>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading cart...</p>
          </div>
        )}
        
        {!loading && cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          !loading && (
            <div>
              <p className="text-gray-600 mb-4">
                {getCartCount()} item{getCartCount() !== 1 ? 's' : ''} in cart
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-8">
                Total: ${getCartTotal().toFixed(2)}
              </p>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">Price: ${item.product.price}</p>
                        <p className="text-gray-800 font-medium">Total: ${item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 ml-4"
                    >
                      {loading ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between items-center">
                <Link
                  to="/products"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/checkout"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Place Order
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Cart; 