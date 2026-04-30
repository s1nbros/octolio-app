import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

interface VerifyState {
  email?: string;
  emailSent?: boolean;
  devCode?: string;
  justRegistered?: boolean;
}

export function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const { ui } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const state = (location.state as VerifyState | null) ?? {};

  const [email, setEmail] = useState<string>(state.email ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number>(0);
  const [emailSent, setEmailSent] = useState<boolean>(state.emailSent ?? true);
  const [devCode, setDevCode] = useState<string | undefined>(state.devCode);
  const linkAttempted = useRef(false);

  // Auto-verify if a ?token=... is present (link from the email)
  useEffect(() => {
    const token = params.get('token');
    if (token && !linkAttempted.current) {
      linkAttempted.current = true;
      setIsLoading(true);
      verifyEmail({ token })
        .then(() => navigate('/onboarding'))
        .catch(err => setError(err instanceof Error ? err.message : 'Verification failed'))
        .finally(() => setIsLoading(false));
    }
  }, [params, verifyEmail, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email || code.length !== 6) {
      setError(ui.verify_enter_code ?? 'Enter the 6-digit code from the email');
      return;
    }
    setIsLoading(true);
    try {
      await verifyEmail({ email, code });
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError(ui.verify_email_required ?? 'Enter your email first'); return; }
    if (Date.now() - resentAt < 30_000) {
      setInfo(ui.verify_resend_wait ?? 'Wait a few seconds before resending again.');
      return;
    }
    setResending(true);
    setError('');
    setInfo('');
    try {
      await resendVerification(email);
      setResentAt(Date.now());
      setEmailSent(true);
      setDevCode(undefined);
      setInfo(ui.verify_resent ?? 'Verification email sent. Check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  const inboxLabel = email
    ? (ui.verify_inbox_with_email ?? 'We sent a verification email to')
    : (ui.verify_inbox_generic ?? 'We sent a verification email to your inbox.');

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <FloatingOrbs />
      <div className="relative w-full max-w-md animate-scale-in" style={{ zIndex: 1 }}>
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'hsl(var(--c-primary)/0.12)',
                border: '1px solid hsl(var(--c-primary)/0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>
                ✉️
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
              {state.justRegistered
                ? (ui.verify_check_inbox ?? 'Check your inbox')
                : (ui.verify_title ?? 'Verify your email')}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {inboxLabel}
              {email && (
                <>
                  {' '}
                  <strong style={{ color: 'hsl(var(--c-fg))' }}>{email}</strong>.
                </>
              )}
            </p>
            <p className="text-xs mt-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {ui.verify_instructions ?? 'Click the link in the email or enter the 6-digit code below. The code expires in 30 minutes.'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {ui.verify_check_spam ?? "Don't see it? Check your spam folder."}
            </p>
          </div>

          {!emailSent && (
            <div className="rounded-xl p-3.5 mb-4 text-xs"
              style={{ background: 'hsl(45 90% 55%/0.1)', border: '1px solid hsl(45 90% 55%/0.3)', color: 'hsl(45 90% 70%)' }}>
              ⚙️ Email delivery isn't configured on the server yet, so no email was actually sent.
              {devCode && (
                <>
                  {' '}For testing, your verification code is:
                  <div style={{
                    marginTop: 8, padding: '8px 12px', borderRadius: 8,
                    background: 'hsl(var(--c-bg))', textAlign: 'center',
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: 22, letterSpacing: '0.5em', color: 'hsl(var(--c-primary))',
                    fontWeight: 700,
                  }}>
                    {devCode}
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl p-3.5 mb-4 text-sm"
              style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)', color: 'hsl(var(--c-red))' }}>
              ⚠ {error}
            </div>
          )}
          {info && (
            <div className="rounded-xl p-3.5 mb-4 text-sm"
              style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.3)', color: 'hsl(var(--c-green))' }}>
              ✓ {info}
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
                disabled={!!state.email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {ui.verify_code_label ?? 'Verification code'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="input-field text-center"
                style={{ letterSpacing: '0.5em', fontSize: '1.25rem', fontFamily: 'ui-monospace, Menlo, monospace' }}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading || code.length !== 6}>
              {isLoading ? '…' : (ui.verify_button ?? 'Verify email')}
            </button>
          </form>

          <div className="text-center mt-5 text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {ui.verify_no_email ?? "Didn't get an email?"}{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold"
              style={{ color: 'hsl(var(--c-primary))' }}
            >
              {resending ? '…' : (ui.verify_resend ?? 'Resend')}
            </button>
          </div>

          <p className="text-center text-sm mt-4" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            <Link to="/login" style={{ color: 'hsl(var(--c-primary))' }}>← {ui.sign_in}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
