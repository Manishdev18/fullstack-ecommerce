import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginData, RegisterData } from '../types';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  getTokens, 
  setTokens, 
  clearTokens, 
  isTokenExpired, 
  getUserFromToken,
  needsTokenRefresh 
} from '../utils/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔧 Initializing authentication...');
      const { accessToken, refreshToken } = getTokens();
      
      if (!accessToken || !refreshToken) {
        console.log('❌ No tokens found, user not authenticated');
        setLoading(false);
        return;
      }

      console.log('🔍 Checking if token needs refresh...');
      const needsRefresh = needsTokenRefresh();
      
      if (needsRefresh) {
        console.log('🔄 Token needs refresh, attempting refresh...');
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'}/api/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Token refresh successful');
            setTokens(data.access, refreshToken);
            await loadUserProfile(data.access);
          } else {
            console.log('❌ Token refresh failed, trying to load user from stored token');
            const userData = getUserFromToken(accessToken);
            if (userData) {
              setUser(userData as User);
              console.log('✅ User loaded from token');
            } else {
              console.log('❌ Could not extract user from token, clearing tokens');
              clearTokens();
            }
          }
        } catch (error) {
          console.error('❌ Token refresh failed with error:', error);
          const userData = getUserFromToken(accessToken);
          if (userData) {
            setUser(userData as User);
            console.log('✅ User loaded from token (fallback)');
          }
        }
      } else if (accessToken && !isTokenExpired(accessToken)) {
        console.log('✅ Token is valid, loading user profile...');
        await loadUserProfile(accessToken);
      } else {
        console.log('❌ Token is expired and cannot be refreshed, clearing tokens');
        clearTokens();
      }

      setLoading(false);
      console.log('🏁 Authentication initialization complete');
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (token: string) => {
    console.log('👤 Loading user profile from API...');
    try {
      const response = await authAPI.getProfile();
      console.log('✅ User profile loaded successfully');
      setUser(response.data);
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      const userData = getUserFromToken(token);
      if (userData) {
        setUser(userData as User);
        console.log('✅ User loaded from token (profile load failed)');
      }
    }
  };

  const refreshUser = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      return;
    }

    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't logout on profile fetch failure
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      const { access, refresh, user } = response.data;
      
      setTokens(access, refresh);
      setUser(user);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data);
      toast.success('Registration successful! Please check your email for verification.');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle validation errors
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Check for field-specific errors
        if (errors.email) {
          toast.error(`Email: ${errors.email[0]}`);
        } else if (errors.phone_number) {
          toast.error(`Phone: ${errors.phone_number[0]}`);
        } else if (errors.password1) {
          toast.error(`Password: ${errors.password1[0]}`);
        } else if (errors.password2) {
          toast.error(`Password confirmation: ${errors.password2[0]}`);
        } else if (errors.first_name) {
          toast.error(`First name: ${errors.first_name[0]}`);
        } else if (errors.last_name) {
          toast.error(`Last name: ${errors.last_name[0]}`);
        } else if (errors.non_field_errors) {
          toast.error(errors.non_field_errors[0]);
        } else if (errors.detail) {
          toast.error(errors.detail);
        } else {
          toast.error('Registration failed. Please check your information and try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 