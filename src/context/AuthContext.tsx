import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type UserRole = 'customer' | 'tailor' | 'tailor_shop' | 'shop';

export type AuthContextValue = {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  signIn: (role: UserRole) => void;
  signOut: () => void;
  setUserRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const signIn = useCallback((role: UserRole) => {
    console.log('Signing in with role:', role);
    setIsAuthenticated(true);
    setUserRole(role);
  }, []);

  const signOut = useCallback(() => {
    console.log('Signing out');
    setIsAuthenticated(false);
    setUserRole(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, userRole, signIn, signOut, setUserRole }), 
    [isAuthenticated, userRole, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
