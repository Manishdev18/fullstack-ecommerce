import axios from 'axios';
import { LoginData, RegisterData, Address, CheckoutData } from '../types';
import { getTokens, setTokens, clearTokens } from '../utils/auth';

/**
 * API Service Configuration
 * 
 * This file sets up two axios instances:
 * 1. `api` - For authenticated requests (sends Bearer token automatically)
 * 2. `publicApi` - For public requests (no authentication required)
 * 
 * Authentication Flow:
 * - Bearer tokens are automatically added to authenticated requests
 * - Token refresh is handled automatically when tokens expire
 * - Public endpoints (product listing, login, register) don't require authentication
 * - All cart, order, payment, and profile endpoints require authentication
 * 
 * Public APIs (no Bearer token):
 * - Product listing and details
 * - Product categories
 * - User login and registration
 * - Password reset
 * 
 * Authenticated APIs (Bearer token required):
 * - All cart operations (get, add, update, remove, clear)
 * - All order operations
 * - All payment operations
 * - User profile and address management
 * - Product creation/update/delete (admin/seller only)
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/';

// Authenticated API instance - sends Bearer token
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API instance - no authentication required
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for authenticated requests
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Add cache-busting parameter to prevent browser caching
    const timestamp = new Date().getTime();
    config.params = { ...config.params, _t: timestamp };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor for public API to add cache-busting
publicApi.interceptors.request.use(
  (config) => {
    // Add cache-busting parameter to prevent browser caching
    const timestamp = new Date().getTime();
    config.params = { ...config.params, _t: timestamp };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh for authenticated requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { refreshToken } = getTokens();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          setTokens(access, refreshToken);
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        // Only clear tokens if refresh token is also invalid
        if (refreshError.response?.status === 401) {
          clearTokens();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API - Requires authentication for most endpoints
export const authAPI = {
  login: (data: LoginData) => publicApi.post('/api/user/login/', data), // Public
  register: (data: RegisterData) => publicApi.post('/api/user/register/', data), // Public
  logout: () => api.post('/api/user/logout/'), // Authenticated
  getProfile: () => api.get('/api/user/'), // Authenticated
  updateProfile: (data: any) => api.put('/api/user/profile/', data), // Authenticated
  resetPassword: (email: string) => publicApi.post('/password/reset/', { email }), // Public
  changePassword: (data: any) => api.post('/password/change/', data), // Authenticated
  verifyPhone: (data: any) => api.post('/api/user/verify-phone/', data), // Authenticated
  sendSMS: (data: any) => api.post('/api/user/send-sms/', data), // Authenticated
};

// Products API - Public access, no authentication required
export const productsAPI = {
  getProducts: (params?: any) => publicApi.get('/api/products/', { params }), // Public
  getProduct: (id: number) => publicApi.get(`/api/products/${id}/`), // Public
  createProduct: (data: FormData) => api.post('/api/products/', data, { // Authenticated
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id: number, data: FormData) => api.put(`/api/products/${id}/`, data, { // Authenticated
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id: number) => api.delete(`/api/products/${id}/`), // Authenticated
  getCategories: () => publicApi.get('/api/products/categories/'), // Public
};

// Cart API - All endpoints require authentication
export const cartAPI = {
  getCart: () => api.get('/api/products/cart/me/'), // Authenticated
  addToCart: (productId: number, quantity: number = 1) => // Authenticated
    api.post('/api/products/cart/add_item/', { product_id: productId, quantity }),
  updateCartItem: (itemId: number, quantity: number) => // Authenticated
    api.patch('/api/products/cart/update_item/', { item_id: itemId, quantity }),
  removeFromCart: (itemId: number) => // Authenticated
    api.delete('/api/products/cart/remove_item/', { data: { item_id: itemId } }),
  clearCart: () => api.delete('/api/products/cart/clear/'), // Authenticated
};

// Orders API - All endpoints require authentication
export const ordersAPI = {
  getOrders: () => api.get('/api/user/orders/'), // Authenticated
  getOrder: (id: number) => api.get(`/api/user/orders/${id}/`), // Authenticated
  createOrder: (data: any) => api.post('/api/user/orders/', data), // Authenticated
  updateOrder: (id: number, data: any) => api.put(`/api/user/orders/${id}/`, data), // Authenticated
  deleteOrder: (id: number) => api.delete(`/api/user/orders/${id}/`), // Authenticated
  
  // Order Items - All require authentication
  getOrderItems: (orderId: number) => api.get(`/api/user/orders/${orderId}/order-items/`), // Authenticated
  addOrderItem: (orderId: number, data: any) => api.post(`/api/user/orders/${orderId}/order-items/`, data), // Authenticated
  updateOrderItem: (orderId: number, itemId: number, data: any) => // Authenticated
    api.put(`/api/user/orders/${orderId}/order-items/${itemId}/`, data),
  deleteOrderItem: (orderId: number, itemId: number) => // Authenticated
    api.delete(`/api/user/orders/${orderId}/order-items/${itemId}/`),
};

// Payment API - All endpoints require authentication
export const paymentsAPI = {
  getPayments: () => api.get('/api/user/payments/'), // Authenticated
  checkout: (orderId: number, data: CheckoutData) => api.put(`/api/user/payments/checkout/${orderId}/`, data), // Authenticated
  createStripeCheckout: (orderId: number) => api.post(`/api/user/payments/stripe/create-checkout-session/${orderId}/`), // Authenticated
};

// Address API - All endpoints require authentication
export const addressAPI = {
  getAddresses: () => api.get('/api/user/profile/address/'), // Authenticated
  getAddress: (id: number) => api.get(`/api/user/profile/address/${id}/`), // Authenticated
  createAddress: (data: Partial<Address>) => api.post('/api/user/profile/address/', data), // Authenticated
  updateAddress: (id: number, data: Partial<Address>) => api.put(`/api/user/profile/address/${id}/`, data), // Authenticated
  deleteAddress: (id: number) => api.delete(`/api/user/profile/address/${id}/`), // Authenticated
};

export default api; 