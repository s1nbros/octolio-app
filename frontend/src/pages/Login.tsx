import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AuthLayout } from '../components/AuthLayout';

export function Login() {
  const { login, resendVerification } = useAuth();
  const { ui, lang } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerify, setNeedsVerify] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerify(null);
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/modules');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (/not verified/i.test(msg)) {
        setNeedsVerify(email.toLowerCase());
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!needsVerify) return;
    try {
      await resendVerification(needsVerify);
      navigate('/verify-email', { state: { email: needsVerify } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    }
  };

  return (
    <AuthLayout
      mode="signin"
      title={lang === 'en' ? 'Sign in to Octolio' : 'Вход в Octolio'}
      subtitle={
        lang === 'en'
          ? 'Welcome back — pick up your streak right where you left off.'
          : 'Добре дошъл — продължи стрийка си точно откъдето спря.'
      }
      topRightLink={
        <>
          {ui.no_account}{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
            {ui.create_account}
          </Link>
        </>
      }
    >
      {/* Google sign-in (primary surface — big platforms put SSO first) */}
      <div className="mb-5">
        <GoogleSignInButton rememberMe={rememberMe} variant="signin" />
      </div>

      <Divider lang={lang} />

      {error && (
        <div
          className="rounded-lg px-3.5 py-2.5 mb-4 text-sm flex items-start gap-2"
          style={{
            background: 'hsl(var(--c-red)/0.08)',
            border: '1px solid hsl(var(--c-red)/0.25)',
            color: 'hsl(var(--c-red))',
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {needsVerify && (
        <div
          className="rounded-lg px-3.5 py-2.5 mb-4 text-sm"
          style={{
            background: 'hsl(var(--c-primary)/0.06)',
            border: '1px solid hsl(var(--c-primary)/0.25)',
            color: 'hsl(var(--c-fg))',
          }}
        >
          {ui.login_verify_required ?? 'Your email is not yet verified.'}{' '}
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold underline"
            style={{ color: 'hsl(var(--c-primary))' }}
          >
            {ui.verify_resend ?? 'Resend verification email'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label={ui.email}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {ui.password}
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold"
              style={{ color: 'hsl(var(--c-primary))' }}
            >
              {ui.forgot_link ?? 'Forgot?'}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'hsl(var(--c-fg-muted))' }}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded accent-[hsl(var(--c-primary))] cursor-pointer"
          />
          <span className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {ui.remember_me ?? 'Remember me for 30 days'}
          </span>
        </label>

        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {ui.sign_in}…
            </span>
          ) : (
            ui.sign_in
          )}
        </button>
      </form>

      <p className="text-sm mt-7 lg:hidden text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {ui.no_account}{' '}
        <Link to="/register" className="font-semibold" style={{ color: 'hsl(var(--c-green))' }}>
          {ui.create_account}
        </Link>
      </p>
    </AuthLayout>
  );
}

/* ─── shared field input ─────────────────────────────────── */
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {label}
      </label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function Divider({ lang }: { lang: 'en' | 'bg' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px" style={{ background: 'hsl(var(--c-fg)/0.1)' }} />
      <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'or continue with email' : 'или продължи с имейл'}
      </span>
      <div className="flex-1 h-px" style={{ background: 'hsl(var(--c-fg)/0.1)' }} />
    </div>
  );
}
