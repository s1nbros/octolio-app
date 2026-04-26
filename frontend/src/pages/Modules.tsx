import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { ModuleCard } from '../components/ModuleCard';
import type { ModuleMeta } from '../types';

export function Modules() {
  const { token, user } = useAuth();
  const { ui, lang } = useLang();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setModules(data.modules ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const isPro = user?.is_pro ?? false;

  // Free users need 2 lessons in previous non-pro module to unlock next; pro users skip this gating
  const isLocked = (index: number) => {
    if (isPro || index === 0) return false;
    const prev = modules[index - 1];
    if (prev.proOnly) return false;
    const prevCompleted = prev.lessons.filter((l) => l.completed).length;
    return prevCompleted < 2;
  };

  // Pro modules are only hard-locked for free users; pro users can access them
  const isProLocked = (mod: ModuleMeta) => mod.proOnly && !isPro;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <FloatingOrbs />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
            {ui.modules_title}
          </h1>
          <p style={{ color: 'hsl(var(--c-fg-muted))' }}>{ui.modules_sub}</p>
        </div>

        {/* Progress overview */}
        <div className="glass-card rounded-2xl p-5 mb-8 animate-fade-up delay-100">
          <div className="flex flex-wrap gap-6 items-center">
            {modules.map((mod, i) => {
              const done = mod.lessons.filter((l) => l.completed).length;
              const total = mod.lessons.length;
              const locked = isLocked(i) || isProLocked(mod);
              return (
                <div key={mod.id} className="flex items-center gap-2">
                  <span className="text-lg">{locked ? '🔒' : mod.icon}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: locked ? 'hsl(var(--c-fg-subtle))' : 'hsl(var(--c-fg))' }}>
                      {mod.title[lang]}
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{done}/{total}</p>
                  </div>
                  {i < modules.length - 1 && (
                    <span className="ml-2 text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Module grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <ModuleCard key={mod.id} module={mod} isLocked={isLocked(i)} isProLocked={isProLocked(mod)} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
