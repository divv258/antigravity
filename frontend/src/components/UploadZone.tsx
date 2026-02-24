import { useRef, useState } from 'react';

interface UploadZoneProps {
    onUpload: (base64: string, mimeType: string, preview: string) => void;
    disabled?: boolean;
}

export default function UploadZone({ onUpload, disabled }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            // DataURL format: "data:<mimeType>;base64,<data>"
            const [meta, base64] = dataUrl.split(',');
            const mimeType = meta.split(':')[1].split(';')[0];
            onUpload(base64, mimeType, dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div
            className={`upload-zone flex flex-col items-center justify-center gap-5 p-12 transition-all ${dragging ? 'dragging' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload a textbook page image"
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
                aria-label="File upload input"
            />

            {/* Upload icon */}
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                    background: 'var(--teal-glow)',
                    border: '1px solid rgba(0,245,212,0.3)',
                    boxShadow: '0 0 40px var(--teal-glow)',
                }}
            >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
            </div>

            <div className="text-center">
                <p className="text-lg font-semibold text-slate-200 mb-1">
                    Drop your textbook photo here
                </p>
                <p className="text-slate-500 text-sm">
                    or <span style={{ color: 'var(--teal)' }}>click to browse</span> · JPG, PNG, WEBP supported
                </p>
            </div>
        </div>
    );
}
