import { useEffect, useState } from 'react';
import { useLang } from '../contexts/LanguageContext';

/**
 * "Install Octolio" nudge. On Chromium (Android/desktop) it captures the native
 * `beforeinstallprompt` and offers a one-tap Install button. On iOS Safari (no
 * such event) it shows a Share → "Add to Home Screen" hint. Hidden when already
 * installed (standalone) or recently dismissed.
 */

const DISMISS_KEY = 'octolio_install_dismissed_v1';
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
const recentlyDismissed = () => {
  const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return ts > 0 && Date.now() - ts < DISMISS_DAYS * 864e5;
};

export function InstallPrompt() {
  const { lang } = useLang();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    const onInstalled = () => setShow(false);
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    let timer: number | undefined;
    if (isIos()) {
      timer = window.setTimeout(() => { setIosHint(true); setShow(true); }, 1500);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  const t = (en: string, bg: string) => (lang === 'bg' ? bg : en);
  const dismiss = () => { localStorage.setItem(DISMISS_KEY, String(Date.now())); setShow(false); };
  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setShow(false);
    setDeferred(null);
    if (outcome === 'dismissed') dismiss();
  };

  return (
    <div className="fixed left-0 right-0 z-[60] flex justify-center px-3 pb-3 bottom-[76px] md:bottom-0" style={{ pointerEvents: 'none' }}>
      <div className="glass-card animate-fade-up" style={{ pointerEvents: 'auto', maxWidth: 440, width: '100%', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 34px rgba(0,0,0,0.45)' }}>
        <img src="/pwa-192x192.png" width={46} height={46} style={{ borderRadius: 12, flexShrink: 0 }} alt="Octolio" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, color: 'hsl(var(--c-fg))', fontSize: 14 }}>{t('Install Octolio', 'Инсталирай Octolio')}</p>
          <p style={{ color: 'hsl(var(--c-fg-muted))', fontSize: 12, lineHeight: 1.45 }}>
            {iosHint
              ? t('Tap the Share button, then “Add to Home Screen”.', 'Натисни бутона Сподели, после „Добави към началния екран“.')
              : t('Add it to your home screen — opens fullscreen, works offline.', 'Добави го на началния екран — цял екран, работи офлайн.')}
          </p>
        </div>
        {!iosHint && deferred ? (
          <button className="btn-primary" style={{ padding: '9px 16px', fontSize: 13, flexShrink: 0 }} onClick={install}>
            {t('Install', 'Инсталирай')}
          </button>
        ) : null}
        <button onClick={dismiss} aria-label={t('Dismiss', 'Затвори')}
          style={{ flexShrink: 0, color: 'hsl(var(--c-fg-subtle))', fontSize: 22, lineHeight: 1, padding: '2px 6px', background: 'none', border: 'none', cursor: 'pointer' }}>
          ×
        </button>
      </div>
    </div>
  );
}
