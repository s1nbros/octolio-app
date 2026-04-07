import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { getLevel, getLevelProgress, LEVELS } from '../types';

const AVATARS = [
  '🦊','🐻','🐼','🦁','🐯','🐸','🐙','🦋',
  '🐬','🦄','🦅','🐺','🐝','🦉','🐲','🧙‍♂️',
  '🦸','🧑‍💻','👨‍🎓','👩‍🎓','🧑‍🚀','🦩','🐧','🦜',
];

export function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();

  const [name, setName] = useState(user?.name ?? '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar ?? '🦊');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const level = getLevel(user?.xp ?? 0);
  const levelProgress = getLevelProgress(user?.xp ?? 0);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);

  const handleSaveProfile = async () => {
    setProfileMsg(''); setProfileErr('');
    setProfileLoading(true);
    try {
      await updateProfile({ name, avatar: selectedAvatar });
      setProfileMsg(lang === 'en' ? 'Profile updated!' : 'Профилът е обновен!');
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(''); setPwErr('');
    if (newPw.length < 6) {
      setPwErr(lang === 'en' ? 'Min 6 characters' : 'Минимум 6 символа');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg(lang === 'en' ? 'Password changed!' : 'Паролата е сменена!');
      setCurrentPw(''); setNewPw('');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Error');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 mb-6 animate-fade-up text-center">
          <div className="text-7xl mb-3">{selectedAvatar}</div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>{user?.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>{user?.email}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: '⚡', label: 'XP', value: user?.xp.toLocaleString() ?? '0', color: 'hsl(var(--c-primary))' },
              { icon: '🔥', label: lang === 'en' ? 'Streak' : 'Стрийк', value: `${user?.streak ?? 0}d`, color: 'hsl(var(--c-orange))' },
              { icon: '🏆', label: lang === 'en' ? 'Level' : 'Ниво', value: `${level.level}`, color: 'hsl(var(--c-green))' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="rounded-2xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-lg font-black" style={{ color }}>{value}</div>
                <div className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Level progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              <span>{level.label[lang]}</span>
              <span>{nextLevel ? `${nextLevel.minXp - (user?.xp ?? 0)} XP to Lv.${nextLevel.level}` : 'Max level!'}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Avatar picker */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-up delay-100">
          <h2 className="font-bold text-base mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? '🎭 Choose Avatar' : '🎭 Избери аватар'}
          </h2>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className="text-2xl rounded-xl p-2 transition-all"
                style={{
                  background: selectedAvatar === av ? 'hsl(var(--c-primary)/0.15)' : 'var(--c-glass)',
                  border: `2px solid ${selectedAvatar === av ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                  transform: selectedAvatar === av ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Name & save */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-up delay-200">
          <h2 className="font-bold text-base mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? '✏️ Edit Profile' : '✏️ Редактирай профил'}
          </h2>

          <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? 'Display name' : 'Показвано име'}
          </label>
          <input
            className="input-field mb-4"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={lang === 'en' ? 'Your name' : 'Твоето име'}
          />

          {profileMsg && (
            <div className="rounded-xl p-3 mb-3 text-sm" style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.3)', color: 'hsl(var(--c-green))' }}>
              ✓ {profileMsg}
            </div>
          )}
          {profileErr && (
            <div className="rounded-xl p-3 mb-3 text-sm" style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)', color: 'hsl(var(--c-red))' }}>
              ⚠ {profileErr}
            </div>
          )}

          <button className="btn-green w-full" onClick={handleSaveProfile} disabled={profileLoading}>
            {profileLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {lang === 'en' ? 'Saving...' : 'Запазване...'}
              </span>
            ) : (lang === 'en' ? 'Save Changes' : 'Запази промените')}
          </button>
        </div>

        {/* Change password */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up delay-300">
          <h2 className="font-bold text-base mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? '🔒 Change Password' : '🔒 Смени парола'}
          </h2>

          <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? 'Current password' : 'Текуща парола'}
          </label>
          <div className="relative mb-4">
            <input
              type={showCurrentPw ? 'text' : 'password'}
              className="input-field pr-10"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowCurrentPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {showCurrentPw ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? 'New password' : 'Нова парола'}
          </label>
          <div className="relative mb-4">
            <input
              type={showNewPw ? 'text' : 'password'}
              className="input-field pr-10"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowNewPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {showNewPw ? '🙈' : '👁️'}
            </button>
          </div>

          {pwMsg && (
            <div className="rounded-xl p-3 mb-3 text-sm" style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.3)', color: 'hsl(var(--c-green))' }}>
              ✓ {pwMsg}
            </div>
          )}
          {pwErr && (
            <div className="rounded-xl p-3 mb-3 text-sm" style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)', color: 'hsl(var(--c-red))' }}>
              ⚠ {pwErr}
            </div>
          )}

          <button className="btn-primary w-full" onClick={handleChangePassword} disabled={pwLoading}>
            {pwLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {lang === 'en' ? 'Changing...' : 'Смяна...'}
              </span>
            ) : (lang === 'en' ? 'Change Password' : 'Смени паролата')}
          </button>
        </div>

      </div>
    </div>
  );
}
