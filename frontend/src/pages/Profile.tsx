import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { OctopusAvatar } from '../components/OctopusAvatar';
import { CoinIcon } from '../components/CoinIcon';
import { getCatalogItem } from '../shared/catalogClient';
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
type Tab = 'overview' | 'achievements' | 'settings';

function Hint({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className="text-xs mt-1.5 font-medium" style={{ color: ok ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
      {ok ? '✓' : '✗'} {text}
    </p>
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

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconFlame() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4H4a2 2 0 0 0 0 4c0 2.67 1.5 5 5 6" />
      <path d="M17 4h3a2 2 0 0 1 0 4c0 2.67-1.5 5-5 6" />
      <rect x="7" y="2" width="10" height="9" rx="2" />
    </svg>
  );
}
function IconCrown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20M5 20l2-8 5 4 5-4 2 8" />
      <circle cx="12" cy="8" r="2" />
      <circle cx="4" cy="10" r="2" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}
function IconPeople() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  badge: string;
  value: string;
  label: string;
  color: 'purple' | 'orange' | 'teal' | 'gold';
}

function StatCard({ icon, badge, value, label, color }: StatCardProps) {
  const palette = {
    purple: { bg: 'hsl(var(--c-primary)/0.10)', border: 'hsl(var(--c-primary)/0.22)', text: 'hsl(var(--c-primary))' },
    orange: { bg: 'hsl(var(--c-orange)/0.10)',  border: 'hsl(var(--c-orange)/0.22)',  text: 'hsl(var(--c-orange))' },
    teal:   { bg: 'hsl(var(--c-green)/0.10)',   border: 'hsl(var(--c-green)/0.22)',   text: 'hsl(var(--c-green))' },
    gold:   { bg: 'hsl(var(--c-gold)/0.10)',    border: 'hsl(var(--c-gold)/0.22)',    text: 'hsl(var(--c-gold))' },
  };
  const c = palette[color];
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start justify-between mb-1">
        <span style={{ color: c.text }}>{icon}</span>
        {badge && <span className="text-xs font-semibold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{badge}</span>}
      </div>
      <div className="mono font-black text-2xl leading-none" style={{ color: c.text }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</div>
    </div>
  );
}

function StreakFreezeCard() {
  const { user, token, refreshUser } = useAuth();
  const { lang } = useLang();
  const [buying, setBuying] = useState(false);
  const [info, setInfo] = useState<{ cost: number; max: number; stock: number; xp: number; can_afford: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/freeze/info', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setInfo)
      .catch(() => {});
  }, [token, user?.streak_freezes, user?.xp]);

  const cost = info?.cost ?? 100;
  const max = info?.max ?? 3;
  const stock = user?.streak_freezes ?? info?.stock ?? 0;
  const xp = user?.xp ?? info?.xp ?? 0;
  const atMax = stock >= max;
  const canAfford = !atMax && xp >= cost;

  const buy = async () => {
    if (!token || buying) return;
    setBuying(true); setErr(null);
    try {
      const res = await fetch('/api/freeze/buy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error === 'insufficient_xp'
          ? (lang === 'en' ? `Need ${data.required} XP — you have ${data.have}` : `Нужни ${data.required} XP — имаш ${data.have}`)
          : data.error === 'max_freezes'
            ? (lang === 'en' ? `Max ${max} freezes` : `Максимум ${max} замразявания`)
            : data.error ?? 'Error');
      } else {
        await refreshUser().catch(() => {});
        setInfo(prev => prev ? { ...prev, stock: data.streak_freezes, xp: data.xp, can_afford: data.xp >= cost && data.streak_freezes < max } : prev);
      }
    } catch {
      setErr('Network error');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'hsl(200, 95%, 50%, 0.15)', border: '1px solid hsl(200, 95%, 50%, 0.35)' }}>
          ❄️
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Streak Freezes' : 'Замразявания на стрийк'}
          </h3>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en'
              ? 'Auto-saves your streak if you miss a day.'
              : 'Автоматично пази стрийка ти при пропуснат ден.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className="flex-1 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: i < stock ? 'hsl(200, 95%, 50%, 0.18)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${i < stock ? 'hsl(200, 95%, 50%)' : 'var(--c-border)'}`,
            }}>
            {i < stock ? '❄️' : '·'}
          </div>
        ))}
      </div>

      {err && (
        <p className="text-xs mb-3" style={{ color: 'hsl(var(--c-red))' }}>{err}</p>
      )}

      <button
        onClick={buy}
        disabled={!canAfford || buying}
        className="btn-primary w-full"
        style={{ opacity: !canAfford ? 0.55 : 1 }}>
        {atMax
          ? (lang === 'en' ? 'Max reached' : 'Максимум достигнат')
          : buying
            ? '…'
            : (lang === 'en' ? `Buy 1 for ${cost} XP` : `Купи 1 за ${cost} XP`)}
      </button>

      <p className="text-[11px] mt-2 text-center mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'Your XP' : 'Твоят XP'}: {xp.toLocaleString()}
      </p>
    </div>
  );
}

export function Profile() {
  const { user, token, updateProfile, changePassword, refreshUser } = useAuth();
  const { lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('overview');
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

  const [lessonsTotal, setLessonsTotal] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [leagueRank, setLeagueRank] = useState<number | null>(null);

  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const level = getLevel(xp);
  const levelPct = getLevelProgress(xp);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);

  useEffect(() => {
    if (!token) return;
    fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const mods = data.modules ?? [];
        let total = 0, done = 0;
        for (const mod of mods) {
          total += mod.lessons.length;
          done += mod.lessons.filter((l: { completed: boolean }) => l.completed).length;
        }
        setLessonsTotal(total);
        setLessonsDone(done);
      })
      .catch(() => {});
    fetch('/api/auth/league', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const me = (d.leaderboard ?? []).find((u: { isYou: boolean; rank: number }) => u.isYou);
        if (me) setLeagueRank(me.rank);
      })
      .catch(() => {});
  }, [token]);

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
    { icon: '🌱', color: '#16a34a', en: 'First Steps',  bg: 'Първи стъпки',  sub: '1 XP',       unlocked: xp > 0 },
    { icon: '🔥', color: '#ea580c', en: 'On Fire',      bg: 'В огъня',        sub: '3d streak',  unlocked: streak >= 3 },
    { icon: '⚡', color: '#7c3aed', en: 'Power User',   bg: 'Активен',        sub: '500 XP',     unlocked: xp >= 500 },
    { icon: '📚', color: '#0369a1', en: 'Scholar',      bg: 'Учен',           sub: '1 000 XP',   unlocked: xp >= 1000 },
    { icon: '💫', color: '#7c3aed', en: 'Week Warrior', bg: 'Воин',           sub: '7d streak',  unlocked: streak >= 7 },
    { icon: '🏆', color: '#b45309', en: 'Champion',     bg: 'Шампион',        sub: '2 500 XP',   unlocked: xp >= 2500 },
    { icon: '💎', color: '#0e7490', en: 'Diamond',      bg: 'Диамант',        sub: '30d streak', unlocked: streak >= 30 },
    { icon: '🚀', color: '#6d28d9', en: 'Max Level',    bg: 'Макс. ниво',     sub: 'Level 5',    unlocked: level.level >= 5 },
  ];
  const earnedCount = achievements.filter(a => a.unlocked).length;

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', { year: 'numeric', month: 'long' })
    : null;

  const lessonsPct = lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

  const tabLabels: Record<Tab, { en: string; bg: string }> = {
    overview:     { en: 'Overview',      bg: 'Преглед' },
    achievements: { en: 'Achievements',  bg: 'Постижения' },
    settings:     { en: 'Settings',      bg: 'Настройки' },
  };

  return (
    <div className="relative pb-8">
      <div className="md:hidden"><FloatingOrbs /></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-0 py-8 md:py-2" style={{ zIndex: 1 }}>

        {/* ── PROFILE HEADER ── */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 md:p-7 mb-5 md:mb-6 animate-fade-up">

          <div className="flex flex-col sm:flex-row sm:items-start gap-5 md:gap-6">
            {/* Square avatar */}
            <div className="relative flex-shrink-0 self-start">
              <button onClick={() => fileRef.current?.click()}
                className="block w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden"
                style={{ border: '3px solid hsl(var(--c-bg-elevated))' }}>
                {displayAvatar?.startsWith('data:')
                  ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-black text-4xl select-none"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--c-primary)/0.5), hsl(var(--c-green)/0.4))', color: 'hsl(var(--c-fg))' }}>
                      {user?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>}
              </button>
              {/* Level badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black whitespace-nowrap"
                style={{ background: '#d97706', color: '#fff', fontSize: '11px', border: '2px solid hsl(var(--c-bg-elevated))' }}>
                🏅 Lv.{level.level}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {/* Info block */}
            <div className="flex-1 min-w-0 pt-1">
              {/* Name + level badge + action buttons */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-black text-2xl md:text-3xl leading-tight" style={{ color: 'hsl(var(--c-fg))', letterSpacing: '-0.02em' }}>
                    {user?.name}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.3)' }}>
                    ✦ {level.label[lang]}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
                    {lang === 'en' ? 'Share profile' : 'Сподели'}
                  </button>
                  <button onClick={() => setTab('settings')}
                    className="text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-all"
                    style={{ background: 'hsl(var(--c-primary))', color: '#fff', border: 'none' }}>
                    {lang === 'en' ? 'Edit profile' : 'Редактирай'}
                  </button>
                </div>
              </div>

              {/* Email + join date */}
              <p className="text-sm mb-0.5 truncate" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                @{user?.name?.toLowerCase()} · {user?.email}
              </p>
              {joinedDate && (
                <p className="text-xs mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  📅 {lang === 'en' ? 'Joined' : 'Присъединил се'} {joinedDate}
                </p>
              )}

              {/* Level progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  <span className="font-semibold" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    Level {level.level} · {level.label[lang]}
                  </span>
                  <span>
                    {xp.toLocaleString()} / {nextLevel ? nextLevel.minXp.toLocaleString() : '–'} XP{nextLevel ? ` to Lv.${level.level + 1}` : ' MAX'}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))', transition: 'width 0.7s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── OCTOPUS MASCOT + WALLET ── */}
        {(() => {
          const hatItem  = getCatalogItem(user?.equipped_hat);
          const faceItem = getCatalogItem(user?.equipped_face);
          const bodyItem = getCatalogItem(user?.equipped_body);
          const wornCount = [hatItem, faceItem, bodyItem].filter(Boolean).length;
          return (
            <div className="glass-card rounded-2xl p-5 mb-5 md:mb-6 flex items-center gap-4 animate-fade-up">
              <div className="flex-shrink-0">
                <OctopusAvatar size={92}
                  hatEmoji={hatItem?.emoji ?? null}
                  faceEmoji={faceItem?.emoji ?? null}
                  bodyEmoji={bodyItem?.emoji ?? null} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'Your mascot' : 'Твоят талисман'}
                </p>
                <p className="text-base font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
                  {wornCount === 0
                    ? (lang === 'en' ? 'Naked octopus 🫧' : 'Гол октопод 🫧')
                    : (lang === 'en'
                        ? `Wearing ${wornCount} ${wornCount === 1 ? 'item' : 'items'}`
                        : `Носи ${wornCount} ${wornCount === 1 ? 'предмет' : 'предмета'}`)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold mono flex items-center gap-1"
                    style={{ background: 'hsl(var(--c-orange)/0.15)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.3)' }}>
                    <CoinIcon size={14} /> {(user?.coins ?? 0).toLocaleString()}
                  </span>
                  <Link to="/shop"
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(35, 90%, 55%))', color: '#1a1f2e' }}>
                    🛍️ {lang === 'en' ? 'Visit shop' : 'Към магазина'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── TABS ── */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl animate-fade-up"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--c-border)', width: 'fit-content' }}>
          {(['overview', 'achievements', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: tab === t ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-subtle))',
              }}>
              {tabLabels[t][lang]}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6 animate-fade-up">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* At a glance */}
              <div>
                <h2 className="font-extrabold text-xl mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
                  {lang === 'en' ? 'At a glance' : 'С един поглед'}
                </h2>
                <p className="text-sm mb-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'Your lifetime stats on Octolio' : 'Твоята статистика в Octolio'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  <StatCard
                    icon={<IconBolt />}
                    badge={lang === 'en' ? '+today' : '+днес'}
                    value={xp.toLocaleString()}
                    label={lang === 'en' ? 'Total XP' : 'Общо XP'}
                    color="purple"
                  />
                  <StatCard
                    icon={<IconFlame />}
                    badge={`${lang === 'en' ? 'Best' : 'Рекорд'}: ${streak}`}
                    value={streak.toString()}
                    label={lang === 'en' ? 'Day streak' : 'Поредни дни'}
                    color="orange"
                  />
                  <StatCard
                    icon={<IconBook />}
                    badge={lessonsTotal > 0 ? `${lessonsPct}% ${lang === 'en' ? 'complete' : 'завършени'}` : '–'}
                    value={`${lessonsDone}/${lessonsTotal}`}
                    label={lang === 'en' ? 'Lessons done' : 'Урока завършени'}
                    color="teal"
                  />
                  <StatCard
                    icon={<IconTrophy />}
                    badge={`${Math.round((earnedCount / achievements.length) * 100)}% ${lang === 'en' ? 'collected' : 'събрани'}`}
                    value={`${earnedCount}/${achievements.length}`}
                    label={lang === 'en' ? 'Badges earned' : 'Значки спечелени'}
                    color="gold"
                  />
                  <StatCard
                    icon={<IconCrown />}
                    badge={leagueRank ? `Rank #${leagueRank}` : '–'}
                    value={lang === 'en' ? 'Gold' : 'Злато'}
                    label={lang === 'en' ? 'League' : 'Лига'}
                    color="purple"
                  />
                  <StatCard
                    icon={<IconPeople />}
                    badge={''}
                    value={'–'}
                    label={lang === 'en' ? 'Friends' : 'Приятели'}
                    color="teal"
                  />
                </div>
              </div>

              {/* Streak Freeze shop */}
              <StreakFreezeCard />

              {/* Achievements */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-extrabold text-xl" style={{ color: 'hsl(var(--c-fg))' }}>
                      {lang === 'en' ? 'Achievements' : 'Постижения'}
                    </h2>
                    <p className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {earnedCount} {lang === 'en' ? 'of' : 'от'} {achievements.length} {lang === 'en' ? 'earned' : 'спечелени'}
                    </p>
                  </div>
                  <button className="text-sm font-semibold px-3.5 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}
                    onClick={() => setTab('achievements')}>
                    {lang === 'en' ? 'View all →' : 'Всички →'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {achievements.map(a => (
                    <div key={a.en} className="rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center relative overflow-hidden"
                      style={{
                        background: a.unlocked ? `${a.color}1a` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${a.unlocked ? `${a.color}40` : 'var(--c-border)'}`,
                      }}>
                      {a.unlocked && (
                        <div className="absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'hsl(var(--c-green))', color: '#fff', fontSize: '9px', lineHeight: 1.4 }}>
                          ✓ EARNED
                        </div>
                      )}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mt-1"
                        style={{ background: a.unlocked ? `${a.color}30` : 'rgba(255,255,255,0.05)' }}>
                        {a.unlocked ? a.icon : '🔒'}
                      </div>
                      <span className="text-xs font-bold leading-tight" style={{ color: a.unlocked ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-subtle))' }}>
                        {lang === 'en' ? a.en : a.bg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Subscription card — different content for Pro vs Free */}
              {user?.is_pro ? (
                <SubscriptionCard token={token} lang={lang} />
              ) : (
                <ProUpsellCard token={token} lang={lang} />
              )}

              {/* League card */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full tracking-wider"
                    style={{ background: 'rgba(245,200,50,0.15)', color: 'hsl(var(--c-gold))', border: '1px solid rgba(245,200,50,0.3)' }}>
                    🏅 {lang === 'en' ? 'GOLD LEAGUE' : 'ЗЛАТО'}
                  </span>
                </div>
                <p className="font-extrabold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
                  {leagueRank
                    ? (lang === 'en' ? `You're #${leagueRank} this week` : `Ти си #${leagueRank} тази седмица`)
                    : (lang === 'en' ? 'Join the race!' : 'Влез в надбягването!')}
                </p>
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'Top 3 advance to the next league' : 'Топ 3 се качват в следващата лига'}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {tab === 'achievements' && (
          <div className="animate-fade-up">
            <h2 className="font-extrabold text-xl mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Achievements' : 'Постижения'}
            </h2>
            <p className="text-sm mb-5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {earnedCount} {lang === 'en' ? 'of' : 'от'} {achievements.length} {lang === 'en' ? 'earned' : 'спечелени'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
              {achievements.map(a => (
                <div key={a.en} className="rounded-2xl p-5 flex flex-col items-center gap-2.5 text-center relative overflow-hidden"
                  style={{
                    background: a.unlocked ? `${a.color}1a` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${a.unlocked ? `${a.color}40` : 'var(--c-border)'}`,
                  }}>
                  {a.unlocked && (
                    <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'hsl(var(--c-green))', color: '#fff', fontSize: '10px' }}>
                      ✓ EARNED
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mt-1"
                    style={{ background: a.unlocked ? `${a.color}30` : 'rgba(255,255,255,0.05)' }}>
                    {a.unlocked ? a.icon : '🔒'}
                  </div>
                  <span className="font-bold" style={{ color: a.unlocked ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-subtle))' }}>
                    {lang === 'en' ? a.en : a.bg}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{a.sub}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="glass-card max-w-lg animate-fade-up rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h2 className="font-extrabold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
                {lang === 'en' ? 'Account Settings' : 'Настройки на акаунта'}
              </h2>
            </div>

            {/* Plan section */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <PlanSection isPro={user?.is_pro ?? false} token={token} lang={lang} />
            </div>

            {/* Display name */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
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
                    border: 'none',
                    cursor: canSave ? 'pointer' : 'default',
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
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: '2px solid var(--c-border)' }}>
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
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg))', border: '1px solid var(--c-border)' }}>
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
                <div className="mt-4 space-y-3 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
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
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))', border: '1px solid var(--c-border)' }}
                      onClick={() => { setPwOpen(false); setCurrentPw(''); setNewPw(''); setPwErr(''); setPwOk(''); }}>
                      {lang === 'en' ? 'Cancel' : 'Отказ'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Plan section in Settings tab — shows current plan + CTA ─── */
function PlanSection({ isPro, token, lang }: { isPro: boolean; token: string | null; lang: 'en' | 'bg' }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const endpoint = isPro ? '/api/stripe/portal' : '/api/stripe/checkout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(data.error ?? 'Request failed'); setLoading(false); }
    } catch {
      alert('Network error');
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'Plan' : 'План'}
      </label>

      {/* Status row — stacks on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-black px-2.5 py-1 rounded-full tracking-wider flex-shrink-0"
            style={{
              background: isPro ? 'hsl(var(--c-primary)/0.2)' : 'hsl(var(--c-fg-subtle)/0.12)',
              color: isPro ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
              border: `1px solid ${isPro ? 'hsl(var(--c-primary)/0.4)' : 'hsl(var(--c-fg-subtle)/0.25)'}`,
            }}>
            {isPro ? '✦ PRO' : (lang === 'en' ? 'FREE' : 'БЕЗПЛАТЕН')}
          </span>
          <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--c-fg))' }}>
            {isPro
              ? (lang === 'en' ? 'Octolio Pro' : 'Octolio Pro')
              : (lang === 'en' ? 'Free plan' : 'Безплатен план')}
          </p>
        </div>
        <button
          onClick={handleClick}
          disabled={loading}
          className="text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 w-full sm:w-auto flex-shrink-0"
          style={{
            background: isPro
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
            color: isPro ? 'hsl(var(--c-fg))' : '#fff',
            border: isPro ? '1px solid var(--c-border)' : 'none',
          }}>
          {loading
            ? (lang === 'en' ? 'Opening…' : 'Отваряне…')
            : isPro
              ? (lang === 'en' ? 'Manage' : 'Управление')
              : `✦ ${lang === 'en' ? 'Upgrade' : 'Надгради'}`}
        </button>
      </div>

      {/* Helper text below */}
      <p className="text-xs mt-2.5 leading-relaxed" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {isPro
          ? (lang === 'en'
              ? 'Manage payment, view invoices, or cancel anytime. Cancellation takes effect at the end of the billing period.'
              : 'Управлявай плащане, виж фактури или откажи. Отказът влиза в сила в края на периода.')
          : (lang === 'en'
              ? 'Unlock all premium modules, 2× XP and AI coach for €4.99/month. 7-day free trial.'
              : 'Отключи всички премиум модули, 2× XP и AI треньор за €4.99/месец. 7 дни безплатен пробен период.')}
      </p>
    </div>
  );
}

/* ─── Pro upsell card (free users) ─── */
function ProUpsellCard({ token, lang }: { token: string | null; lang: 'en' | 'bg' }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(data.error ?? 'Checkout failed'); setLoading(false); }
    } catch {
      alert('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5"
      style={{ border: '1px solid hsl(var(--c-gold)/0.35)', boxShadow: '0 0 32px hsl(var(--c-gold)/0.08)' }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--c-primary)/0.18), transparent 70%)', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--c-gold)/0.14), transparent 70%)', filter: 'blur(20px)' }} />

      <div className="flex items-center gap-2 mb-3 relative">
        <span className="text-xs font-black px-2.5 py-1 rounded-full tracking-wider"
          style={{ background: 'hsl(var(--c-primary)/0.25)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.45)' }}>
          OCTOLIO PRO
        </span>
        <span className="text-xs font-bold tracking-wider" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          LIMITED · 50% OFF
        </span>
      </div>

      <p className="font-black text-xl leading-tight mb-0.5 relative" style={{ color: 'hsl(var(--c-fg))' }}>
        {lang === 'en' ? 'Unlock everything.' : 'Отключи всичко.'}
      </p>
      <p className="font-black text-xl leading-tight mb-4 relative">
        <span style={{ color: 'hsl(var(--c-fg))' }}>{lang === 'en' ? 'Level up ' : 'Развивай се '}</span>
        <span style={{ color: 'hsl(var(--c-gold))' }}>2× {lang === 'en' ? 'faster.' : 'по-бързо.'}</span>
      </p>

      <div className="space-y-2 mb-5 relative">
        {[
          { icon: '✦',  en: 'All premium modules unlocked',  bg: 'Всички модули отключени' },
          { icon: '⚡', en: '2× XP on every lesson',         bg: '2× XP за всеки урок' },
          { icon: '🤖', en: 'Personal money coach AI',       bg: 'Личен AI финансов треньор' },
          { icon: '🚫', en: 'Ad-free experience',            bg: 'Без реклами' },
        ].map(f => (
          <div key={f.en} className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            <span style={{ fontSize: '13px', width: '16px', textAlign: 'center', flexShrink: 0 }}>{f.icon}</span>
            {lang === 'en' ? f.en : f.bg}
          </div>
        ))}
      </div>

      <div className="flex items-baseline gap-2 mb-4 relative">
        <span className="mono font-black text-2xl" style={{ color: 'hsl(var(--c-fg))' }}>€4.99</span>
        <span className="text-sm line-through" style={{ color: 'hsl(var(--c-fg-subtle))' }}>€9.99</span>
        <span className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>/month</span>
      </div>

      <button onClick={handleUpgrade} disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm relative transition-all disabled:opacity-50"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
          color: '#fff',
          border: 'none',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}>
        {loading
          ? (lang === 'en' ? 'Opening checkout…' : 'Отваряне…')
          : `✦ ${lang === 'en' ? 'Try Pro free for 7 days' : 'Пробвай Pro безплатно 7 дни'}`}
      </button>
      <p className="text-center text-xs mt-2 relative tracking-wider" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'CANCEL ANYTIME · OFFER ENDS IN 2D 14H' : 'ОТКАЖИ ПО ВСЯКО ВРЕМЕ'}
      </p>
    </div>
  );
}

/* ─── Subscription management card (Pro users) ─── */
function SubscriptionCard({ token, lang }: { token: string | null; lang: 'en' | 'bg' }) {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(data.error ?? 'Could not open billing portal'); setLoading(false); }
    } catch {
      alert('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5"
      style={{ border: '1px solid hsl(var(--c-primary)/0.35)', boxShadow: '0 0 32px hsl(var(--c-primary)/0.08)' }}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--c-primary)/0.18), transparent 70%)', filter: 'blur(20px)' }} />

      <div className="flex items-center gap-2 mb-3 relative">
        <span className="text-xs font-black px-2.5 py-1 rounded-full tracking-wider"
          style={{ background: 'hsl(var(--c-primary)/0.25)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.45)' }}>
          ✦ OCTOLIO PRO
        </span>
        <span className="text-xs font-bold tracking-wider" style={{ color: 'hsl(var(--c-green))' }}>
          {lang === 'en' ? 'ACTIVE' : 'АКТИВЕН'}
        </span>
      </div>

      <p className="font-black text-xl leading-tight mb-1 relative" style={{ color: 'hsl(var(--c-fg))' }}>
        {lang === 'en' ? 'You\'re a Pro member.' : 'Ти си Pro член.'}
      </p>
      <p className="text-sm leading-snug mb-4 relative" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'Manage your subscription, update your payment method, or cancel anytime. Cancellation takes effect at the end of your current billing period — no surprise charges.'
          : 'Управлявай абонамента, обнови метода на плащане или откажи по всяко време. Отказът влиза в сила в края на текущия период — без изненадващи такси.'}
      </p>

      <button onClick={handleManage} disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm relative transition-all disabled:opacity-50"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
          color: '#fff',
          border: 'none',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}>
        {loading
          ? (lang === 'en' ? 'Opening…' : 'Отваряне…')
          : (lang === 'en' ? 'Manage subscription' : 'Управление на абонамента')}
      </button>
      <p className="text-center text-xs mt-2 relative" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'Securely handled by Stripe' : 'Сигурно управление чрез Stripe'}
      </p>
    </div>
  );
}
