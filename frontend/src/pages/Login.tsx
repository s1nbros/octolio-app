import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function Login() {
  const { login } = useAuth();
  const { ui } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(210, 40%, 96%)' }}>
              Octolio
            </h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(215, 20%, 55%)' }}>
              {ui.sign_in}
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-3.5 mb-5 text-sm"
              style={{ background: 'hsl(0, 72%, 58%, 0.1)', border: '1px solid hsl(0, 72%, 58%, 0.3)', color: 'hsl(0, 72%, 70%)' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215, 20%, 70%)' }}>
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(215, 20%, 70%)' }}>
                {ui.password}
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
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

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(215, 20%, 55%)' }}>
            {ui.no_account}{' '}
            <Link to="/register" className="font-semibold transition-colors"
              style={{ color: 'hsl(160, 55%, 60%)' }}>
              {ui.create_account}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
