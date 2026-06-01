import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AuthLayout } from '../components/AuthLayout';

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

  // ── Debounced nickname availability check ─────────────────
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

  // ── Debounced email availability check ────────────────────
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

  return (
    <AuthLayout
      mode="signup"
      title={lang === 'en' ? 'Create your account' : 'Създай акаунт'}
      subtitle={
        lang === 'en'
          ? 'Free forever. Pro is optional and unlocks advanced modules + the AI advisor.'
          : 'Безплатно завинаги. Pro е по избор и отключва напреднали модули + AI съветника.'
      }
      topRightLink={
        <>
          {ui.have_account}{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
            {ui.sign_in}
          </Link>
        </>
      }
    >
      {/* Google sign-up */}
      <div className="mb-5">
        <GoogleSignInButton rememberMe variant="signup" />
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nickname */}
        <div>
          <FieldLabel>{ui.full_name}</FieldLabel>
          <input
            type="text"
            className="input-field"
            placeholder="AlexJohnson"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/ /g, ''))}
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

        {/* Email */}
        <div>
          <FieldLabel>{ui.email}</FieldLabel>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Password */}
        <div>
          <FieldLabel>{ui.password}</FieldLabel>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-11"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'hsl(var(--c-fg-muted))' }}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {/* Always-visible rule list for trust */}
          <div className="mt-2 space-y-0.5">
            <p
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: password.length === 0 ? 'hsl(var(--c-fg-subtle))' : pwLength ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}
            >
              <span>{password.length === 0 ? '•' : pwLength ? '✓' : '✗'}</span>
              {lang === 'en' ? 'At least 8 characters' : 'Поне 8 символа'}
            </p>
            <p
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: password.length === 0 ? 'hsl(var(--c-fg-subtle))' : pwUppercase ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}
            >
              <span>{password.length === 0 ? '•' : pwUppercase ? '✓' : '✗'}</span>
              {lang === 'en' ? 'At least 1 uppercase letter (A–Z)' : 'Поне 1 главна буква (A–Z)'}
            </p>
          </div>
        </div>

        {/* Tiny legal microcopy (a big-platform staple) */}
        <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'By creating an account, you agree to our ' : 'Със създаване на акаунт се съгласяваш с нашата '}
          <Link to="/privacy" className="underline" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? 'Privacy Policy' : 'Политика за поверителност'}
          </Link>
          {lang === 'en' ? '. We never sell your data.' : '. Никога не продаваме данните ти.'}
        </p>

        <button
          type="submit"
          className="btn-green w-full mt-1"
          disabled={isLoading || !nameOk || !emailOk || !passwordOk}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {ui.create_account}…
            </span>
          ) : (
            <>{ui.create_account} →</>
          )}
        </button>
      </form>

      <p className="text-sm mt-7 lg:hidden text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {ui.have_account}{' '}
        <Link to="/login" className="font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
          {ui.sign_in}
        </Link>
      </p>
    </AuthLayout>
  );
}

/* ─── helpers ─────────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
      {children}
    </label>
  );
}

function Hint({ ok, msg, muted }: { ok: boolean; msg: string; muted?: boolean }) {
  return (
    <p
      className="text-xs mt-1.5 font-medium flex items-center gap-1.5"
      style={{ color: muted ? 'hsl(var(--c-fg-subtle))' : ok ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}
    >
      <span>{muted ? '…' : ok ? '✓' : '✗'}</span>
      {msg}
    </p>
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
