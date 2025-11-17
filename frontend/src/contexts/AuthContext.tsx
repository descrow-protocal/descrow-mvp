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
  userType: UserType;
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
      // Mock authentication for demo
      const mockUsers = {
        'buyer@test.com': { id: '1', email: 'buyer@test.com', name: 'Demo Buyer', role: 'buyer' as UserType, userType: 'buyer' as UserType },
        'seller@test.com': { id: '2', email: 'seller@test.com', name: 'Demo Seller', role: 'seller' as UserType, userType: 'seller' as UserType }
      };
      
      const mockPasswords = {
        'buyer@test.com': 'buyer123',
        'seller@test.com': 'seller123'
      };
      
      if (mockUsers[email as keyof typeof mockUsers] && mockPasswords[email as keyof typeof mockPasswords] === password) {
        const user = mockUsers[email as keyof typeof mockUsers];
        const token = 'mock-token-' + Date.now();
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        toast.success('Welcome back!', {
          description: `Logged in as ${userType}`,
        });
        
        return true;
      } else {
        throw new Error('Invalid credentials');
      }
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
