import { User } from '../types';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Check if a JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const isExpired = payload.exp < currentTime;
    console.log('🕐 Token expiry check:', { 
      tokenExp: payload.exp, 
      currentTime, 
      isExpired,
      timeUntilExpiry: payload.exp - currentTime
    });
    return isExpired;
  } catch (error) {
    console.error('❌ Error checking token expiry:', error);
    return true;
  }
};

// Decode user information from JWT token
export const getUserFromToken = (token: string): Partial<User> | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔍 JWT payload:', payload);
    
    const userData = {
      id: payload.user_id,
      email: payload.email,
      first_name: payload.first_name || '',
      last_name: payload.last_name || '',
      phone_number: payload.phone_number || '',
      is_active: true,
      date_joined: payload.date_joined || new Date().toISOString(),
    };
    
    console.log('👤 Extracted user data:', userData);
    return userData;
  } catch (error) {
    console.error('❌ Failed to decode token:', error);
    return null;
  }
};

// Get tokens from localStorage
export const getTokens = () => {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  return { accessToken, refreshToken };
};

// Set tokens in localStorage
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
};

// Clear all tokens from localStorage
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
};

// Check if user is authenticated (has valid tokens)
export const isAuthenticated = (): boolean => {
  const { accessToken, refreshToken } = getTokens();
  return !!(accessToken && refreshToken);
};

// Get the current user from stored token
export const getCurrentUser = (): Partial<User> | null => {
  const { accessToken } = getTokens();
  if (!accessToken) return null;
  
  return getUserFromToken(accessToken);
};

// Check if tokens need refresh
export const needsTokenRefresh = (): boolean => {
  const { accessToken, refreshToken } = getTokens();
  if (!accessToken || !refreshToken) {
    console.log('❌ No tokens available for refresh check');
    return false;
  }
  
  const accessExpired = isTokenExpired(accessToken);
  const refreshExpired = isTokenExpired(refreshToken);
  const needsRefresh = accessExpired && !refreshExpired;
  
  console.log('🔄 Token refresh check:', { 
    accessExpired, 
    refreshExpired, 
    needsRefresh 
  });
  
  return needsRefresh;
}; 