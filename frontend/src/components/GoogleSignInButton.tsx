import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

// Minimal types for Google Identity Services that we touch from here.
// The full SDK lives on `window.google.accounts.id`.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';

interface Props {
  /** Whether to persist the JWT to localStorage (true) or sessionStorage (false). */
  rememberMe?: boolean;
  /** Label variant: 'signin_with' (default) or 'signup_with' for the Register page. */
  variant?: 'signin' | 'signup';
}

/**
 * Renders the official Google Sign-In button using Google Identity Services.
 * Posts the returned ID token (credential) to /api/auth/google, where the
 * backend verifies it and issues our own JWT.
 *
 * Set VITE_GOOGLE_CLIENT_ID to your OAuth 2.0 Web Client ID from Google Cloud.
 * If not set, the component renders a stub that explains the config issue
 * to the developer (never visible in prod).
 */
export function GoogleSignInButton({ rememberMe = true, variant = 'signin' }: Props) {
  const { loginWithGoogle } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  // Wait for the GIS script (added in index.html) to be available.
  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    const check = () => {
      if (window.google?.accounts?.id) {
        if (!cancelled) setReady(true);
        return;
      }
      setTimeout(check, 80);
    };
    check();
    return () => { cancelled = true; };
  }, []);

  // Initialize + render the button once GIS is ready.
  useEffect(() => {
    if (!ready || !CLIENT_ID || !containerRef.current) return;
    const handleCredential = async (resp: { credential: string }) => {
      setError('');
      try {
        const isNewUser = await loginWithGoogle(resp.credential, rememberMe);
        navigate(isNewUser ? '/onboarding' : '/modules');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Google sign-in failed');
      }
    };
    window.google!.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
      ux_mode: 'popup',
    });
    // Clear before re-render so we don't stack iframes on dev hot-reload.
    containerRef.current.innerHTML = '';
    window.google!.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      text: variant === 'signup' ? 'signup_with' : 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
      locale: lang === 'bg' ? 'bg' : 'en',
    });
  }, [ready, rememberMe, variant, lang, loginWithGoogle, navigate]);

  if (!CLIENT_ID) {
    // Dev-only hint. In production, set VITE_GOOGLE_CLIENT_ID and rebuild.
    return (
      <div
        className="rounded-xl p-3 text-xs"
        style={{
          background: 'hsl(var(--c-orange)/0.08)',
          border: '1px solid hsl(var(--c-orange)/0.3)',
          color: 'hsl(var(--c-orange))',
        }}
      >
        Google sign-in disabled — set <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend env to enable.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} style={{ minHeight: 40 }} />
      {error && (
        <div className="text-xs" style={{ color: 'hsl(var(--c-red))' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
