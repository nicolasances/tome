'use client'
import { createContext, useState, useEffect } from "react";

interface SettingsContextType {
    whisperHost?: "toto" | "openai";
    setWhisperHost: (host: "toto" | "openai") => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined)


export function SettingsProvider({ children }: { children: React.ReactNode }) {

    // Always start with default to match server-side render
    const [whisperHost, setWhisperHost] = useState<"toto" | "openai" | undefined>(undefined);

    // Load from localStorage after component mounts (client-side only)
    useEffect(() => {
        const saved = localStorage.getItem("whisperHost");
        if (saved === "toto" || saved === "openai") {
            setWhisperHost(saved);
        }
    }, []);

    // Save to localStorage whenever it changes
    useEffect(() => {
        if (whisperHost) {
            localStorage.setItem("whisperHost", whisperHost);
        }
    }, [whisperHost]);

    return (
        <SettingsContext.Provider value={{whisperHost, setWhisperHost}}>
            {children}
        </SettingsContext.Provider>
    )
}