import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface Availability {
  state: 'idle' | 'checking' | 'ok' | 'taken' | 'banned' | 'error';
}

export function Register() {
  const { register } = useAuth();
  const { ui, lang } = useLang();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [nameAvail, setNameAvail] = useState<Availability>({ state: 'idle' });
  const [emailAvail, setEmailAvail] = useState<Availability>({ state: 'idle' });

  const nameNoSpaces = !name.includes(' ');
  const nameLengthOk = name.trim().length >= 2;
  const nameLocallyOk = nameLengthOk && nameNoSpaces;
  const emailFormatOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwLength = password.length >= 8;
  const pwUppercase = /[A-Z]/.test(password);
  const passwordOk = pwLength && pwUppercase;

  const nameOk = nameLocallyOk && nameAvail.state === 'ok';
  const emailOk = emailFormatOk && emailAvail.state === 'ok';

  // Debounced server-side check (banned + uniqueness) for the nickname.
  const nameSeq = useRef(0);
  useEffect(() => {
    if (!nameLocallyOk) {
      setNameAvail({ state: 'idle' });
      return;
    }
    setNameAvail({ state: 'checking' });
    const seq = ++nameSeq.current;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-availability?name=${encodeURIComponent(name.trim())}`);
        const data = await res.json();
        if (seq !== nameSeq.current) return;
        if (data.name?.banned) setNameAvail({ state: 'banned' });
        else if (data.name?.available) setNameAvail({ state: 'ok' });
        else setNameAvail({ state: 'taken' });
      } catch {
        if (seq === nameSeq.current) setNameAvail({ state: 'error' });
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [name, nameLocallyOk]);

  // Same pattern for email — only blocks when an already-verified account owns it.
  const emailSeq = useRef(0);
  useEffect(() => {
    if (!emailFormatOk) {
      setEmailAvail({ state: 'idle' });
      return;
    }
    setEmailAvail({ state: 'checking' });
    const seq = ++emailSeq.current;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-availability?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        const data = await res.json();
        if (seq !== emailSeq.current) return;
        if (data.email?.available) setEmailAvail({ state: 'ok' });
        else setEmailAvail({ state: 'taken' });
      } catch {
        if (seq === emailSeq.current) setEmailAvail({ state: 'error' });
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [email, emailFormatOk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (!nameOk || !emailOk || !passwordOk) return;
    setIsLoading(true);
    try {
      const result = await register(name, email, password);
      navigate('/verify-email', {
        state: {
          email: result.email,
          emailSent: result.emailSent,
          devCode: result.devCode,
          justRegistered: true,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const Hint = ({ ok, msg, muted }: { ok: boolean; msg: string; muted?: boolean }) => (
    <p className="text-xs mt-1.5 font-medium"
      style={{ color: muted ? 'hsl(var(--c-fg-subtle))' : ok ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
      {muted ? '…' : ok ? '✓' : '✗'} {msg}
    </p>
  );

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

          {/* Google sign-up */}
          <div className="mb-5">
            <GoogleSignInButton rememberMe variant="signup" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--c-fg)/0.1)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'or' : 'или'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--c-fg)/0.1)' }} />
          </div>

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
                <Hint ok={false} msg={ui.reg_name_min ?? 'At least 2 characters'} />
              )}
              {(submitted || name.length > 0) && nameLengthOk && !nameNoSpaces && (
                <Hint ok={false} msg={ui.reg_name_no_spaces ?? 'No spaces allowed in username'} />
              )}
              {nameLocallyOk && nameAvail.state === 'checking' && (
                <Hint ok={false} muted msg={ui.reg_checking ?? 'Checking availability…'} />
              )}
              {nameLocallyOk && nameAvail.state === 'banned' && (
                <Hint ok={false} msg={ui.reg_name_banned ?? 'This nickname is not allowed'} />
              )}
              {nameLocallyOk && nameAvail.state === 'taken' && (
                <Hint ok={false} msg={ui.reg_name_taken ?? 'This nickname is already taken'} />
              )}
              {nameLocallyOk && nameAvail.state === 'ok' && (
                <Hint ok msg={ui.reg_name_available ?? 'Nickname available'} />
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
              {(submitted || email.length > 0) && !emailFormatOk && (
                <Hint ok={false} msg={ui.reg_email_invalid ?? 'Enter a valid email address'} />
              )}
              {emailFormatOk && emailAvail.state === 'checking' && (
                <Hint ok={false} muted msg={ui.reg_checking ?? 'Checking…'} />
              )}
              {emailFormatOk && emailAvail.state === 'taken' && (
                <Hint ok={false} msg={ui.reg_email_taken ?? 'This email is already registered'} />
              )}
              {emailFormatOk && emailAvail.state === 'ok' && (
                <Hint ok msg={ui.reg_email_ok ?? 'Email available'} />
              )}
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

            <button
              type="submit"
              className="btn-green w-full mt-2"
              disabled={isLoading || !nameOk || !emailOk || !passwordOk}
            >
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
