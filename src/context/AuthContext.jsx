import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userData = ApiService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // COMMENTED OUT (API CALL)
      // const response = await ApiService.login(credentials.email, credentials.password);
      
      // Mock successful login response
      const response = {
        success: true,
        user: {
          id: 'mock-user-123',
          email: credentials.email,
          name: 'Mock User',
          role: 'user'
        },
        token: 'mock-jwt-token-123456789'
      };
      
      if (response.success) {
        ApiService.setUserData(response);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // COMMENTED OUT (API CALL)
      // const response = await ApiService.register(userData);
      
      // Mock successful registration response
      const response = {
        success: true,
        user: {
          id: 'mock-user-' + Math.floor(Math.random() * 1000),
          email: userData.email,
          name: userData.name || 'New User',
          role: 'user'
        },
        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
      };
      
      if (response.success) {
        ApiService.setUserData(response);
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async (navigate = null) => {
    try {
      // Always clear user state first to prevent any UI glitches
      setUser(null);
      
      // COMMENTED OUT (API CALL)
      // Call API logout (don't await to prevent delays)
      ApiService.logout();
      
      console.log('✅ AuthContext: User logged out successfully');
      
    } catch (error) {
      console.error('❌ AuthContext logout error:', error);
      // Even if API call fails, user state is already cleared
    } finally {
      // Simple navigation - always go to home page
      if (navigate) {
        // Use replace to prevent back button issues
        navigate('/', { replace: true });
      } else {
        // Fallback to direct navigation if no navigate function
        window.location.href = '/';
      }
    }
  };

  const isAuthenticated = () => {
    return user !== null && ApiService.isAuthenticated();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
