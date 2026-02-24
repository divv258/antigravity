import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import MCQPage from './pages/MCQPage';
import FlashcardPage from './pages/FlashcardPage';
import type { MCQItem, FlashcardItem } from './types';

export type AppView = 'home' | 'mcq' | 'flashcard';

/** Fisher-Yates shuffle the options of every question and remap the answer letter. */
function shuffleMCQ(questions: MCQItem[]): MCQItem[] {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => {
    if (!q.options || !Array.isArray(q.options) || q.options.length === 0) return q;

    // Find which option is currently correct (by letter index)
    // Safely handle cases where q.answer might be missing or not a capital letter
    const correctLetter = (q.answer || 'A').toUpperCase();
    const correctIndex = correctLetter.charCodeAt(0) - 65;
    const correctText = q.options[correctIndex] || q.options[0];

    // Shuffle a copy of the options array
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Find where the correct option landed after shuffle
    const newIndex = shuffled.indexOf(correctText);
    const newAnswer = String.fromCharCode(65 + (newIndex >= 0 ? newIndex : 0));

    return { ...q, options: shuffled, answer: newAnswer };
  });
}

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [mcqData, setMcqData] = useState<MCQItem[]>([]);
  const [flashData, setFlashData] = useState<FlashcardItem[]>([]);

  const handleMCQReady = (data: MCQItem[]) => {
    if (!data || data.length === 0) {
      alert("No questions could be generated from this page. Please try another image.");
      setView('home');
      return;
    }
    setMcqData(shuffleMCQ(data));
    setView('mcq');
  };

  const handleFlashReady = (data: FlashcardItem[]) => {
    setFlashData(data);
    setView('flashcard');
  };

  const goHome = () => {
    setView('home');
    setMcqData([]);
    setFlashData([]);
  };

  return (
    <HelmetProvider>
      {/* Decorative background orbs */}
      <div className="orb orb-teal" aria-hidden="true" />
      <div className="orb orb-purple" aria-hidden="true" />

      {view === 'home' && (
        <HomePage onMCQReady={handleMCQReady} onFlashReady={handleFlashReady} />
      )}
      {view === 'mcq' && (
        <MCQPage questions={mcqData} onBack={goHome} />
      )}
      {view === 'flashcard' && (
        <FlashcardPage cards={flashData} onBack={goHome} />
      )}
    </HelmetProvider>
  );
}
