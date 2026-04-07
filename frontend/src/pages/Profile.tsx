import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { getLevel, getLevelProgress, LEVELS } from '../types';

/* Resize & crop image to a square JPEG base64 string */
function resizeImage(file: File, size = 220): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
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

function FieldHint({ text, ok }: { text: string; ok: boolean }) {
  return (
    <p className="text-xs mt-1.5 font-medium" style={{ color: ok ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
      {ok ? '✓' : '✗'} {text}
    </p>
  );
}

/* Avatar display — handles both photo (data URL) and emoji/initial */
function AvatarDisplay({ avatar, name, size = 'lg' }: { avatar?: string; name?: string; size?: 'sm' | 'lg' }) {
  const isPhoto = avatar?.startsWith('data:');
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-full h-full';
  const textSize = size === 'lg' ? 'text-4xl' : 'text-lg';
  if (isPhoto) {
    return <img src={avatar} alt="avatar" className={`${dim} object-cover`} />;
  }
  return (
    <div className={`${dim} flex items-center justify-center ${textSize}`}
      style={{ background: 'hsl(var(--c-primary)/0.12)' }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export function Profile() {
  const { user, token, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---------- profile state ---------- */
  const [name, setName] = useState(user?.name ?? '');
  // pendingAvatar holds ONLY the newly uploaded base64 (never the existing avatar)
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileOk, setProfileOk] = useState('');
  const [profileErr, setProfileErr] = useState('');

  /* ---------- password state ---------- */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwOk, setPwOk] = useState('');
  const [pwErr, setPwErr] = useState('');

  const level = getLevel(user?.xp ?? 0);
  const levelPct = getLevelProgress(user?.xp ?? 0);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);
  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;

  /* ---------- live name check ---------- */
  const checkName = useCallback(async (val: string) => {
    if (!val.trim() || val.trim() === user?.name) { setNameStatus('idle'); return; }
    if (val.trim().length < 2) { setNameStatus('idle'); return; }
    setNameStatus('checking');
    try {
      const res = await fetch(`/api/auth/check-name?name=${encodeURIComponent(val.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNameStatus(data.available ? 'available' : 'taken');
    } catch {
      setNameStatus('idle');
    }
  }, [token, user?.name]);

  useEffect(() => {
    const t = setTimeout(() => checkName(name), 500);
    return () => clearTimeout(t);
  }, [name, checkName]);

  /* ---------- image upload ---------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset input so same file can be selected again
    e.target.value = '';
    if (!file.type.startsWith('image/')) { setProfileErr('Please upload an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { setProfileErr('Image must be under 8 MB'); return; }
    setProfileErr('');
    const base64 = await resizeImage(file);
    setPendingAvatar(base64);
  };

  /* ---------- save profile ---------- */
  const handleSaveProfile = async () => {
    if (nameStatus === 'taken') return;
    setProfileOk(''); setProfileErr('');
    setProfileSaving(true);
    try {
      const updates: { name?: string; avatar?: string } = {};
      if (name.trim() && name.trim() !== user?.name) updates.name = name.trim();
      if (pendingAvatar) updates.avatar = pendingAvatar;
      await updateProfile(updates);
      setPendingAvatar(null);
      setProfileOk(lang === 'en' ? 'Profile saved' : 'Профилът е запазен');
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Error');
    } finally {
      setProfileSaving(false);
    }
  };

  /* ---------- change password ---------- */
  const handleChangePassword = async () => {
    setPwOk(''); setPwErr('');
    if (newPw.length < 8) { setPwErr(lang === 'en' ? 'Minimum 8 characters' : 'Минимум 8 символа'); return; }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwOk(lang === 'en' ? 'Password changed successfully' : 'Паролата е сменена');
      setCurrentPw(''); setNewPw('');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Error');
    } finally {
      setPwSaving(false);
    }
  };

  const canSave = nameStatus !== 'taken' && (
    (name.trim().length >= 2 && name.trim() !== user?.name) || !!pendingAvatar
  );

  /* Display avatar: pending upload takes priority, then saved avatar */
  const displayAvatar = pendingAvatar ?? user?.avatar;

  /* ---------- achievements ---------- */
  const achievements = [
    { icon: '🌱', label: lang === 'en' ? 'First Steps' : 'Първи стъпки', desc: lang === 'en' ? 'Earn your first XP' : 'Спечели първи XP', unlocked: xp > 0 },
    { icon: '⚡', label: lang === 'en' ? 'Power User' : 'Активен потребител', desc: lang === 'en' ? 'Reach 500 XP' : '500 XP', unlocked: xp >= 500 },
    { icon: '📚', label: lang === 'en' ? 'Scholar' : 'Учен', desc: lang === 'en' ? 'Reach 1,000 XP' : '1 000 XP', unlocked: xp >= 1000 },
    { icon: '🏆', label: lang === 'en' ? 'Champion' : 'Шампион', desc: lang === 'en' ? 'Reach max level' : 'Макс. ниво', unlocked: xp >= 2500 },
    { icon: '🔥', label: lang === 'en' ? 'On Fire' : 'В огъня', desc: lang === 'en' ? '3-day streak' : '3 дни поред', unlocked: streak >= 3 },
    { icon: '💫', label: lang === 'en' ? 'Week Warrior' : 'Седмичен воин', desc: lang === 'en' ? '7-day streak' : '7 дни поред', unlocked: streak >= 7 },
    { icon: '💎', label: lang === 'en' ? 'Diamond' : 'Диамант', desc: lang === 'en' ? '30-day streak' : '30 дни поред', unlocked: streak >= 30 },
    { icon: '🚀', label: lang === 'en' ? 'Rocket' : 'Ракета', desc: lang === 'en' ? 'Level 5 reached' : 'Ниво 5', unlocked: level.level >= 5 },
  ];

  const earnedCount = achievements.filter(a => a.unlocked).length;

  /* ---------- account info ---------- */
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-5" style={{ zIndex: 1 }}>

        {/* ── Hero card ── */}
        <div className="glass-card rounded-3xl overflow-hidden animate-fade-up">
          {/* Gradient banner */}
          <div className="h-24" style={{
            background: 'linear-gradient(135deg, hsl(var(--c-primary)/0.6), hsl(var(--c-green)/0.5))',
          }} />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-12 mb-4 w-fit">
              <div
                className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group relative"
                style={{ background: 'hsl(var(--c-bg-elevated))', border: '4px solid hsl(var(--c-bg))' }}
                onClick={() => fileRef.current?.click()}
              >
                <AvatarDisplay avatar={displayAvatar} name={user?.name} size="lg" />
                <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <span className="text-white text-xs font-semibold">Upload</span>
                </div>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg transition-transform hover:scale-110"
                style={{ background: 'hsl(var(--c-primary))', color: '#fff', border: '2px solid hsl(var(--c-bg))' }}>
                +
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>{user?.name}</h1>
            <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>{user?.email}</p>
            {joinedDate && (
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Member since' : 'Член от'} {joinedDate}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'XP', value: xp.toLocaleString(), color: 'hsl(var(--c-primary))', icon: '⚡' },
                { label: lang === 'en' ? 'Streak' : 'Стрийк', value: `${streak}d`, color: 'hsl(var(--c-orange))', icon: '🔥' },
                { label: lang === 'en' ? 'Level' : 'Ниво', value: String(level.level), color: 'hsl(var(--c-green))', icon: '🏆' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="rounded-2xl p-3 text-center"
                  style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                  <div className="text-lg">{icon}</div>
                  <div className="text-lg font-black mt-0.5" style={{ color }}>{value}</div>
                  <div className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Level bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                <span>{level.label[lang]} · Lv.{level.level}</span>
                <span>{nextLevel ? `${nextLevel.minXp - xp} XP to next` : 'Max level!'}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${levelPct}%` }} />
              </div>
            </div>

            {/* Pending changes: save button in hero card */}
            {(canSave || profileOk || profileErr) && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
                {pendingAvatar && (
                  <p className="text-xs mb-2 font-medium" style={{ color: 'hsl(var(--c-green))' }}>
                    ✓ {lang === 'en' ? 'New photo ready to save' : 'Новата снимка е готова за запис'}
                  </p>
                )}
                {profileOk && <FieldHint ok text={profileOk} />}
                {profileErr && <FieldHint ok={false} text={profileErr} />}
                {canSave && (
                  <button
                    className="btn-green w-full mt-2"
                    onClick={handleSaveProfile}
                    disabled={profileSaving || nameStatus === 'taken'}
                  >
                    {profileSaving
                      ? <span className="flex items-center gap-2 justify-center">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {lang === 'en' ? 'Saving...' : 'Запазване...'}
                        </span>
                      : (lang === 'en' ? 'Save changes' : 'Запази промените')
                    }
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Achievements' : 'Постижения'}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'hsl(var(--c-green)/0.12)', color: 'hsl(var(--c-green))' }}>
              {earnedCount}/{achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {achievements.map(a => (
              <div key={a.label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all"
                style={{
                  background: a.unlocked ? 'hsl(var(--c-green)/0.08)' : 'var(--c-glass)',
                  border: `1px solid ${a.unlocked ? 'hsl(var(--c-green)/0.25)' : 'var(--c-border)'}`,
                  opacity: a.unlocked ? 1 : 0.45,
                }}>
                <span className="text-2xl">{a.unlocked ? a.icon : '🔒'}</span>
                <span className="text-xs font-semibold leading-tight" style={{ color: 'hsl(var(--c-fg))' }}>
                  {a.label}
                </span>
                <span className="text-xs leading-tight" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {a.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Edit name ── */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up delay-150">
          <h2 className="text-base font-bold mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Edit Profile' : 'Редактирай профил'}
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Display name' : 'Показвано име'}
            </label>
            <input
              className="input-field"
              value={name}
              onChange={e => { setName(e.target.value); setProfileOk(''); setProfileErr(''); }}
              placeholder={lang === 'en' ? 'Your name' : 'Твоето име'}
            />
            {nameStatus === 'checking' && (
              <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>· Checking...</p>
            )}
            {nameStatus === 'available' && name.trim() !== user?.name && (
              <FieldHint ok text={lang === 'en' ? 'Name is available' : 'Името е свободно'} />
            )}
            {nameStatus === 'taken' && (
              <FieldHint ok={false} text={lang === 'en' ? 'Name is already taken' : 'Името вече е заето'} />
            )}
            {name.trim().length > 0 && name.trim().length < 2 && (
              <FieldHint ok={false} text={lang === 'en' ? 'At least 2 characters' : 'Минимум 2 символа'} />
            )}
          </div>
          <p className="text-xs mt-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en'
              ? 'Changes are saved with the button in the card above.'
              : 'Промените се запазват с бутона в картата отгоре.'}
          </p>
        </div>

        {/* ── Change password ── */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up delay-200">
          <h2 className="text-base font-bold mb-5" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Change Password' : 'Смени парола'}
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Current password' : 'Текуща парола'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input-field pr-11"
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setPwErr(''); setPwOk(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded"
                style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {showCurrent ? '🙈' : '👁️'}
              </button>
            </div>
            {currentPw && pwErr?.includes('incorrect') && (
              <FieldHint ok={false} text={lang === 'en' ? 'Current password is incorrect' : 'Текущата парола е грешна'} />
            )}
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'New password' : 'Нова парола'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input-field pr-11"
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwErr(''); setPwOk(''); }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded"
                style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
            {newPw.length > 0 && (
              <FieldHint
                ok={newPw.length >= 8}
                text={newPw.length >= 8
                  ? (lang === 'en' ? 'Password strength is good' : 'Паролата е достатъчно силна')
                  : (lang === 'en' ? `${8 - newPw.length} more character${8 - newPw.length !== 1 ? 's' : ''} needed` : `Нужни са още ${8 - newPw.length} символа`)}
              />
            )}
          </div>

          {pwOk && <FieldHint ok text={pwOk} />}
          {pwErr && !pwErr.includes('incorrect') && <FieldHint ok={false} text={pwErr} />}

          <button
            className="btn-primary w-full mt-4"
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPw || newPw.length < 8}
          >
            {pwSaving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {lang === 'en' ? 'Changing...' : 'Смяна...'}
                </span>
              : (lang === 'en' ? 'Change password' : 'Смени паролата')
            }
          </button>
        </div>

      </div>
    </div>
  );
}
