import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

function timeAgo(iso: string, lang: 'en' | 'bg'): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return lang === 'en' ? 'just now' : 'сега';
  if (m < 60) return lang === 'en' ? `${m}m ago` : `преди ${m}м`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === 'en' ? `${h}h ago` : `преди ${h}ч`;
  const d = Math.floor(h / 24);
  if (d < 7) return lang === 'en' ? `${d}d ago` : `преди ${d}д`;
  return new Date(iso).toLocaleDateString();
}

function iconForType(type: string): string {
  switch (type) {
    case 'friend_request': return '👋';
    case 'friend_accepted': return '🎉';
    case 'friend_overtook': return '⚡';
    default: return '🔔';
  }
}

export function NotificationBell({ variant = 'sidebar' }: { variant?: 'sidebar' | 'mobile' }) {
  const { token } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setUnread(d.count ?? 0);
    } catch {}
  }, [token]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setItems(d.notifications ?? []);
      setLoaded(true);
    } catch {}
  }, [token]);

  // Poll unread count every 30s
  useEffect(() => {
    if (!token) return;
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, [token, fetchUnread]);

  // Load list when opening
  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markRead = async (id: number) => {
    if (!token) return;
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(c => Math.max(0, c - 1));
    fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const markAllRead = async () => {
    if (!token) return;
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
    fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const onItemClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  const Bell = (
    <button
      onClick={() => setOpen(o => !o)}
      aria-label={lang === 'en' ? 'Notifications' : 'Известия'}
      className={variant === 'sidebar'
        ? "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        : "relative w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
      }
      style={{
        background: open ? 'hsl(var(--c-primary)/0.18)' : 'var(--c-glass)',
        border: `1px solid ${open ? 'hsl(var(--c-primary)/0.4)' : 'var(--c-border)'}`,
        color: open ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 text-[9px] mono font-black px-1 py-0.5 rounded-full min-w-[16px] text-center"
          style={{ background: 'hsl(var(--c-red))', color: '#fff', border: '2px solid hsl(228, 24%, 10%)', lineHeight: 1 }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );

  return (
    <div className="relative" ref={popoverRef}>
      {Bell}
      {open && (
        <div className={
          variant === 'sidebar'
            ? "absolute left-full ml-2 top-0 w-80 max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl z-50"
            : "fixed left-3 right-3 top-16 max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl z-50"
        }
        style={{ background: 'hsl(228, 24%, 10%)', border: '1px solid rgba(160,140,220,0.2)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="font-bold text-sm" style={{ color: 'hsl(var(--c-fg))' }}>
              🔔 {lang === 'en' ? 'Notifications' : 'Известия'}
            </p>
            {items.some(n => !n.read) && (
              <button onClick={markAllRead}
                className="text-xs font-semibold"
                style={{ color: 'hsl(var(--c-primary))' }}>
                {lang === 'en' ? 'Mark all read' : 'Прочети всички'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 50px)' }}>
            {!loaded ? (
              <p className="text-sm py-6 text-center" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Loading…' : 'Зареждам…'}
              </p>
            ) : items.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'You\'re all caught up.' : 'Нямаш нови известия.'}
                </p>
              </div>
            ) : (
              items.map(n => (
                <button key={n.id} onClick={() => onItemClick(n)}
                  className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 transition-colors"
                  style={{
                    background: n.read ? 'transparent' : 'hsl(var(--c-primary)/0.06)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{iconForType(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight" style={{ color: n.read ? 'hsl(var(--c-fg-muted))' : 'hsl(var(--c-fg))' }}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] mt-1 mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {timeAgo(n.created_at, lang)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'hsl(var(--c-primary))' }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
