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
        // Centre-crop to square
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

export function Profile() {
  const { user, token, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---------- profile state ---------- */
  const [name, setName] = useState(user?.name ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [avatarFile, setAvatarFile] = useState<string | null>(null); // base64
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
    if (!file.type.startsWith('image/')) { setProfileErr('Please upload an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { setProfileErr('Image must be under 8 MB'); return; }
    setProfileErr('');
    const base64 = await resizeImage(file);
    setAvatarPreview(base64);
    setAvatarFile(base64);
  };

  /* ---------- save profile ---------- */
  const handleSaveProfile = async () => {
    if (nameStatus === 'taken') return;
    setProfileOk(''); setProfileErr('');
    setProfileSaving(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        avatar: avatarFile ?? undefined,
      });
      setAvatarFile(null);
      setProfileOk(lang === 'en' ? 'Profile saved successfully' : 'Профилът е запазен');
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

  const isDefaultAvatar = !avatarPreview || !avatarPreview.startsWith('data:');
  const canSave = nameStatus !== 'taken' && (name.trim() !== user?.name || avatarFile);

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
                className="w-24 h-24 rounded-full overflow-hidden ring-4 cursor-pointer group"
                style={{ background: 'hsl(var(--c-bg-elevated))', border: '4px solid hsl(var(--c-bg))' }}
                onClick={() => fileRef.current?.click()}
              >
                {avatarPreview && !isDefaultAvatar ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ background: 'hsl(var(--c-primary)/0.12)' }}>
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                {/* Upload overlay */}
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'XP', value: user?.xp.toLocaleString() ?? '0', color: 'hsl(var(--c-primary))', icon: '⚡' },
                { label: lang === 'en' ? 'Streak' : 'Стрийк', value: `${user?.streak ?? 0}d`, color: 'hsl(var(--c-orange))', icon: '🔥' },
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
                <span>{nextLevel ? `${nextLevel.minXp - (user?.xp ?? 0)} XP to next` : 'Max!'}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${levelPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit profile ── */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up delay-100">
          <h2 className="text-base font-bold mb-5" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Edit Profile' : 'Редактирай профил'}
          </h2>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Display name' : 'Показвано име'}
            </label>
            <input
              className="input-field"
              value={name}
              onChange={e => { setName(e.target.value); setProfileOk(''); }}
              placeholder={lang === 'en' ? 'Your name' : 'Твоето име'}
            />
            {nameStatus === 'checking' && (
              <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                · Checking...
              </p>
            )}
            {nameStatus === 'available' && name.trim() !== user?.name && (
              <FieldHint ok text={lang === 'en' ? 'Name is available' : 'Името е свободно'} />
            )}
            {nameStatus === 'taken' && (
              <FieldHint ok={false} text={lang === 'en' ? 'Name is already taken' : 'Името вече е заето'} />
            )}
          </div>

          {/* Photo hint */}
          {avatarFile && (
            <p className="text-xs mb-4 font-medium" style={{ color: 'hsl(var(--c-green))' }}>
              ✓ {lang === 'en' ? 'New photo ready to save' : 'Новата снимка е готова за запис'}
            </p>
          )}

          {profileOk && <FieldHint ok text={profileOk} />}
          {profileErr && <FieldHint ok={false} text={profileErr} />}

          <button
            className="btn-green w-full mt-4"
            onClick={handleSaveProfile}
            disabled={profileSaving || nameStatus === 'taken' || !canSave}
          >
            {profileSaving
              ? <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {lang === 'en' ? 'Saving...' : 'Запазване...'}
                </span>
              : (lang === 'en' ? 'Save changes' : 'Запази промените')
            }
          </button>
        </div>

        {/* ── Change password ── */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up delay-200">
          <h2 className="text-base font-bold mb-5" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Change Password' : 'Смени парола'}
          </h2>

          {/* Current password */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {showCurrent ? '🙈' : '👁️'}
              </button>
            </div>
            {currentPw && pwErr && pwErr.includes('incorrect') && (
              <FieldHint ok={false} text={lang === 'en' ? 'Current password is incorrect' : 'Текущата парола е грешна'} />
            )}
          </div>

          {/* New password */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-opacity hover:opacity-70"
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
              ? <span className="flex items-center gap-2">
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
