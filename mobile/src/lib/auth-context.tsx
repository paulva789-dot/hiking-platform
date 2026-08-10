import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await tokenStore.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      await tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
      await tokenStore.set(data.token);
      await refresh();
    },
    [refresh]
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const data = await api.post<{ user: User; token: string }>('/auth/register', input);
      await tokenStore.set(data.token);
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clearing the local token is what actually matters here.
    }
    await tokenStore.clear();
    setUser(null);
  }, []);

  const isPremium = useMemo(() => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.tier !== 'PREMIUM') return false;
    return !user.tierExpires || new Date(user.tierExpires) > new Date();
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, isPremium, login, register, logout, refresh }),
    [user, loading, isPremium, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
