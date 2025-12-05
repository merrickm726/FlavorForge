"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the User type based on your Prisma schema (simplified for frontend)
interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage and verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      // 1. Try to load from localStorage first for immediate UI state
      const storedUser = localStorage.getItem('flavorForgeUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // 2. Verify with server to get latest data (including role updates)
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const userData = await res.json();
          // Ensure we don't store password if API returns it
          const { password, ...safeUser } = userData;
          setUser(safeUser);
          localStorage.setItem('flavorForgeUser', JSON.stringify(safeUser));
        } else {
          // If server says token is invalid/expired, clear local state
          if (res.status === 401) {
            setUser(null);
            localStorage.removeItem('flavorForgeUser');
          }
        }
      } catch (error) {
        console.error('Failed to verify session:', error);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('flavorForgeUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('flavorForgeUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
