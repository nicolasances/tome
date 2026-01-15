import { createContext, useState } from "react";

interface SettingsContextType {
    whisperHost: "toto" | "openai";
    setWhisperHost: (host: "toto" | "openai") => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)


export function SettingsProvider({ children }: { children: React.ReactNode }) {

    const [whisperHost, setWhisperHost] = useState<"toto" | "openai">("openai");

    return (
        <SettingsContext.Provider value={{whisperHost, setWhisperHost}}>
            {children}
        </SettingsContext.Provider>
    )
}