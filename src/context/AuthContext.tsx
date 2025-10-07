import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = useCallback(() => setIsAuthenticated(true), []);
  const signOut = useCallback(() => setIsAuthenticated(false), []);

  const value = useMemo(() => ({ isAuthenticated, signIn, signOut }), [isAuthenticated, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
