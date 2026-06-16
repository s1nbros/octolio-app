import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

const TOKEN_KEY = 'octolio_token';
const STORAGE_KEY = 'octolio_storage'; // 'local' | 'session'

/** Read token from whichever storage it was saved to. */
function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

/** Persist token: localStorage when rememberMe, sessionStorage otherwise. */
function saveToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, 'local');
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, 'session');
    localStorage.removeItem(TOKEN_KEY);
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  /** Resolves to `true` if the Google sign-in created a brand-new account (caller should send them to onboarding). */
  loginWithGoogle: (credential: string, rememberMe: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ pending: true; email: string; emailSent: boolean; devCode?: string }>;
  verifyEmail: (params: { email?: string; code?: string; token?: string }) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  saveOnboardingProfile: (p: { goal: string; experienceLevel: string; dailyGoalMin: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => readToken());
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        clearToken();
        setToken(null);
        setUser(null);
      }
    } catch {
      // network error — keep token, try again later
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMe(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, fetchMe]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    saveToken(data.token, rememberMe);
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (credential: string, rememberMe: boolean): Promise<boolean> => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google sign-in failed');

    saveToken(data.token, rememberMe);
    setToken(data.token);
    setUser(data.user);
    // /onboarding decides itself whether to show — but signal to the caller.
    return !data.user.onboarding_done;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    // Registration now requires email verification — no token issued yet.
    return {
      pending: true as const,
      email: data.email ?? email.toLowerCase(),
      emailSent: !!data.emailSent,
      devCode: data.devCode as string | undefined,
    };
  };

  const verifyEmail = async (params: { email?: string; code?: string; token?: string }) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    saveToken(data.token, true);
    setToken(data.token);
    setUser(data.user);
  };

  const resendVerification = async (email: string) => {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to resend verification email');
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...updates } : u));
  };

  const refreshUser = useCallback(async () => {
    const t = readToken();
    if (t) await fetchMe(t);
  }, [fetchMe]);

  const completeOnboarding = async () => {
    await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser((u) => (u ? { ...u, onboarding_done: true } : u));
  };

  const saveOnboardingProfile = async (p: { goal: string; experienceLevel: string; dailyGoalMin: number }) => {
    const res = await fetch('/api/auth/onboarding-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(p),
    });
    if (res.ok) {
      setUser((u) =>
        u ? { ...u, goal: p.goal, experience_level: p.experienceLevel, daily_goal_min: p.dailyGoalMin } : u
      );
    }
  };

  const updateProfile = async (updates: { name?: string; avatar?: string }) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    setUser(data.user);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password change failed');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, register, verifyEmail, resendVerification, forgotPassword, resetPassword, logout, updateUser, refreshUser, updateProfile, changePassword, completeOnboarding, saveOnboardingProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
