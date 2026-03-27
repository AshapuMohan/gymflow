'use client';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col">
            <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-4">404</h1>
            <p className="text-white/40 font-sans text-lg">System cannot locate the requested protocol.</p>
            <a href="/" className="mt-8 text-xs font-bold text-accent-gold uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4">
                Return to Base
            </a>
        </div>
    );
}
