'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authController } from '@/controllers/authController';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUserId = localStorage.getItem('userId');
        const storedUserName = localStorage.getItem('userName');
        const storedUserRole = localStorage.getItem('userRole');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';

        if (storedToken && isAuth && storedUserId) {
          setToken(storedToken);
          
          // Try to get fresh user data from API
          try {
            const userData = await authController.getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Failed to get current user:', error);
            // Fallback to stored user data if API call fails
            if (storedUserName && storedUserRole) {
              setUser({
                id: storedUserId,
                name: storedUserName,
                email: storedUserName, // Fallback if no email stored
                role: storedUserRole,
              });
            } else {
              // Clear invalid auth state
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes from other tabs/windows
    const handleAuthChange = () => {
      initializeAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authController.login(email, password);
      
      // Store auth data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name || data.user.email);
      localStorage.setItem('authToken', data.access_token);
      
      // Update state
      setToken(data.access_token);
      setUser(data.user);
      
      // Trigger auth change event
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    
    // Clear state
    setUser(null);
    setToken(null);
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const userData = await authController.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}