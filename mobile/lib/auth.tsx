import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const TOKEN_KEY = 'octolio_token';
// Set once the user finishes onboarding on THIS device, so the wizard never
// re-appears even if the completion POST was slow or failed. Cleared on logout
// so a different account on the same device still gets its own onboarding.
const ONBOARDED_KEY = 'octolio_onboarded';

/** Apply the local "already onboarded" flag so a fresh /me that still reports
 *  onboarding_done:false (e.g. the completion write never reached the server)
 *  doesn't strand the user back in the survey on every launch. */
async function withLocalOnboarded(u: User): Promise<User> {
  if (u.onboarding_done) return u;
  const done = (await SecureStore.getItemAsync(ONBOARDED_KEY)) === '1';
  return done ? { ...u, onboarding_done: true } : u;
}

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
  equipped_hat?: string | null;
  equipped_face?: string | null;
  equipped_body?: string | null;
  goal?: string | null;
  daily_goal_min?: number | null;
  wheel_spun?: boolean;
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
  /** Persist that onboarding is done on this device (survives failed server writes). */
  markOnboarded: () => Promise<void>;
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
    setUser(await withLocalOnboarded(data.user));
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
    setUser(await withLocalOnboarded(data.user));
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
    setUser(await withLocalOnboarded(data.user));
  }, [persistToken]);

  const logout = useCallback(async () => {
    setUser(null);
    await persistToken(null);
    await SecureStore.deleteItemAsync(ONBOARDED_KEY);
  }, [persistToken]);

  /** Mark onboarding complete on this device — optimistic + persisted, so the
   *  survey never re-appears even if the server write is slow or fails. */
  const markOnboarded = useCallback(async () => {
    await SecureStore.setItemAsync(ONBOARDED_KEY, '1');
    setUser((u) => (u ? { ...u, onboarding_done: true } : u));
  }, []);

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
    await SecureStore.deleteItemAsync(ONBOARDED_KEY);
  }, [token, persistToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyEmail, logout, refreshUser, updateUser, deleteAccount, markOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
