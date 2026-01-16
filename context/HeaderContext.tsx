'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderConfig {
    title?: string;
    actions?: React.ReactNode;
    backButton?: {
        enabled: boolean;
        onClick: () => void;
    };
    rightIcon?: {
        src: string;
        alt: string;
        size?: string;
        color?: string;
    };
    rightButton?: React.ReactNode;
}

interface HeaderContextType {
    config: HeaderConfig;
    setConfig: (config: HeaderConfig) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<HeaderConfig>({
        title: '',
        actions: undefined,
        backButton: {
            enabled: false,
            onClick: () => {},
        },
        rightIcon: undefined,
        rightButton: undefined,
    });

    return (
        <HeaderContext.Provider value={{ config, setConfig }}>
            {children}
        </HeaderContext.Provider>
    );
}

export function useHeader() {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
}
