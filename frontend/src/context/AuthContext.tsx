import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Context interface
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const user = authService.getUser();

        if (token && user) {
          // Validate token by fetching user profile
          try {
            const response = await authService.getProfile();
            if (response.success && response.data) {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: response.data.user,
                  token
                }
              });
              return;
            }
          } catch (error) {
            // Token is invalid, clear storage
            authService.clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('AuthContext: Starting login process');
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(credentials);
      console.log('AuthContext: Login response received:', {
        success: response.success,
        hasData: !!response.data,
        responseKeys: response.data ? Object.keys(response.data) : [],
        hasTokenAtRoot: !!(response as any).token,
        tokenType: typeof (response as any).token,
        user: response.data?.user ? { id: response.data.user._id, email: response.data.user.email } : null
      });
      
      if (response.success) {
        // Backend sends: { success: true, token: "...", data: { user: {...} } }
        const token = (response as any).token;
        const user = response.data?.user;
        
        console.log('AuthContext: Login successful for user:', user?.email);
        console.log('AuthContext: Extracted token details:', {
          hasToken: !!token,
          tokenType: typeof token,
          tokenValue: token,
          tokenLength: token ? token.length : 0,
          hasUser: !!user
        });
        
        // Validate token and user before storing
        if (!token || typeof token !== 'string' || token === 'undefined') {
          console.error('AuthContext: Invalid token received:', token);
          throw new Error('Invalid token received from server');
        }
        
        if (!user) {
          console.error('AuthContext: Invalid user received:', user);
          throw new Error('Invalid user received from server');
        }
        
        // Store auth data synchronously
        authService.setAuthData(user, token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('AuthContext: Auth data stored in localStorage', {
          tokenStored: !!storedToken,
          userStored: !!localStorage.getItem('user'),
          tokenMatch: storedToken === token
        });
        
        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
        console.log('AuthContext: State updated with LOGIN_SUCCESS', {
          stateToken: !!token,
          stateUser: !!user
        });
        
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        console.error('AuthContext: Login response not successful:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    try {
      console.log('AuthContext: Starting registration process');
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.register(data);
      console.log('AuthContext: Register response received:', {
        success: response.success,
        hasData: !!response.data,
        responseKeys: response.data ? Object.keys(response.data) : [],
        hasTokenAtRoot: !!(response as any).token,
        tokenType: typeof (response as any).token,
        user: response.data?.user ? { id: response.data.user._id, email: response.data.user.email } : null
      });
      
      if (response.success) {
        // Backend sends: { success: true, token: "...", data: { user: {...} } }
        const token = (response as any).token;
        const user = response.data?.user;
        
        console.log('AuthContext: Registration successful for user:', user?.email);
        console.log('AuthContext: Extracted token details:', {
          hasToken: !!token,
          tokenType: typeof token,
          tokenValue: token,
          tokenLength: token ? token.length : 0,
          hasUser: !!user
        });
        
        // Validate token and user before storing
        if (!token || typeof token !== 'string' || token === 'undefined') {
          console.error('AuthContext: Invalid token received:', token);
          throw new Error('Invalid token received from server');
        }
        
        if (!user) {
          console.error('AuthContext: Invalid user received:', user);
          throw new Error('Invalid user received from server');
        }
        
        // Store auth data synchronously
        authService.setAuthData(user, token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('AuthContext: Auth data stored in localStorage', {
          tokenStored: !!storedToken,
          userStored: !!localStorage.getItem('user'),
          tokenMatch: storedToken === token
        });
        
        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
        
        toast.success(`Welcome to Smart Dine, ${user.name}!`);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (data: FormData): Promise<void> => {
    try {
      const response = await authService.updateProfile(data);
      
      if (response.success && response.data) {
        const { user } = response.data;
        
        // Update local storage
        const token = authService.getToken();
        if (token) {
          authService.setAuthData(user, token);
        }
        
        // Update state
        dispatch({
          type: 'UPDATE_USER',
          payload: user
        });
        
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await authService.changePassword({ currentPassword, newPassword });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Update stored auth data
        authService.setAuthData(user, token);
        
        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
        
        toast.success('Password changed successfully');
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success('Password reset instructions sent to your email');
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success && response.data) {
        const { user, token: newToken } = response.data;
        
        // Store auth data
        authService.setAuthData(user, newToken);
        
        // Update state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: newToken }
        });
        
        toast.success('Password reset successfully');
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
