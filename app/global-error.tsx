'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center h-screen gap-4 p-8" style={{ fontFamily: "'Comfortaa', sans-serif", background: '#0e2a2f', color: 'white' }}>
                    <p>Something went wrong.</p>
                    <button onClick={reset} style={{ padding: '8px 16px', borderRadius: '8px', background: '#0e7490', color: 'white', border: 'none', cursor: 'pointer' }}>Try again</button>
                </div>
            </body>
        </html>
    );
}
