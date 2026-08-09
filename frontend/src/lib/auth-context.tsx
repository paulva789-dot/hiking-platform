'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, tokenStore } from './api';
import type { GuideProfile, User } from './types';

interface MeResponse {
  user: User;
  guideProfile: GuideProfile | null;
  stats: { favorites: number; reviews: number; bookings: number; photos: number };
}

interface AuthState {
  user: User | null;
  guideProfile: GuideProfile | null;
  stats: MeResponse['stats'] | null;
  loading: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  region?: string;
  asGuide?: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guideProfile, setGuideProfile] = useState<GuideProfile | null>(null);
  const [stats, setStats] = useState<MeResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setGuideProfile(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get<MeResponse>('/auth/me');
      setUser(data.user);
      setGuideProfile(data.guideProfile);
      setStats(data.stats);
    } catch {
      // A stale or revoked token should log the user out silently rather than
      // leaving the UI in a half-signed-in state.
      tokenStore.clear();
      setUser(null);
      setGuideProfile(null);
      setStats(null);
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
      tokenStore.set(data.token);
      await refresh();
      return data.user;
    },
    [refresh]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await api.post<{ user: User; token: string }>('/auth/register', input);
      tokenStore.set(data.token);
      await refresh();
      return data.user;
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clearing the local token is what actually matters here.
    }
    tokenStore.clear();
    setUser(null);
    setGuideProfile(null);
    setStats(null);
  }, []);

  const isPremium = useMemo(() => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.tier !== 'PREMIUM') return false;
    return !user.tierExpires || new Date(user.tierExpires) > new Date();
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({ user, guideProfile, stats, loading, isPremium, login, register, logout, refresh }),
    [user, guideProfile, stats, loading, isPremium, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
