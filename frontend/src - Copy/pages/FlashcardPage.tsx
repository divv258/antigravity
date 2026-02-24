import { useState } from 'react';
import SEO from '../components/SEO';
import type { FlashcardItem } from '../types';

interface FlashcardPageProps {
    cards: FlashcardItem[];
    onBack: () => void;
}

export default function FlashcardPage({ cards, onBack }: FlashcardPageProps) {
    const [current, setCurrent] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const goNext = () => {
        setFlipped(false);
        setTimeout(() => setCurrent((c) => Math.min(c + 1, cards.length - 1)), 150);
    };

    const goPrev = () => {
        setFlipped(false);
        setTimeout(() => setCurrent((c) => Math.max(c - 1, 0)), 150);
    };

    const card = cards[current];

    return (
        <>
            <SEO
                title="Flashcards — QuizSnap.ai"
                description="Reviewing AI-generated flashcards from your textbook page on QuizSnap.ai"
            />
            <main className="quiz-main relative z-10 bg-grid">
                <div className="quiz-inner">

                    {/* Top bar */}
                    <div className="quiz-topbar">
                        <button className="btn-ghost" onClick={onBack} aria-label="Go back to home">← Back</button>
                        <span className="quiz-counter">
                            <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{current + 1}</span>
                            <span className="text-slate-500"> / {cards.length}</span>
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="progress-bar mb-4">
                        <div
                            className="progress-fill"
                            style={{ width: `${((current + 1) / cards.length) * 100}%` }}
                            role="progressbar"
                            aria-valuenow={current + 1}
                            aria-valuemin={1}
                            aria-valuemax={cards.length}
                        />
                    </div>

                    {/* Hint */}
                    <p className="text-center text-slate-500 text-xs sm:text-sm mb-4">
                        Tap the card to reveal the answer
                    </p>

                    {/* 3D Flashcard */}
                    <div
                        className="flashcard-scene mx-auto mb-6"
                        onClick={() => setFlipped((f) => !f)}
                        role="button"
                        tabIndex={0}
                        aria-label={flipped ? 'Click to hide answer' : 'Click to reveal answer'}
                        onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
                    >
                        <article className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
                            {/* Front */}
                            <div className="flashcard-front">
                                <span className="flashcard-badge" style={{ color: 'var(--teal)', borderColor: 'rgba(0,245,212,0.3)' }}>
                                    Question
                                </span>
                                <p className="flashcard-text">{card.front}</p>
                                <span className="flashcard-hint">Tap to flip ↩</span>
                            </div>

                            {/* Back */}
                            <div className="flashcard-back">
                                <span className="flashcard-badge" style={{ color: 'var(--purple)', borderColor: 'rgba(191,90,242,0.3)' }}>
                                    Answer
                                </span>
                                <p className="flashcard-text">{card.back}</p>
                            </div>
                        </article>
                    </div>

                    {/* Navigation */}
                    <div className="flash-nav">
                        <button
                            className="btn-ghost"
                            onClick={goPrev}
                            disabled={current === 0}
                            aria-label="Previous card"
                            style={{ opacity: current === 0 ? 0.35 : 1 }}
                        >
                            ← Prev
                        </button>

                        {/* Dot indicators — scrollable on mobile */}
                        <div className="dots-wrap" aria-label="Card navigation dots">
                            {cards.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setFlipped(false); setTimeout(() => setCurrent(i), 150); }}
                                    aria-label={`Go to card ${i + 1}`}
                                    className="dot"
                                    style={{
                                        background: i === current ? 'var(--purple)' : 'var(--charcoal-500)',
                                        boxShadow: i === current ? '0 0 8px var(--purple-glow-strong)' : 'none',
                                        width: i === current ? '20px' : '8px',
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            className="btn-ghost"
                            onClick={goNext}
                            disabled={current === cards.length - 1}
                            aria-label="Next card"
                            style={{ opacity: current === cards.length - 1 ? 0.35 : 1 }}
                        >
                            Next →
                        </button>
                    </div>

                    {/* Completion message */}
                    {current === cards.length - 1 && (
                        <div className="mt-6 text-center fade-in-up">
                            <p className="text-slate-400 text-sm mb-4">🎉 You've reviewed all {cards.length} cards!</p>
                            <div className="flex gap-3 justify-center flex-wrap">
                                <button className="btn-purple" onClick={() => { setCurrent(0); setFlipped(false); }}>
                                    Start Over
                                </button>
                                <button className="btn-ghost" onClick={onBack}>← Home</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
