import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const TOKEN_KEY = 'octolio_token';

export interface User {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  energy: number;
  energy_refill_at?: string | null;
  is_pro: boolean;
  onboarding_done: boolean;
  streak_freezes?: number;
  coins?: number;
  avatar?: string;
  goal?: string | null;
  daily_goal_min?: number | null;
  /** Remaining free AI "explain my mistake" uses today; null = unlimited (Pro). */
  ai_explains_remaining?: number | null;
}

interface AuthValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ emailSent: boolean; devCode?: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback(async (t: string | null) => {
    setToken(t);
    if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  const loadMe = useCallback(async (t: string) => {
    const data = await api<{ user: User }>('/api/auth/me', { token: t });
    setUser(data.user);
  }, []);

  // Boot: restore token + hydrate the user.
  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync(TOKEN_KEY);
        if (t) { setToken(t); await loadMe(t).catch(() => {}); }
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password, rememberMe: true },
    });
    await persistToken(data.token);
    setUser(data.user);
  }, [persistToken]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api<{ ok: boolean; emailSent: boolean; devCode?: string }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    return { emailSent: !!data.emailSent, devCode: data.devCode };
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/verify-email', {
      method: 'POST',
      body: { email, code },
    });
    await persistToken(data.token);
    setUser(data.user);
  }, [persistToken]);

  const logout = useCallback(async () => {
    setUser(null);
    await persistToken(null);
  }, [persistToken]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    await loadMe(token).catch(() => {});
  }, [token, loadMe]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const deleteAccount = useCallback(async (password?: string) => {
    await api('/api/auth/account', { method: 'DELETE', token, body: password ? { password } : undefined });
    setUser(null);
    await persistToken(null);
  }, [token, persistToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyEmail, logout, refreshUser, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
