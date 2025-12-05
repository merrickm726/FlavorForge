"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// define the User type based on Prisma schema
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
      // 1. try to load from localStorage first (see if they were previously signed in)
      const storedUser = localStorage.getItem('flavorForgeUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // 2. verify with server to get latest data
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const userData = await res.json();
          // make sure u don't store password if API returns it
          const { password, ...safeUser } = userData;
          setUser(safeUser);
          localStorage.setItem('flavorForgeUser', JSON.stringify(safeUser));
        } else {
          // if server says token is invalid/expired, clear local state
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

  // login function, just set user to the inputted data
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('flavorForgeUser', JSON.stringify(userData));
  };

  //logout function, set user to null and remove the locally stored user
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
