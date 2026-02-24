export default function Spinner({ label = 'Processing…' }: { label?: string }) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="spinner" role="status" aria-label={label} />
            <p className="text-slate-400 text-sm animate-pulse">{label}</p>
        </div>
    );
}
