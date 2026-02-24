import { useState } from 'react';
import SEO from '../components/SEO';
import type { MCQItem } from '../types';

interface MCQPageProps {
    questions: MCQItem[];
    onBack: () => void;
}

type AnswerState = 'unanswered' | string;

/* ─── Helpers ──────────────────────────────────────────────────── */
function getRating(pct: number) {
    if (pct === 100) return { label: 'Perfect Score!', emoji: '🏆', color: '#ffd700' };
    if (pct >= 80) return { label: 'Excellent!', emoji: '🎉', color: 'var(--teal)' };
    if (pct >= 60) return { label: 'Good Job!', emoji: '👍', color: '#34d399' };
    if (pct >= 40) return { label: 'Keep Studying', emoji: '📖', color: '#f59e0b' };
    return { label: 'Keep Going!', emoji: '💪', color: '#f87171' };
}

function getArcColor(pct: number) {
    if (pct >= 80) return 'var(--teal)';
    if (pct >= 60) return '#34d399';
    if (pct >= 40) return '#f59e0b';
    return '#f87171';
}

export default function MCQPage({ questions, onBack }: MCQPageProps) {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<AnswerState[]>(Array(questions.length).fill('unanswered'));
    const [finished, setFinished] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);

    if (!questions || questions.length === 0) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-grid">
                <div className="glass p-8 text-center max-w-sm">
                    <p className="text-slate-300 mb-6">Oops! No questions were found for this quiz.</p>
                    <button className="btn-teal w-full" onClick={onBack}>Go Back Home</button>
                </div>
            </main>
        );
    }

    const q = questions[current];
    if (!q) return null; // Safety check
    const chosen = answers[current];
    const isAnswered = chosen !== 'unanswered';

    const handleAnswer = (letter: string) => {
        if (isAnswered) return;
        const updated = [...answers];
        updated[current] = letter;
        setAnswers(updated);
    };

    const handleNext = () => {
        if (current < questions.length - 1) setCurrent((c) => c + 1);
        else setFinished(true);
    };

    const score = answers.filter((a, i) => a === questions[i]?.answer).length;
    const wrong = questions.length - score;
    const pct = Math.round((score / questions.length) * 100);
    const rating = getRating(pct);
    const arcColor = getArcColor(pct);

    /* ── RESULT SCREEN ─────────────────────────────────────────── */
    if (finished) {
        const circumference = 2 * Math.PI * 54; // r=54
        const strokeDash = (pct / 100) * circumference;

        return (
            <>
                <SEO
                    title={`${pct}% Score — QuizSnap.ai`}
                    description={`You scored ${score}/${questions.length} on your QuizSnap.ai MCQ quiz.`}
                />
                <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative z-10 bg-grid">
                    <div className="result-card glass fade-in-up">

                        {/* ── Top hero ─────────────────────────── */}
                        <div className="result-hero">
                            {/* SVG ring with smooth animation */}
                            <div className="ring-wrap">
                                <svg viewBox="0 0 120 120" className="score-svg" aria-hidden="true">
                                    {/* track */}
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--charcoal-600)" strokeWidth="8" />
                                    {/* arc */}
                                    <circle
                                        cx="60" cy="60" r="54"
                                        fill="none"
                                        stroke={arcColor}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${strokeDash} ${circumference}`}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 60 60)"
                                        style={{ filter: `drop-shadow(0 0 6px ${arcColor})`, transition: 'stroke-dasharray 1s ease' }}
                                    />
                                </svg>
                                <div className="ring-label">
                                    <span className="ring-pct" style={{ color: arcColor }}>{pct}%</span>
                                    <span className="ring-sub">score</span>
                                </div>
                            </div>

                            {/* Rating badge */}
                            <div className="result-rating">
                                <span className="rating-emoji">{rating.emoji}</span>
                                <h2 className="rating-label" style={{ color: rating.color }}>{rating.label}</h2>
                            </div>
                        </div>

                        {/* ── Stats row ────────────────────────── */}
                        <div className="stat-row">
                            <div className="stat-box stat-correct">
                                <span className="stat-icon">✓</span>
                                <span className="stat-num">{score}</span>
                                <span className="stat-lbl">Correct</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-box stat-wrong">
                                <span className="stat-icon">✗</span>
                                <span className="stat-num">{wrong}</span>
                                <span className="stat-lbl">Wrong</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-box">
                                <span className="stat-icon" style={{ color: 'var(--purple)' }}>⬡</span>
                                <span className="stat-num" style={{ color: 'var(--purple)' }}>{questions.length}</span>
                                <span className="stat-lbl">Total</span>
                            </div>
                        </div>

                        {/* ── Review toggle ────────────────────── */}
                        <button
                            className="review-toggle"
                            onClick={() => setReviewOpen((o) => !o)}
                            aria-expanded={reviewOpen}
                        >
                            <span>Question Review</span>
                            <span className="review-chevron" style={{ transform: reviewOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                        </button>

                        {reviewOpen && (
                            <div className="review-list" role="list">
                                {questions.map((q, i) => {
                                    const isCorrect = answers[i] === q.answer;
                                    return (
                                        <div key={i} className={`review-item ${isCorrect ? 'review-correct' : 'review-wrong'}`} role="listitem">
                                            <span className="review-icon">{isCorrect ? '✓' : '✗'}</span>
                                            <div className="review-text">
                                                <p className="review-q">{q.question}</p>
                                                {!isCorrect && (
                                                    <p className="review-answer">
                                                        Your answer: <strong>{answers[i]}</strong> · Correct: <strong style={{ color: 'var(--teal)' }}>{q.answer}</strong>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Action buttons ───────────────────── */}
                        <div className="result-actions">
                            <button
                                className="btn-teal"
                                onClick={() => { setCurrent(0); setAnswers(Array(questions.length).fill('unanswered')); setFinished(false); setReviewOpen(false); }}
                            >
                                🔄 Try Again
                            </button>
                            <button className="btn-ghost" onClick={onBack}>← Home</button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    /* ── QUIZ SCREEN ──────────────────────────────────────────── */
    return (
        <>
            <SEO
                title={`Q${current + 1}/${questions.length} — QuizSnap.ai`}
                description="Answering MCQ questions generated from your textbook page by QuizSnap.ai"
            />
            <main className="quiz-main relative z-10 bg-grid">
                <div className="quiz-inner">

                    {/* Top bar */}
                    <div className="quiz-topbar">
                        <button className="btn-ghost" onClick={onBack} aria-label="Go back to home">← Back</button>
                        <span className="quiz-counter">
                            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{current + 1}</span>
                            <span className="text-slate-500"> / {questions.length}</span>
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="progress-bar mb-6">
                        <div
                            className="progress-fill"
                            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                            role="progressbar"
                            aria-valuenow={current + 1}
                            aria-valuemin={1}
                            aria-valuemax={questions.length}
                        />
                    </div>

                    {/* Question card */}
                    <article className="glass p-5 sm:p-8 mb-5 fade-in-up" style={{ borderColor: 'rgba(0,245,212,0.15)' }}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--teal)' }}>
                            Question {current + 1}
                        </p>
                        <h2 className="text-base sm:text-xl font-semibold text-slate-100 leading-relaxed">
                            {q.question}
                        </h2>
                    </article>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {q.options.map((opt, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const isCorrect = letter === q.answer;
                            const isChosen = letter === chosen;
                            let extraClass = '';
                            if (isAnswered) {
                                if (isCorrect) extraClass = 'correct';
                                else if (isChosen) extraClass = 'wrong';
                            }
                            return (
                                <button
                                    key={i}
                                    className={`option-btn ${extraClass}`}
                                    onClick={() => handleAnswer(letter)}
                                    disabled={isAnswered}
                                    aria-pressed={isChosen}
                                    aria-label={`Option ${letter}: ${opt}`}
                                >
                                    <span className="font-bold mr-3 text-slate-500">{letter}.</span>
                                    {opt.replace(/^[A-D]\.\s*/, '')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback + Next */}
                    {isAnswered && (
                        <div className="flex flex-col items-center gap-3 fade-in-up">
                            <p className={`text-sm font-semibold ${chosen === q.answer ? 'text-green-400' : 'text-red-400'}`}>
                                {chosen === q.answer ? '✓ Correct!' : `✗ Correct answer: ${q.answer}`}
                            </p>
                            <button className="btn-teal" onClick={handleNext}>
                                {current < questions.length - 1 ? 'Next Question →' : 'See Results →'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
