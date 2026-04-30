import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { ui } = useLang();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
              {ui.forgot_title ?? 'Forgot password'}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {ui.forgot_sub ?? "Enter your email and we'll send you a link to reset your password."}
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-3.5 mb-4 text-sm"
              style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)', color: 'hsl(var(--c-red))' }}>
              ⚠ {error}
            </div>
          )}

          {sent ? (
            <div className="rounded-xl p-4 text-sm"
              style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.3)', color: 'hsl(var(--c-green))' }}>
              ✓ {ui.forgot_sent ?? 'If that email is registered, a reset link is on its way. Check your inbox.'}
            </div>
          ) : (
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
              <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
                {isLoading ? '…' : (ui.forgot_button ?? 'Send reset link')}
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
