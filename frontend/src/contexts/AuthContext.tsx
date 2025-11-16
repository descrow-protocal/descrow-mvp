import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export type UserType = 'buyer' | 'seller';

export interface User {
  id: string;
  account_id?: string;
  email?: string;
  name?: string;
  role: UserType;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (email: string, password: string, userType: UserType): Promise<boolean> => {
    try {
      const { user, token } = await api.auth.login(email, password, userType);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Welcome back!', {
        description: `Logged in as ${userType}`,
      });
      
      return true;
    } catch (error: any) {
      toast.error('Login failed', { description: error.message });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    toast.info('Logged out successfully');
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
    toast.success('Profile updated successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
