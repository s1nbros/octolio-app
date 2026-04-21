import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function Register() {
  const { register } = useAuth();
  const { ui } = useLang();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nameNoSpaces = !name.includes(' ');
  const nameLengthOk = name.trim().length >= 2;
  const nameOk = nameLengthOk && nameNoSpaces;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwLength = password.length >= 8;
  const pwUppercase = /[A-Z]/.test(password);
  const passwordOk = pwLength && pwUppercase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (!nameOk || !emailOk || !passwordOk) return;
    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const hint = (show: boolean, ok: boolean, msg: string) =>
    show ? (
      <p className="text-xs mt-1.5 font-medium" style={{ color: ok ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
        {ok ? '✓' : '✗'} {msg}
      </p>
    ) : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <FloatingOrbs />

      <div className="relative w-full max-w-md animate-scale-in" style={{ zIndex: 1 }}>
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="Octolio" className="w-20 h-20 object-contain"
                style={{ filter: 'drop-shadow(0 4px 16px hsl(var(--c-green)/0.3))' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
              {ui.create_account}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {ui.hero_sub.split('.')[0]}.
            </p>
          </div>

          {error && (
            <p className="text-sm mb-4 font-medium" style={{ color: 'hsl(var(--c-red))' }}>
              ✗ {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {ui.full_name}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="AlexJohnson"
                value={name}
                onChange={e => setName(e.target.value.replace(/ /g, ''))}
                autoComplete="username"
              />
              {(submitted || name.length > 0) && !nameLengthOk && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'hsl(var(--c-red))' }}>✗ At least 2 characters</p>
              )}
              {(submitted || name.length > 0) && nameLengthOk && !nameNoSpaces && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'hsl(var(--c-red))' }}>✗ No spaces allowed in username</p>
              )}
              {(submitted || name.length > 0) && nameOk && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'hsl(var(--c-green))' }}>✓ Looks good</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {ui.email}
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {hint(submitted || email.length > 0, emailOk,
                emailOk ? 'Valid email' : 'Enter a valid email address')}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {ui.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-xs font-medium" style={{ color: pwLength ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
                    {pwLength ? '✓' : '✗'} At least 8 characters
                  </p>
                  <p className="text-xs font-medium" style={{ color: pwUppercase ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
                    {pwUppercase ? '✓' : '✗'} At least 1 uppercase letter (A–Z)
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="btn-green w-full mt-2" disabled={isLoading}>
              {isLoading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {ui.create_account}...
                  </span>
                : ui.create_account + ' →'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {ui.have_account}{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
              {ui.sign_in}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
