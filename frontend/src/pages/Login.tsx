import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function Login() {
  const { login, resendVerification } = useAuth();
  const { ui } = useLang();
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
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <FloatingOrbs />

      <div className="relative w-full max-w-md animate-scale-in" style={{ zIndex: 1 }}>
        <div className="glass-card rounded-3xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="Octolio" className="w-20 h-20 object-contain"
                style={{ filter: 'drop-shadow(0 4px 16px hsl(160, 55%, 55%, 0.3))' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
              Octolio
            </h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {ui.sign_in}
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-3.5 mb-5 text-sm"
              style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)', color: 'hsl(var(--c-red))' }}>
              ⚠ {error}
            </div>
          )}

          {needsVerify && (
            <div className="rounded-xl p-3.5 mb-5 text-sm"
              style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.3)', color: 'hsl(var(--c-fg))' }}>
              {ui.login_verify_required ?? 'Your email is not yet verified.'}{' '}
              <button type="button" onClick={handleResend}
                className="font-semibold underline"
                style={{ color: 'hsl(var(--c-primary))' }}>
                {ui.verify_resend ?? 'Resend verification email'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {ui.email}
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {ui.password}
              </label>
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
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember me + forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[hsl(var(--c-primary))] cursor-pointer"
                />
                <span className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {ui.remember_me ?? 'Remember me'}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'hsl(var(--c-primary))' }}
              >
                {ui.forgot_link ?? 'Forgot password?'}
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {ui.sign_in}...
                </span>
              ) : ui.sign_in}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {ui.no_account}{' '}
            <Link to="/register" className="font-semibold transition-colors"
              style={{ color: 'hsl(var(--c-green))' }}>
              {ui.create_account}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
