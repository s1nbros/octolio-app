import { Link } from 'react-router-dom';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { useLang } from '../contexts/LanguageContext';
import { FAQ_CATEGORIES, FaqList } from '../components/FaqList';

export function Faq() {
  const { lang } = useLang();
  const totalCount = FAQ_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12" style={{ zIndex: 1 }}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: 'hsl(var(--c-primary))' }}
        >
          ← {lang === 'en' ? 'Back to home' : 'Обратно към началото'}
        </Link>

        <header className="mb-8">
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-3"
            style={{ color: 'hsl(var(--c-fg))' }}
          >
            {lang === 'en' ? 'FAQ' : 'Често задавани въпроси'}
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? `${totalCount} answers across ${FAQ_CATEGORIES.length} topics.`
              : `${totalCount} отговора в ${FAQ_CATEGORIES.length} теми.`}
          </p>
        </header>

        <FaqList />

        <footer
          className="mt-12 pt-8 border-t"
          style={{ borderColor: 'hsl(var(--c-fg)/0.08)' }}
        >
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? "Didn't find what you needed? "
              : 'Не намери това, което търсиш? '}
            <a href="mailto:[CONTACT EMAIL]" style={{ color: 'hsl(var(--c-primary))' }}>
              {lang === 'en' ? 'Email us' : 'Пиши ни'}
            </a>
            .
          </p>
          <div className="mt-4 text-sm flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacy" style={{ color: 'hsl(var(--c-primary))' }}>
              {lang === 'en' ? 'Privacy Policy' : 'Политика за поверителност'}
            </Link>
            <Link to="/" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Home' : 'Начало'}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
