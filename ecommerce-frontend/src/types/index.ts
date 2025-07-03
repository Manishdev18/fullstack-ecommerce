export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  date_joined: string;
}

export interface Profile {
  id: number;
  user: User;
  avatar?: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  user: number;
  address_type: 'B' | 'S'; // Billing or Shipping
  default: boolean;
  country: string;
  city: string;
  street_address: string;
  apartment_address: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  seller: number;
  category: ProductCategory;
  name: string;
  desc: string;
  image?: string;
  price: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: Product;
  quantity: number;
  price: string;
  cost: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  buyer: string;
  status: 'P' | 'C'; // Pending or Completed
  shipping_address?: Address;
  billing_address?: Address;
  order_items: OrderItem[];
  total_cost: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  status: 'P' | 'C' | 'F'; // Pending, Completed, Failed
  payment_option: 'P' | 'S'; // PayPal or Stripe
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  password: string;
  password_confirm: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutData {
  shipping_address?: Address;
  billing_address?: Address;
  payment_option: 'P' | 'S';
} 