import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function AiAdvisor() {
  const { lang } = useLang();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <FloatingOrbs />
      <div className="relative max-w-md w-full animate-scale-in" style={{ zIndex: 1 }}>
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">🛠️</div>
          <h2 className="font-black text-2xl mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'AI Advisor is in development' : 'AI Съветникът е в разработка'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'We\'re working on it. Check back soon — your personal money coach will be here shortly.'
              : 'Работим по него. Върнете се скоро — вашият личен финансов треньор ще бъде тук скоро.'}
          </p>
          <Link to="/modules">
            <button className="btn-ghost w-full">
              {lang === 'en' ? '← Back to Learn' : '← Към Учене'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
