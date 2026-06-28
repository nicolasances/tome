'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from './LoginScreen';

export function AuthGuard({ children }: { children: ReactNode }) {
    const { status } = useAuth();

    if (status === 'loading') return <div className="h-screen" />;
    if (status === 'unauthenticated') return <LoginScreen />;

    return <>{children}</>;
}
