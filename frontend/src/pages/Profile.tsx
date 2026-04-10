import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { getLevel, getLevelProgress, LEVELS } from '../types';

/* Resize & crop image to a square JPEG base64 string */
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

/* Safe avatar display — never renders base64 as text */
function Avatar({ src, name, className = '' }: { src?: string; name?: string; className?: string }) {
  if (src?.startsWith('data:')) {
    return <img src={src} alt="avatar" className={`w-full h-full object-cover ${className}`} />;
  }
  return (
    <div className={`w-full h-full flex items-center justify-center text-4xl font-bold select-none ${className}`}
      style={{ background: 'linear-gradient(135deg, hsl(var(--c-primary)/0.2), hsl(var(--c-green)/0.15))' }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export function Profile() {
  const { user, token, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  /* profile state */
  const [name, setName] = useState(user?.name ?? '');
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState('');
  const [saveErr, setSaveErr] = useState('');

  /* password state */
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

  /* live name check */
  const checkName = useCallback(async (val: string) => {
    if (!val.trim() || val.trim() === user?.name || val.trim().length < 2) {
      setNameStatus('idle'); return;
    }
    setNameStatus('checking');
    try {
      const res = await fetch(`/api/auth/check-name?name=${encodeURIComponent(val.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNameStatus(data.available ? 'available' : 'taken');
    } catch { setNameStatus('idle'); }
  }, [token, user?.name]);

  useEffect(() => {
    const t = setTimeout(() => checkName(name), 500);
    return () => clearTimeout(t);
  }, [name, checkName]);

  /* image upload */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setSaveErr('Please upload an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { setSaveErr('Image must be under 8 MB'); return; }
    setSaveErr('');
    setPendingAvatar(await resizeImage(file));
  };

  /* save profile */
  const handleSave = async () => {
    if (nameStatus === 'taken') return;
    setSaveOk(''); setSaveErr('');
    setSaving(true);
    try {
      const updates: { name?: string; avatar?: string } = {};
      if (name.trim() && name.trim() !== user?.name) updates.name = name.trim();
      if (pendingAvatar) updates.avatar = pendingAvatar;
      if (!updates.name && !updates.avatar) { setSaveErr(lang === 'en' ? 'No changes to save' : 'Няма промени'); setSaving(false); return; }
      await updateProfile(updates);
      setPendingAvatar(null);
      setSaveOk(lang === 'en' ? 'Profile saved!' : 'Профилът е запазен!');
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Error');
    } finally { setSaving(false); }
  };

  /* change password */
  const handleChangePw = async () => {
    setPwOk(''); setPwErr('');
    if (newPw.length < 8) { setPwErr(lang === 'en' ? 'Minimum 8 characters' : 'Минимум 8 символа'); return; }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwOk(lang === 'en' ? 'Password changed!' : 'Паролата е сменена!');
      setCurrentPw(''); setNewPw('');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Error');
    } finally { setPwSaving(false); }
  };

  const canSave = nameStatus !== 'taken' && (
    (name.trim().length >= 2 && name.trim() !== user?.name) || !!pendingAvatar
  );
  const displayAvatar = pendingAvatar ?? user?.avatar;

  /* achievements */
  const achievements = [
    { icon: '🌱', en: 'First Steps',   bg: 'Първи стъпки',     sub: xp > 0 ? `${xp} XP` : '0 XP',             unlocked: xp > 0 },
    { icon: '⚡', en: 'Power User',    bg: 'Активен',           sub: '500 XP',                                   unlocked: xp >= 500 },
    { icon: '📚', en: 'Scholar',       bg: 'Учен',              sub: '1 000 XP',                                 unlocked: xp >= 1000 },
    { icon: '🏆', en: 'Champion',      bg: 'Шампион',           sub: '2 500 XP',                                 unlocked: xp >= 2500 },
    { icon: '🔥', en: 'On Fire',       bg: 'В огъня',           sub: '3-day streak',                             unlocked: streak >= 3 },
    { icon: '💫', en: 'Week Warrior',  bg: 'Седмичен воин',     sub: '7-day streak',                             unlocked: streak >= 7 },
    { icon: '💎', en: 'Diamond',       bg: 'Диамант',           sub: '30-day streak',                            unlocked: streak >= 30 },
    { icon: '🚀', en: 'Max Level',     bg: 'Макс. ниво',        sub: 'Level 5',                                  unlocked: level.level >= 5 },
  ];
  const earnedCount = achievements.filter(a => a.unlocked).length;

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--c-bg))' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        {/* ── Profile header ── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-28 w-full" style={{
            background: 'linear-gradient(120deg, hsl(var(--c-primary)/0.7) 0%, hsl(var(--c-green)/0.6) 100%)',
          }} />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-start gap-4 -mt-10 mb-5">
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden cursor-pointer group relative"
                  style={{ border: '4px solid hsl(var(--c-bg))' }}
                  onClick={() => fileRef.current?.click()}
                  title={lang === 'en' ? 'Change photo' : 'Смени снимка'}
                >
                  <Avatar src={displayAvatar} name={user?.name} />
                  <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>

              <div className="flex-1 min-w-0 pt-12">
                <h1 className="text-xl font-extrabold truncate" style={{ color: 'hsl(var(--c-fg))' }}>
                  {user?.name}
                </h1>
                <p className="text-sm truncate" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {user?.email}
                </p>
                {joinedDate && (
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {lang === 'en' ? 'Joined' : 'Присъединил се'} {joinedDate}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row — Duolingo-style */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '🔥', value: `${streak}`, label: lang === 'en' ? 'Day Streak' : 'Поред', color: 'hsl(var(--c-orange))' },
                { icon: '⚡', value: xp.toLocaleString(), label: lang === 'en' ? 'Total XP' : 'Общо XP', color: 'hsl(var(--c-primary))' },
                { icon: '🏆', value: `Lv.${level.level}`, label: level.label[lang], color: 'hsl(var(--c-green))' },
                { icon: '🎖️', value: `${earnedCount}`, label: lang === 'en' ? 'Badges' : 'Значки', color: 'hsl(var(--c-fg-muted))' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                  <div className="text-xl leading-none">{s.icon}</div>
                  <div className="text-base font-black mt-1 leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mt-1 leading-tight" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Level progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                <span>{level.label[lang]}</span>
                <span>{nextLevel ? `${nextLevel.minXp - xp} XP to Lv.${nextLevel.level}` : '🎉 Max level!'}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Achievements ── */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Achievements' : 'Постижения'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))' }}>
              {earnedCount} / {achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {achievements.map(a => (
              <div key={a.en}
                className="flex flex-col items-center gap-1 rounded-xl p-2.5 text-center transition-all"
                style={{
                  background: a.unlocked ? 'hsl(var(--c-green)/0.1)' : 'var(--c-glass)',
                  border: `1.5px solid ${a.unlocked ? 'hsl(var(--c-green)/0.3)' : 'var(--c-border)'}`,
                  opacity: a.unlocked ? 1 : 0.4,
                }}>
                <span className="text-2xl">{a.unlocked ? a.icon : '🔒'}</span>
                <span className="text-xs font-bold leading-tight" style={{ color: 'hsl(var(--c-fg))' }}>
                  {lang === 'en' ? a.en : a.bg}
                </span>
                <span className="text-xs leading-tight" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{a.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Edit Profile ── */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-extrabold text-base mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Edit Profile' : 'Редактирай профил'}
          </h2>

          {/* Photo upload row */}
          <div className="flex items-center gap-4 mb-5 p-3 rounded-xl"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: '2px solid var(--c-border)' }}>
              <Avatar src={displayAvatar} name={user?.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
                {lang === 'en' ? 'Profile photo' : 'Снимка на профила'}
              </p>
              <p className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {pendingAvatar
                  ? (lang === 'en' ? 'New photo selected — save to apply' : 'Нова снимка — запази за да приложиш')
                  : (lang === 'en' ? 'JPG or PNG, max 8 MB' : 'JPG или PNG, макс 8 MB')}
              </p>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
              style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.25)' }}>
              {lang === 'en' ? 'Upload' : 'Качи'}
            </button>
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Display name' : 'Показвано име'}
            </label>
            <input
              className="input-field"
              value={name}
              onChange={e => { setName(e.target.value); setSaveOk(''); setSaveErr(''); }}
              placeholder={lang === 'en' ? 'Your name' : 'Твоето име'}
            />
            {nameStatus === 'checking' && (
              <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>· Checking…</p>
            )}
            {nameStatus === 'available' && name.trim() !== user?.name && (
              <Hint ok text={lang === 'en' ? 'Name is available' : 'Името е свободно'} />
            )}
            {nameStatus === 'taken' && (
              <Hint ok={false} text={lang === 'en' ? 'Name already taken' : 'Името вече е заето'} />
            )}
            {name.trim().length > 0 && name.trim().length < 2 && (
              <Hint ok={false} text={lang === 'en' ? 'At least 2 characters' : 'Минимум 2 символа'} />
            )}
          </div>

          {saveOk && <Hint ok text={saveOk} />}
          {saveErr && <Hint ok={false} text={saveErr} />}

          <button
            className="btn-green w-full mt-1"
            onClick={handleSave}
            disabled={saving || !canSave}
          >
            {saving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {lang === 'en' ? 'Saving…' : 'Запазване…'}
                </span>
              : (lang === 'en' ? 'Save changes' : 'Запази промените')
            }
          </button>
        </div>

        {/* ── Change password ── */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-extrabold text-base mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Change Password' : 'Смени парола'}
          </h2>

          <div className="space-y-3 mb-2">
            {[
              { label: lang === 'en' ? 'Current password' : 'Текуща парола', value: currentPw, set: setCurrentPw, show: showCurrent, toggle: setShowCurrent, ac: 'current-password' },
              { label: lang === 'en' ? 'New password' : 'Нова парола', value: newPw, set: setNewPw, show: showNew, toggle: setShowNew, ac: 'new-password' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'hsl(var(--c-fg-subtle))' }}>{f.label}</label>
                <div className="relative">
                  <input
                    type={f.show ? 'text' : 'password'}
                    className="input-field pr-11"
                    value={f.value}
                    onChange={e => { f.set(e.target.value); setPwErr(''); setPwOk(''); }}
                    placeholder="••••••••"
                    autoComplete={f.ac}
                  />
                  <button type="button" onClick={() => f.toggle(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                    style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    {f.show ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {newPw.length > 0 && (
            <Hint
              ok={newPw.length >= 8}
              text={newPw.length >= 8
                ? (lang === 'en' ? 'Password strength is good' : 'Паролата е достатъчно силна')
                : (lang === 'en' ? `${8 - newPw.length} more character${8 - newPw.length !== 1 ? 's' : ''} needed` : `Нужни са още ${8 - newPw.length} символа`)}
            />
          )}
          {currentPw && pwErr?.includes('incorrect') && (
            <Hint ok={false} text={lang === 'en' ? 'Current password is incorrect' : 'Текущата парола е грешна'} />
          )}
          {pwOk && <Hint ok text={pwOk} />}
          {pwErr && !pwErr.includes('incorrect') && <Hint ok={false} text={pwErr} />}

          <button
            className="btn-primary w-full mt-4"
            onClick={handleChangePw}
            disabled={pwSaving || !currentPw || newPw.length < 8}
          >
            {pwSaving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {lang === 'en' ? 'Changing…' : 'Смяна…'}
                </span>
              : (lang === 'en' ? 'Change password' : 'Смени паролата')
            }
          </button>
        </div>

      </div>
    </div>
  );
}
