import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { ModuleCard } from '../components/ModuleCard';
import type { ModuleMeta } from '../types';

export function Modules() {
  const { token } = useAuth();
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

  // A module is locked if the previous module has fewer than 2 completed lessons
  const isLocked = (index: number) => {
    if (index === 0) return false;
    const prev = modules[index - 1];
    const prevCompleted = prev.lessons.filter((l) => l.completed).length;
    return prevCompleted < 2;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(239, 84%, 67%)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(210, 40%, 96%)' }}>
            {ui.modules_title}
          </h1>
          <p style={{ color: 'hsl(215, 20%, 60%)' }}>{ui.modules_sub}</p>
        </div>

        {/* Progress overview */}
        <div className="glass-card rounded-2xl p-5 mb-8 animate-fade-up delay-100">
          <div className="flex flex-wrap gap-6 items-center">
            {modules.map((mod, i) => {
              const done = mod.lessons.filter((l) => l.completed).length;
              const total = mod.lessons.length;
              const locked = isLocked(i);
              return (
                <div key={mod.id} className="flex items-center gap-2">
                  <span className="text-lg">{locked ? '🔒' : mod.icon}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: locked ? 'hsl(215, 20%, 40%)' : 'hsl(210, 40%, 90%)' }}>
                      {mod.title[lang]}
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(215, 20%, 50%)' }}>{done}/{total}</p>
                  </div>
                  {i < modules.length - 1 && (
                    <span className="ml-2 text-xs" style={{ color: 'hsl(215, 20%, 30%)' }}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Module grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <ModuleCard key={mod.id} module={mod} isLocked={isLocked(i)} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
