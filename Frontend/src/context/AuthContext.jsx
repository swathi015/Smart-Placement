import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify & fetch fresh profile from database
          const freshProfile = await authAPI.getProfile();
          setUser(freshProfile);
          localStorage.setItem('user', JSON.stringify(freshProfile));
        } catch (error) {
          console.error('Session validation failed:', error.message);
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authAPI.login(credentials);
      
      // Store token and initial user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setIsAuthenticated(true);
      
      // Fetch full profile info with student/company associations
      const fullProfile = await authAPI.getProfile();
      setUser(fullProfile);
      localStorage.setItem('user', JSON.stringify(fullProfile));
      
      return fullProfile;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authAPI.register(userData);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setIsAuthenticated(true);
      
      // Sync fresh profile details
      const fullProfile = await authAPI.getProfile();
      setUser(fullProfile);
      localStorage.setItem('user', JSON.stringify(fullProfile));
      
      return fullProfile;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    try {
      const refreshedData = await authAPI.getProfile();
      setUser(refreshedData);
      localStorage.setItem('user', JSON.stringify(refreshedData));
      return refreshedData;
    } catch (error) {
      console.error('Failed to refresh user profile:', error.message);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProfile,
    hasRole: (roles) => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
