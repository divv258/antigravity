import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import MCQPage from './pages/MCQPage';
import FlashcardPage from './pages/FlashcardPage';
import type { MCQItem, FlashcardItem } from './types';

export type AppView = 'home' | 'mcq' | 'flashcard';

/** Fisher-Yates shuffle the options of every question and remap the answer letter. */
function shuffleMCQ(questions: MCQItem[]): MCQItem[] {
  return questions.map((q) => {
    // Find which option is currently correct (by letter index)
    const correctIndex = q.answer.charCodeAt(0) - 65; // 'A'→0, 'B'→1 …
    const correctText = q.options[correctIndex];

    // Shuffle a copy of the options array
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Find where the correct option landed after shuffle
    const newIndex = shuffled.indexOf(correctText);
    const newAnswer = String.fromCharCode(65 + newIndex); // back to 'A'–'D'

    return { ...q, options: shuffled, answer: newAnswer };
  });
}

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [mcqData, setMcqData] = useState<MCQItem[]>([]);
  const [flashData, setFlashData] = useState<FlashcardItem[]>([]);

  const handleMCQReady = (data: MCQItem[]) => {
    setMcqData(shuffleMCQ(data)); // randomise option positions
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
