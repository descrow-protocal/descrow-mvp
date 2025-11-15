import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

export type UserType = 'buyer' | 'seller';

export interface User {
  id: string;
  email: string;
  name: string;
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

// Mock users for demonstration
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'buyer@test.com': {
    password: 'buyer123',
    user: {
      id: '1',
      email: 'buyer@test.com',
      name: 'John Buyer',
      userType: 'buyer',
    },
  },
  'seller@test.com': {
    password: 'seller123',
    user: {
      id: '2',
      email: 'seller@test.com',
      name: 'Jane Seller',
      userType: 'seller',
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for persisted user
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (email: string, password: string, userType: UserType): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[email];
    
    if (!mockUser || mockUser.password !== password) {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password',
      });
      return false;
    }

    if (mockUser.user.userType !== userType) {
      toast.error('Invalid user type', {
        description: `This account is registered as a ${mockUser.user.userType}`,
      });
      return false;
    }

    setUser(mockUser.user);
    localStorage.setItem('user', JSON.stringify(mockUser.user));
    
    toast.success('Welcome back!', {
      description: `Logged in as ${mockUser.user.name}`,
    });
    
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
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

