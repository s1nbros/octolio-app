import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { ExerciseRenderer } from '../components/ExerciseRenderer';
import type { Lesson as LessonType } from '../types';

// A page that asks the backend to generate a fresh Duolingo-style
// finance lesson on any topic, then plays through it.
export function GeneratedLesson() {
  const { token } = useAuth();
  const { lang } = useLang();
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setLesson(null); setIndex(0); setXp(0);
    try {
      const r = await fetch('/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'failed');
      setLesson(data.lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(correct: boolean, gained: number) {
    if (correct) setXp(prev => prev + gained);
    const next = index + 1;
    if (lesson && next >= lesson.exercises.length) {
      setIndex(next);  // triggers "complete" view
    } else {
      setIndex(next);
    }
  }

  // ── Landing: pick a topic ──
  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">
          {lang === 'en' ? 'Generate a finance lesson' : 'Генерирай финансов урок'}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {lang === 'en'
            ? 'Pick any finance topic. We\'ll make a theory block + 7+ interactive tasks.'
            : 'Избери тема. Ще направим теория + 7+ интерактивни задачи.'}
        </p>
        <input
          className="input-field w-full mb-3"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Compound interest' : 'напр. Сложна лихва'}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />
        <button className="btn-primary w-full" onClick={generate} disabled={loading || !topic.trim()}>
          {loading ? (lang === 'en' ? 'Generating…' : 'Генериране…') : (lang === 'en' ? 'Generate' : 'Генерирай')}
        </button>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>
    );
  }

  // ── Complete view ──
  if (index >= lesson.exercises.length) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">{lesson.icon} {lesson.title[lang]}</h1>
        <p className="text-lg mb-6">+{xp} XP</p>
        <button className="btn-primary" onClick={() => { setLesson(null); setTopic(''); }}>
          {lang === 'en' ? 'New topic' : 'Нова тема'}
        </button>
      </div>
    );
  }

  // ── Play through exercises ──
  const exercise = lesson.exercises[index];
  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-lg font-bold mb-4">{lesson.icon} {lesson.title[lang]}</h2>
      <ExerciseRenderer
        key={exercise.id}
        exercise={exercise}
        onAnswer={handleAnswer}
        questionNumber={index + 1}
        totalQuestions={lesson.exercises.length}
      />
    </div>
  );
}
