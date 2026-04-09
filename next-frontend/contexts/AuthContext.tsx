'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthStatus {
  isLogged: boolean;
  isAdmin: boolean;
  role: string | null;
  adminId: string | null;
  tokenExpiry: number | null;
}

interface AuthContextType {
  authStatus: AuthStatus;
  refreshAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isLogged: false,
    isAdmin: false,
    role: null,
    adminId: null,
    tokenExpiry: null,
  });

  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('role');
    
    // Clear cookies
    document.cookie = "adminToken=; max-age=0; path=/";
    document.cookie = "customerToken=; max-age=0; path=/";
    document.cookie = "role=; max-age=0; path=/";
    
    setAuthStatus({
      isLogged: false,
      isAdmin: false,
      role: null,
      adminId: null,
      tokenExpiry: null,
    });

    window.location.href = '/';
  }, []);

  const refreshAuth = useCallback(() => {
    if (typeof window === 'undefined') return;

    const adminToken = localStorage.getItem('adminToken');
    const customerToken = localStorage.getItem('customerToken');
    const role = localStorage.getItem('role');
    const adminId = localStorage.getItem('adminId');

    const token = adminToken || customerToken;
    let tokenExpiry: number | null = null;

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        tokenExpiry = decoded.exp ? decoded.exp * 1000 : null;

        // If the token is already expired, logout immediately
        if (tokenExpiry && Date.now() >= tokenExpiry) {
          logout();
          return;
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        logout();
        return;
      }
    }

    setAuthStatus({
      isLogged: !!token,
      isAdmin: !!adminToken,
      role: role ? role.trim() : null,
      adminId: adminId || null,
      tokenExpiry,
    });
  }, [logout]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Set up auto-logout timer when auth state changes
  useEffect(() => {
    if (authStatus.isLogged && authStatus.tokenExpiry) {
      const timeUntilExpiry = authStatus.tokenExpiry - Date.now();
      
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      if (timeUntilExpiry > 0) {
        // Schedule logout when token expires
        logoutTimerRef.current = setTimeout(() => {
          console.log('Session expired. Logging out...');
          logout();
        }, timeUntilExpiry);
      } else {
        logout();
      }
    }

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [authStatus.isLogged, authStatus.tokenExpiry, logout]);

  return (
    <AuthContext.Provider value={{ authStatus, refreshAuth, logout }}>
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
