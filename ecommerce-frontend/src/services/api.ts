import axios from 'axios';
import { LoginData, RegisterData, Address, CheckoutData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginData) => api.post('/api/user/login/', data),
  register: (data: RegisterData) => api.post('/api/user/register/', data),
  logout: () => api.post('/logout/'),
  getProfile: () => api.get('/api/user/'),
  updateProfile: (data: any) => api.put('/api/user/profile/', data),
  resetPassword: (email: string) => api.post('/password/reset/', { email }),
  changePassword: (data: any) => api.post('/password/change/', data),
  verifyPhone: (data: any) => api.post('/api/user/verify-phone/', data),
  sendSMS: (data: any) => api.post('/api/user/send-sms/', data),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) => api.get('/api/products/', { params }),
  getProduct: (id: number) => api.get(`/api/products/${id}/`),
  createProduct: (data: FormData) => api.post('/api/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id: number, data: FormData) => api.put(`/api/products/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id: number) => api.delete(`/api/products/${id}/`),
  getCategories: () => api.get('/api/products/categories/'),
};

// Orders API
export const ordersAPI = {
  getOrders: () => api.get('/api/user/orders/'),
  getOrder: (id: number) => api.get(`/api/user/orders/${id}/`),
  createOrder: (data: any) => api.post('/api/user/orders/', data),
  updateOrder: (id: number, data: any) => api.put(`/api/user/orders/${id}/`, data),
  deleteOrder: (id: number) => api.delete(`/api/user/orders/${id}/`),
  
  // Order Items
  getOrderItems: (orderId: number) => api.get(`/api/user/orders/${orderId}/order-items/`),
  addOrderItem: (orderId: number, data: any) => api.post(`/api/user/orders/${orderId}/order-items/`, data),
  updateOrderItem: (orderId: number, itemId: number, data: any) => 
    api.put(`/api/user/orders/${orderId}/order-items/${itemId}/`, data),
  deleteOrderItem: (orderId: number, itemId: number) => 
    api.delete(`/api/user/orders/${orderId}/order-items/${itemId}/`),
};

// Payment API
export const paymentsAPI = {
  getPayments: () => api.get('/api/user/payments/'),
  checkout: (orderId: number, data: CheckoutData) => api.put(`/api/user/payments/checkout/${orderId}/`, data),
  createStripeCheckout: (orderId: number) => api.post(`/api/user/payments/stripe/create-checkout-session/${orderId}/`),
};

// Address API
export const addressAPI = {
  getAddresses: () => api.get('/api/user/profile/address/'),
  getAddress: (id: number) => api.get(`/api/user/profile/address/${id}/`),
  createAddress: (data: Partial<Address>) => api.post('/api/user/profile/address/', data),
  updateAddress: (id: number, data: Partial<Address>) => api.put(`/api/user/profile/address/${id}/`, data),
  deleteAddress: (id: number) => api.delete(`/api/user/profile/address/${id}/`),
};

export default api; 