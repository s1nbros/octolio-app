import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const { ui } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pwLength = password.length >= 8;
  const pwUppercase = /[A-Z]/.test(password);
  const pwMatch = password === confirm && confirm.length > 0;
  const ok = pwLength && pwUppercase && pwMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) { setError(ui.reset_no_token ?? 'Reset link is missing or invalid.'); return; }
    if (!ok) return;
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <FloatingOrbs />
      <div className="relative w-full max-w-md animate-scale-in" style={{ zIndex: 1 }}>
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="Octolio" className="w-20 h-20 object-contain"
                style={{ filter: 'drop-shadow(0 4px 16px hsl(160, 55%, 55%, 0.3))' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
              {ui.reset_title ?? 'Set a new password'}
            </h1>
          </div>

          {error && (
            <div className="rounded-xl p-3.5 mb-4 text-sm"
              style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)', color: 'hsl(var(--c-red))' }}>
              ⚠ {error}
            </div>
          )}

          {done ? (
            <div className="rounded-xl p-4 text-sm"
              style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.3)', color: 'hsl(var(--c-green))' }}>
              ✓ {ui.reset_done ?? 'Password updated. Redirecting to sign-in…'}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {ui.new_password ?? 'New password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
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
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {ui.confirm_password ?? 'Confirm password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {confirm.length > 0 && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: pwMatch ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
                    {pwMatch ? '✓' : '✗'} {pwMatch ? 'Matches' : 'Passwords do not match'}
                  </p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading || !ok}>
                {isLoading ? '…' : (ui.reset_button ?? 'Reset password')}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            <Link to="/login" style={{ color: 'hsl(var(--c-primary))' }}>← {ui.sign_in}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
