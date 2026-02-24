import type { ReactNode } from 'react';

interface ModeCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    accentColor: 'teal' | 'purple';
    onClick: () => void;
    disabled?: boolean;
}

export default function ModeCard({ icon, title, description, accentColor, onClick, disabled }: ModeCardProps) {
    const isTeal = accentColor === 'teal';
    const color = isTeal ? 'var(--teal)' : 'var(--purple)';
    const glow = isTeal ? 'var(--teal-glow)' : 'var(--purple-glow)';
    const glowStrong = isTeal ? 'var(--teal-glow-strong)' : 'var(--purple-glow-strong)';
    const borderColor = isTeal ? 'rgba(0,245,212,0.2)' : 'rgba(191,90,242,0.2)';
    const hoverBorder = isTeal ? 'rgba(0,245,212,0.5)' : 'rgba(191,90,242,0.5)';

    return (
        <article
            onClick={!disabled ? onClick : undefined}
            className={`glass flex flex-col items-center gap-5 p-8 cursor-pointer select-none transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none' : 'hover:-translate-y-2'}`}
            style={{
                borderColor,
                boxShadow: `0 4px 24px ${glow}`,
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    (e.currentTarget as HTMLElement).style.borderColor = hoverBorder;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${glowStrong}`;
                }
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = borderColor;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${glow}`;
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Start ${title} mode`}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && onClick()}
        >
            {/* Icon badge */}
            <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ background: glow, border: `1px solid ${borderColor}` }}
            >
                <span style={{ color }}>{icon}</span>
            </div>

            <div className="text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color }}>{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>

            <div
                className="w-full py-2.5 rounded-xl text-center font-semibold text-sm transition-all"
                style={{
                    background: glow,
                    color,
                    border: `1px solid ${borderColor}`,
                }}
            >
                Generate →
            </div>
        </article>
    );
}
