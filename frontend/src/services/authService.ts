import api from './api';
import { LoginCredentials, RegisterData, User, ApiResponse } from '../types';

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user  
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User }> & { token?: string }> => {
    const response = await api.post('/auth/login', credentials);
    console.log('AuthService: Raw login response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      hasToken: !!response.data?.token,
      tokenValue: response.data?.token,
      tokenType: typeof response.data?.token
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: FormData): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // Check for valid token and user
    const hasValidToken = token && token !== 'undefined' && token !== 'null';
    const hasValidUser = user && user !== 'undefined' && user !== 'null';
    
    // Clean up invalid data
    if (!hasValidToken || !hasValidUser) {
      if (token === 'undefined' || token === 'null' || user === 'undefined' || user === 'null') {
        console.log('AuthService: Cleaning up invalid auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return false;
    }
    
    return true;
  },

  // Get stored token
  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    console.log('AuthService: getToken called:', {
      hasToken: !!token,
      tokenType: typeof token,
      tokenValue: token,
      tokenLength: token ? token.length : 0
    });
    
    // Return null for invalid tokens
    if (!token || token === 'undefined' || token === 'null') {
      if (token === 'undefined' || token === 'null') {
        console.log('AuthService: Cleaning up invalid token from localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return null;
    }
    
    return token;
  },

  // Get stored user
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Store auth data
  setAuthData: (user: User, token: string): void => {
    console.log('AuthService: setAuthData called with:', {
      hasUser: !!user,
      userName: user?.name,
      hasToken: !!token,
      tokenType: typeof token,
      tokenValue: token,
      tokenLength: token ? token.length : 0
    });
    
    // Validate inputs before storing
    if (!token || token === 'undefined' || token === 'null' || typeof token !== 'string') {
      console.error('AuthService: Invalid token provided to setAuthData:', token);
      throw new Error('Invalid token provided');
    }
    
    if (!user || typeof user !== 'object') {
      console.error('AuthService: Invalid user provided to setAuthData:', user);
      throw new Error('Invalid user provided');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Verify storage
    const storedToken = localStorage.getItem('token');
    console.log('AuthService: Token stored verification:', {
      storedSuccessfully: storedToken === token,
      storedValue: storedToken,
      storedType: typeof storedToken
    });
  },

  // Clear auth data
  clearAuthData: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};