import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthSession, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextValue {
  session:   AuthSession | null;
  isLoading: boolean;
  login:     (username: string, password: string) => Promise<boolean>;
  logout:    () => void;
  hasRole:   (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    authService.getSession(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    // Simulamos una pequeña latencia para que no parezca instantáneo
    await new Promise((r) => setTimeout(r, 500));
    const result = authService.login(username, password);
    setIsLoading(false);
    if (result) {
      setSession(result);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!session) return false;
      return roles.includes(session.role);
    },
    [session],
  );

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
