import { useState, useRef } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import UploadZone from '../components/UploadZone';
import ModeCard from '../components/ModeCard';
import Spinner from '../components/Spinner';
import type { MCQItem, FlashcardItem, GenerateResponse } from '../types';

interface HomePageProps {
    onMCQReady: (data: MCQItem[]) => void;
    onFlashReady: (data: FlashcardItem[]) => void;
}

type HomeState = 'idle' | 'uploaded' | 'loading' | 'error';

export default function HomePage({ onMCQReady, onFlashReady }: HomePageProps) {
    const [state, setState] = useState<HomeState>('idle');
    const [preview, setPreview] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const imageRef = useRef<{ base64: string; mimeType: string } | null>(null);

    const handleUpload = (base64: string, mimeType: string, previewUrl: string) => {
        imageRef.current = { base64, mimeType };
        setPreview(previewUrl);
        setState('uploaded');
        setErrorMsg('');
    };

    const generate = async (mode: 'mcq' | 'flashcard') => {
        if (!imageRef.current) return;
        setState('loading');
        setErrorMsg('');
        try {
            const res = await axios.post<GenerateResponse>('/api/generate', {
                image: imageRef.current.base64,
                mimeType: imageRef.current.mimeType,
                mode,
            });
            const { data } = res.data;
            if (mode === 'mcq') onMCQReady(data as MCQItem[]);
            else onFlashReady(data as FlashcardItem[]);
        } catch (err: unknown) {
            let msg = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data?.error;
                if (typeof errorData === 'string') {
                    msg = errorData;
                } else if (errorData && typeof errorData === 'object') {
                    // Handle { code, message } or similar objects
                    msg = (errorData as any).message || JSON.stringify(errorData);
                } else {
                    msg = err.message;
                }
            } else if (err instanceof Error) {
                msg = err.message;
            }
            setErrorMsg(msg);
            setState('uploaded');
        }
    };

    return (
        <>
            <SEO />
            <div className="bg-grid min-h-screen relative z-10">

                {/* ── Header ───────────────────────────────── */}
                <header className="home-header">
                    <div
                        className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                        style={{ background: 'rgba(0,245,212,0.08)', color: 'var(--teal)', border: '1px solid rgba(0,245,212,0.2)' }}
                    >
                        ⚡ Powered by Groq AI
                    </div>
                    <h1 className="home-headline">
                        Quiz<span className="glow-teal">Snap</span>
                        <span className="glow-purple">.ai</span>
                    </h1>
                    <p className="home-sub">
                        Snap a photo of any textbook page.<br className="hidden sm:block" />
                        Get instant <strong className="text-slate-200">MCQ quizzes</strong> or{' '}
                        <strong className="text-slate-200">flashcards</strong> in seconds.
                    </p>
                </header>

                {/* ── Main ─────────────────────────────────── */}
                <main className="home-main">

                    {/* Upload / Preview */}
                    {state !== 'loading' && (
                        <section aria-label="Upload textbook image" className="mb-6 fade-in-up">
                            {preview ? (
                                <div className="glass p-4 flex items-center gap-4">
                                    <img
                                        src={preview}
                                        alt="Uploaded textbook page preview"
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl flex-shrink-0"
                                        style={{ border: '1px solid var(--glass-border)' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-200 font-semibold text-sm mb-1">Image ready ✓</p>
                                        <p className="text-slate-500 text-xs">Choose a mode below to generate your study material</p>
                                    </div>
                                    <button
                                        className="btn-ghost text-xs py-1.5 px-3 flex-shrink-0"
                                        onClick={() => { setState('idle'); setPreview(null); imageRef.current = null; }}
                                        aria-label="Remove uploaded image"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <UploadZone onUpload={handleUpload} />
                            )}
                        </section>
                    )}

                    {/* Error */}
                    {errorMsg && (
                        <div
                            className="glass p-4 mb-5 text-sm fade-in-up"
                            style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', background: 'rgba(239,68,68,0.06)' }}
                            role="alert"
                        >
                            <strong>Error:</strong> {errorMsg}
                        </div>
                    )}

                    {/* Loading */}
                    {state === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-16 fade-in-up">
                            <Spinner label="Analyzing your textbook page…" />
                            <p className="text-slate-500 text-xs mt-5 text-center max-w-xs">
                                Groq Vision reads the page, then the logic model crafts your questions. ~10–20 seconds.
                            </p>
                        </div>
                    )}

                    {/* Mode cards */}
                    {state === 'uploaded' && (
                        <section aria-label="Select study mode" className="fade-in-up-delay">
                            <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-5">
                                Choose your study mode
                            </h2>
                            <div className="mode-grid">
                                <ModeCard
                                    icon={<QuizIcon />}
                                    title="MCQ Quiz"
                                    description="Up to 15 multiple-choice questions with instant feedback and a final score."
                                    accentColor="teal"
                                    onClick={() => generate('mcq')}
                                />
                                <ModeCard
                                    icon={<FlashIcon />}
                                    title="Flashcards"
                                    description="3D-flipping cards — tap to reveal answers. Perfect for memorisation."
                                    accentColor="purple"
                                    onClick={() => generate('flashcard')}
                                />
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}

function QuizIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function FlashIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
}
