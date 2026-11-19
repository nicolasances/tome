'use client';

import { useEffect, useRef } from 'react';
import { renderGoogleButton, googleSignIn } from '@/utils/AuthUtil';
import { useAuth } from '@/context/AuthContext';
import { MaskedSvgIcon } from '../components/MaskedSvgIcon';

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
        <div className="flex flex-1 flex-col items-center justify-center h-screen gap-8 bg-cyan-950">
            <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center">
                    <img src="/icon-macos-512.png" alt="Tome" />
                </div>
                <h1 className="text-3xl font-bold text-cyan-200">Welcome to Tome</h1>
                <p className="text-white/60 text-base">Sign in to continue</p>
            </div>
            <div ref={buttonRef} />
        </div>
    );
}
