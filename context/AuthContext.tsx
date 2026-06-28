'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'universal-cookie';
import { getStoredUserToken } from '@/utils/AuthUtil';
import { AuthAPI } from '@/api/AuthAPI';

const cookies = new Cookies();

interface AuthenticatedUser {
    name: string;
    email: string;
    idToken: string;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
    status: AuthStatus;
    user: AuthenticatedUser | null;
    setAuthenticated: (user: AuthenticatedUser) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [user, setUser] = useState<AuthenticatedUser | null>(null);

    useEffect(() => {
        const verify = async () => {
            const stored = getStoredUserToken();
            if (!stored) {
                setStatus('unauthenticated');
                return;
            }
            try {
                const result = await new AuthAPI().verifyToken(stored.idToken);
                if (result?.name === 'TokenExpiredError') {
                    setStatus('unauthenticated');
                } else {
                    setUser(stored);
                    setStatus('authenticated');
                }
            } catch {
                setStatus('unauthenticated');
            }
        };
        verify();
    }, []);

    const setAuthenticated = (authenticatedUser: AuthenticatedUser) => {
        setUser(authenticatedUser);
        setStatus('authenticated');
    };

    const signOut = () => {
        window.localStorage.removeItem('user');
        cookies.remove('user', { path: '/' });
        setUser(null);
        setStatus('unauthenticated');
    };

    return (
        <AuthContext.Provider value={{ status, user, setAuthenticated, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
