import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from './api';
import { useToast } from '../components/ui/Toast';

// Compute full_name on user data if not provided by API
function enrichUser(user: User): User {
  return {
    ...user,
    full_name: user.full_name || `${user.first_name} ${user.last_name}`,
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        const { data, error } = await api.getCurrentUser();
        if (data) {
          setUser(enrichUser(data));
        } else {
          // Token invalid, clear it
          api.logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await api.login(email, password);
    if (error) {
      return { success: false, error };
    }

    // Fetch user data after login
    const userResponse = await api.getCurrentUser();
    if (userResponse.data) {
      setUser(enrichUser(userResponse.data));
      return { success: true };
    }

    return { success: false, error: 'Failed to fetch user data' };
  };

  const logout = () => {
    api.logout();
    setUser(null);
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
