'use client';

import { useEffect, useRef } from 'react';
import { renderGoogleButton, googleSignIn } from '@/utils/AuthUtil';
import { useAuth } from '@/context/AuthContext';

export function LoginScreen() {
    const { setAuthenticated } = useAuth();
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 50;

        const tryRender = () => {
            if ((window as any).google && buttonRef.current) {
                renderGoogleButton(buttonRef.current, (user) => setAuthenticated(user));
                googleSignIn().catch(() => {});
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryRender, 100);
            }
        };

        tryRender();
    }, [setAuthenticated]);

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-8 bg-cyan-950">
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-cyan-800 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">T</span>
                </div>
                <h1 className="text-3xl font-bold text-white">Welcome to Tome</h1>
                <p className="text-white/60 text-base">Sign in to continue</p>
            </div>
            <div ref={buttonRef} />
        </div>
    );
}
