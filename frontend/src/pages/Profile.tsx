import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { getLevel, getLevelProgress, LEVELS } from '../types';

function resizeImage(file: File, size = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type NameStatus = 'idle' | 'checking' | 'available' | 'taken';

function Hint({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className="text-xs mt-1.5 font-medium" style={{ color: ok ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
      {ok ? '✓' : '✗'} {text}
    </p>
  );
}

/* SVG ring — avatar is inside, arc shows level % */
function AvatarRing({ pct, src, name, onClick }: { pct: number; src?: string; name?: string; onClick: () => void }) {
  const R = 56; const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center cursor-pointer" onClick={onClick}>
      {/* SVG ring */}
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Track */}
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        {/* Progress arc */}
        <circle cx="70" cy="70" r={R} fill="none"
          stroke="url(#ringGrad)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--c-primary))" />
            <stop offset="100%" stopColor="hsl(var(--c-green))" />
          </linearGradient>
        </defs>
      </svg>
      {/* Avatar circle inside ring */}
      <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0"
        style={{ border: '3px solid hsl(var(--c-bg))' }}>
        {src?.startsWith('data:')
          ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center font-black text-4xl select-none"
              style={{ background: 'linear-gradient(135deg, hsl(var(--c-primary)/0.5), hsl(var(--c-green)/0.35))', color: 'hsl(var(--c-fg))' }}>
              {name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* Small circular progress — used in stat cards */
function MiniRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

export function Profile() {
  const { user, token, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState('');
  const [saveErr, setSaveErr] = useState('');

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwOk, setPwOk] = useState('');
  const [pwErr, setPwErr] = useState('');

  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const level = getLevel(xp);
  const levelPct = getLevelProgress(xp);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);

  const checkName = useCallback(async (val: string) => {
    if (!val.trim() || val.trim() === user?.name || val.trim().length < 2) { setNameStatus('idle'); return; }
    setNameStatus('checking');
    try {
      const res = await fetch(`/api/auth/check-name?name=${encodeURIComponent(val.trim())}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setNameStatus(data.available ? 'available' : 'taken');
    } catch { setNameStatus('idle'); }
  }, [token, user?.name]);

  useEffect(() => {
    const t = setTimeout(() => checkName(name), 500);
    return () => clearTimeout(t);
  }, [name, checkName]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setSaveErr('Please upload an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { setSaveErr('Image must be under 8 MB'); return; }
    setSaveErr('');
    try { setPendingAvatar(await resizeImage(file)); }
    catch { setSaveErr('Could not process image. Please try a different file.'); }
  };

  const handleSave = async () => {
    if (nameStatus === 'taken') return;
    setSaveOk(''); setSaveErr(''); setSaving(true);
    try {
      const updates: { name?: string; avatar?: string } = {};
      if (name.trim() && name.trim() !== user?.name) updates.name = name.trim();
      if (pendingAvatar) updates.avatar = pendingAvatar;
      if (!updates.name && !updates.avatar) { setSaveErr(lang === 'en' ? 'No changes to save' : 'Няма промени'); setSaving(false); return; }
      await updateProfile(updates);
      setPendingAvatar(null);
      setSaveOk(lang === 'en' ? 'Profile saved!' : 'Профилът е запазен!');
    } catch (err) { setSaveErr(err instanceof Error ? err.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleChangePw = async () => {
    setPwOk(''); setPwErr('');
    if (newPw.length < 8) { setPwErr(lang === 'en' ? 'Minimum 8 characters' : 'Минимум 8 символа'); return; }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwOk(lang === 'en' ? 'Password changed!' : 'Паролата е сменена!');
      setCurrentPw(''); setNewPw('');
      setTimeout(() => setPwOpen(false), 1500);
    } catch (err) { setPwErr(err instanceof Error ? err.message : 'Error'); }
    finally { setPwSaving(false); }
  };

  const canSave = nameStatus !== 'taken' && ((name.trim().length >= 2 && name.trim() !== user?.name) || !!pendingAvatar);
  const displayAvatar = pendingAvatar ?? user?.avatar;

  const achievements = [
    { icon: '🌱', en: 'First Steps',  bg: 'Първи стъпки',  sub: '1 XP',          unlocked: xp > 0 },
    { icon: '⚡', en: 'Power User',   bg: 'Активен',        sub: '500 XP',        unlocked: xp >= 500 },
    { icon: '📚', en: 'Scholar',      bg: 'Учен',           sub: '1 000 XP',      unlocked: xp >= 1000 },
    { icon: '🏆', en: 'Champion',     bg: 'Шампион',        sub: '2 500 XP',      unlocked: xp >= 2500 },
    { icon: '🔥', en: 'On Fire',      bg: 'В огъня',        sub: '3d streak',     unlocked: streak >= 3 },
    { icon: '💫', en: 'Week Warrior', bg: 'Воин',           sub: '7d streak',     unlocked: streak >= 7 },
    { icon: '💎', en: 'Diamond',      bg: 'Диамант',        sub: '30d streak',    unlocked: streak >= 30 },
    { icon: '🚀', en: 'Max Level',    bg: 'Макс. ниво',     sub: 'Level 5',       unlocked: level.level >= 5 },
  ];
  const earnedCount = achievements.filter(a => a.unlocked).length;

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', { year: 'numeric', month: 'long' })
    : null;

  /* streak % toward 7-day goal for mini ring */
  const streakPct = Math.min(100, Math.round((streak / 7) * 100));

  return (
    <div className="relative min-h-screen pb-24 sm:pb-8">
      <FloatingOrbs />
      <div className="relative max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-3" style={{ zIndex: 1 }}>

        {/* ━━━ HERO CARD ━━━ */}
        <div className="animate-fade-up" style={{
          borderRadius: '20px',
          background: 'linear-gradient(160deg, rgba(110,90,230,0.18) 0%, rgba(50,195,155,0.10) 60%, rgba(235,140,55,0.07) 100%)',
          border: '1px solid rgba(160,140,220,0.22)',
          backdropFilter: 'blur(24px)',
          overflow: 'hidden',
        }}>

          {/* Top strip — iris bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))' }} />

          <div className="p-6">
            {/* Avatar + name side by side */}
            <div className="flex items-center gap-5 mb-6">
              {/* Avatar with ring */}
              <div className="relative flex-shrink-0">
                <AvatarRing pct={levelPct} src={displayAvatar} name={user?.name} onClick={() => fileRef.current?.click()} />
                {/* Level badge — sits bottom-right of ring */}
                <div className="absolute bottom-0 right-0 flex items-center justify-center rounded-full text-xs font-black"
                  style={{
                    width: '28px', height: '28px',
                    background: 'linear-gradient(135deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
                    color: '#fff',
                    border: '2px solid hsl(var(--c-bg))',
                    fontSize: '11px',
                  }}>
                  {level.level}
                </div>
                {/* Pencil badge */}
                <button onClick={() => fileRef.current?.click()}
                  className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'hsl(var(--c-bg-elevated))', border: '2px solid hsl(var(--c-bg))', color: 'hsl(var(--c-fg-muted))' }}>
                  <PencilIcon />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>

              {/* Name / email / join */}
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-2xl leading-tight truncate" style={{ color: 'hsl(var(--c-fg))', letterSpacing: '-0.02em' }}>
                  {user?.name}
                </h1>
                <p className="text-sm truncate mt-0.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>{user?.email}</p>
                {joinedDate && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {lang === 'en' ? 'Member since' : 'Член от'} {joinedDate}
                  </p>
                )}
                {/* Level progress text */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))', transition: 'width 0.7s ease' }} />
                  </div>
                  <span className="mono text-xs flex-shrink-0" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {nextLevel ? `${(nextLevel.minXp - xp).toLocaleString()} XP` : '🎉 MAX'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Stat cards row ── */}
            <div className="grid grid-cols-3 gap-3">
              {/* XP */}
              <div className="rounded-2xl p-3 flex flex-col gap-1"
                style={{ background: 'rgba(110,90,230,0.12)', border: '1px solid rgba(110,90,230,0.22)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--c-primary))' }}>XP</span>
                <span className="mono font-black text-xl leading-none" style={{ color: 'hsl(var(--c-fg))' }}>
                  {xp >= 1000 ? `${(xp/1000).toFixed(1)}k` : xp}
                </span>
                <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {level.label[lang]}
                </span>
              </div>

              {/* Streak */}
              <div className="rounded-2xl p-3 flex flex-col gap-1 relative overflow-hidden"
                style={{ background: 'rgba(235,140,55,0.12)', border: '1px solid rgba(235,140,55,0.22)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--c-orange))' }}>
                  {lang === 'en' ? 'Streak' : 'Поред'}
                </span>
                <div className="flex items-end justify-between">
                  <span className="mono font-black text-xl leading-none" style={{ color: 'hsl(var(--c-fg))' }}>
                    🔥 {streak}
                  </span>
                  <MiniRing pct={streakPct} color="hsl(var(--c-orange))" size={36} />
                </div>
                <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'days' : 'дни'}
                </span>
              </div>

              {/* Badges */}
              <div className="rounded-2xl p-3 flex flex-col gap-1"
                style={{ background: 'rgba(245,210,60,0.10)', border: '1px solid rgba(245,210,60,0.20)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--c-gold))' }}>
                  {lang === 'en' ? 'Badges' : 'Значки'}
                </span>
                <div className="flex items-end justify-between">
                  <span className="mono font-black text-xl leading-none" style={{ color: 'hsl(var(--c-fg))' }}>
                    {earnedCount}
                  </span>
                  <MiniRing pct={Math.round((earnedCount / achievements.length) * 100)} color="hsl(var(--c-gold))" size={36} />
                </div>
                <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  / {achievements.length} {lang === 'en' ? 'total' : 'всичко'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ PRO PLAN ━━━ */}
        <div className="animate-fade-up delay-100 relative overflow-hidden" style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(110,90,230,0.25) 0%, rgba(50,195,155,0.14) 50%, rgba(235,140,55,0.10) 100%)',
          border: '1px solid rgba(110,90,230,0.40)',
          padding: '1.25rem',
        }}>
          {/* glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(110,90,230,0.22), transparent 70%)', filter: 'blur(24px)' }} />
          <div className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(235,140,55,0.16), transparent 70%)', filter: 'blur(24px)' }} />

          {/* Header row */}
          <div className="flex items-start justify-between mb-3 relative">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-black px-2.5 py-1 rounded-full tracking-wide"
                  style={{ background: 'rgba(110,90,230,0.3)', color: 'hsl(var(--c-primary))', border: '1px solid rgba(110,90,230,0.5)' }}>
                  ✦ PRO
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(235,140,55,0.25)', color: 'hsl(var(--c-orange))' }}>
                  50% OFF
                </span>
              </div>
              <p className="font-black text-lg leading-tight" style={{ color: 'hsl(var(--c-fg))', letterSpacing: '-0.01em' }}>
                {lang === 'en' ? 'Unlock everything.' : 'Отключи всичко.'}
              </p>
              <p className="text-sm font-semibold" style={{ color: 'hsl(var(--c-green))' }}>
                {lang === 'en' ? 'Level up 2× faster' : 'Развивай се 2× по-бързо'}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="mono font-black text-2xl" style={{ color: 'hsl(var(--c-fg))' }}>$4.99</div>
              <div className="text-xs line-through opacity-50" style={{ color: 'hsl(var(--c-fg-muted))' }}>$9.99</div>
              <div className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>/mo</div>
            </div>
          </div>

          {/* Features — 2 col grid fits mobile */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 relative">
            {[
              { en: 'Unlimited hearts',        bg: 'Без ограничения' },
              { en: '2× XP on every lesson',   bg: '2× XP за урок' },
              { en: 'All premium modules',     bg: 'Всички модули' },
              { en: 'AI money coach',          bg: 'AI треньор' },
            ].map(f => (
              <div key={f.en} className="flex items-center gap-1.5 text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                <span style={{ color: 'hsl(var(--c-green))', fontWeight: 700 }}>✓</span>
                {lang === 'en' ? f.en : f.bg}
              </div>
            ))}
          </div>

          <button className="w-full relative font-bold text-sm py-3 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
              color: '#fff',
              border: 'none',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = '')}>
            ⚡ {lang === 'en' ? 'Try Pro free for 7 days' : 'Пробвай Pro безплатно 7 дни'}
          </button>
          <p className="text-center text-xs mt-2 relative" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Cancel anytime · Offer ends in 2d 14h' : 'Откажи по всяко време'}
          </p>
        </div>

        {/* ━━━ ACHIEVEMENTS ━━━ */}
        <div className="animate-fade-up delay-200" style={{
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(160,140,220,0.13)',
          backdropFilter: 'blur(20px)',
          padding: '1.25rem',
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Achievements' : 'Постижения'}
            </h2>
            <div className="flex items-center gap-1.5">
              <MiniRing pct={Math.round((earnedCount / achievements.length) * 100)} color="hsl(var(--c-green))" size={28} />
              <span className="mono text-xs font-bold" style={{ color: 'hsl(var(--c-green))' }}>
                {earnedCount}/{achievements.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {achievements.map(a => (
              <div key={a.en} className="flex flex-col items-center gap-1 rounded-2xl p-2.5 text-center transition-all"
                style={{
                  background: a.unlocked ? 'rgba(50,195,155,0.10)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${a.unlocked ? 'rgba(50,195,155,0.28)' : 'rgba(160,140,220,0.10)'}`,
                  opacity: a.unlocked ? 1 : 0.35,
                  boxShadow: a.unlocked ? '0 2px 12px rgba(50,195,155,0.10)' : 'none',
                }}>
                <span className="text-2xl leading-none">{a.unlocked ? a.icon : '🔒'}</span>
                <span className="text-xs font-bold leading-tight mt-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {lang === 'en' ? a.en : a.bg}
                </span>
                <span className="text-xs leading-tight" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{a.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ━━━ ACCOUNT SETTINGS ━━━ */}
        <div className="animate-fade-up delay-300" style={{
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(160,140,220,0.13)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(160,140,220,0.13)' }}>
            <h2 className="font-extrabold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Account Settings' : 'Настройки на акаунта'}
            </h2>
          </div>

          {/* Display name */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(160,140,220,0.13)' }}>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Display name' : 'Показвано име'}
            </label>
            <div className="flex gap-2">
              <input className="input-field flex-1" value={name}
                onChange={e => { setName(e.target.value); setSaveOk(''); setSaveErr(''); }}
                placeholder={lang === 'en' ? 'Your name' : 'Твоето име'} />
              <button
                onClick={handleSave} disabled={saving || !canSave}
                className="flex-shrink-0 text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                style={{
                  background: canSave ? 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))' : 'rgba(255,255,255,0.06)',
                  color: canSave ? '#fff' : 'hsl(var(--c-fg-subtle))',
                  border: 'none', cursor: canSave ? 'pointer' : 'default',
                }}>
                {saving
                  ? <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />{lang === 'en' ? 'Saving' : 'Запазва'}</span>
                  : (lang === 'en' ? 'Save' : 'Запази')}
              </button>
            </div>
            {nameStatus === 'checking' && <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>· Checking…</p>}
            {nameStatus === 'available' && name.trim() !== user?.name && <Hint ok text={lang === 'en' ? 'Name is available' : 'Името е свободно'} />}
            {nameStatus === 'taken' && <Hint ok={false} text={lang === 'en' ? 'Name already taken' : 'Името вече е заето'} />}
            {saveOk && <Hint ok text={saveOk} />}
            {saveErr && <Hint ok={false} text={saveErr} />}
          </div>

          {/* Photo upload */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(160,140,220,0.13)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar preview */}
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: '2px solid rgba(160,140,220,0.2)' }}>
                  {displayAvatar?.startsWith('data:')
                    ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center font-bold text-lg"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--c-primary)/0.3), hsl(var(--c-green)/0.2))', color: 'hsl(var(--c-fg))' }}>
                        {user?.name?.[0]?.toUpperCase()}
                      </div>}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
                    {lang === 'en' ? 'Profile photo' : 'Снимка'}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {pendingAvatar ? (lang === 'en' ? 'Ready — press Save' : 'Готово') : 'JPG · PNG · max 8 MB'}
                  </p>
                </div>
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg))', border: '1px solid rgba(160,140,220,0.2)' }}>
                {lang === 'en' ? 'Upload' : 'Качи'}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="px-5 py-4">
            <button className="w-full flex items-center justify-between text-left"
              onClick={() => { setPwOpen(p => !p); setPwErr(''); setPwOk(''); }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
                  {lang === 'en' ? 'Password' : 'Парола'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'Change your account password' : 'Смени паролата'}
                </p>
              </div>
              <span style={{ color: 'hsl(var(--c-fg-subtle))' }}><ChevronIcon open={pwOpen} /></span>
            </button>

            {pwOpen && (
              <div className="mt-4 space-y-3 pt-4" style={{ borderTop: '1px solid rgba(160,140,220,0.13)' }}>
                {[
                  { label: lang === 'en' ? 'Current password' : 'Текуща парола', value: currentPw, set: setCurrentPw, show: showCurrent, toggle: setShowCurrent, ac: 'current-password' },
                  { label: lang === 'en' ? 'New password'     : 'Нова парола',   value: newPw,     set: setNewPw,     show: showNew,     toggle: setShowNew,     ac: 'new-password' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{f.label}</label>
                    <div className="relative">
                      <input type={f.show ? 'text' : 'password'} className="input-field pr-11"
                        value={f.value} onChange={e => { f.set(e.target.value); setPwErr(''); setPwOk(''); }}
                        placeholder="••••••••" autoComplete={f.ac} />
                      <button type="button" onClick={() => f.toggle(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                        style={{ color: 'hsl(var(--c-fg-muted))' }}>
                        {f.show ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                ))}
                {newPw.length > 0 && <Hint ok={newPw.length >= 8} text={newPw.length >= 8 ? (lang === 'en' ? 'Strong password' : 'Силна парола') : (lang === 'en' ? `${8 - newPw.length} more chars` : `Нужни са ${8 - newPw.length} символа`)} />}
                {pwOk && <Hint ok text={pwOk} />}
                {pwErr && <Hint ok={false} text={pwErr} />}
                <div className="flex gap-2 pt-1">
                  <button className="btn-primary flex-1" onClick={handleChangePw} disabled={pwSaving || !currentPw || newPw.length < 8}>
                    {pwSaving
                      ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{lang === 'en' ? 'Changing…' : 'Смяна…'}</span>
                      : (lang === 'en' ? 'Update password' : 'Обнови паролата')}
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))', border: '1px solid rgba(160,140,220,0.15)' }}
                    onClick={() => { setPwOpen(false); setCurrentPw(''); setNewPw(''); setPwErr(''); setPwOk(''); }}>
                    {lang === 'en' ? 'Cancel' : 'Отказ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
