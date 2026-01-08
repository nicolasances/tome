'use client'

import { createContext, useContext, useRef, useCallback, useState } from 'react';

interface AudioContextType {
    play: (audioUrl: string, onEnded?: () => void) => Promise<void>;
    stop: () => void;
    pause: () => void;
    replay: () => Promise<void>;
    isSpeaking: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const lastAudioUrlRef = useRef<string | null>(null);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const play = useCallback(async (audioUrl: string, onEnded?: () => void) => {
        // Stop any currently playing audio
        stop();

        lastAudioUrlRef.current = audioUrl;
        setIsSpeaking(true);

        try {
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.addEventListener('ended', () => {
                setIsSpeaking(false);
                if (onEnded) onEnded();
            });

            // Catch and ignore AbortError from interrupted play
            audio.play().catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Error playing audio:', error);
                }
                setIsSpeaking(false);
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsSpeaking(false);
        }
    }, [stop]);

    const replay = useCallback(async () => {
        if (lastAudioUrlRef.current) {
            await play(lastAudioUrlRef.current);
        }
    }, [play]);

    return (
        <AudioContext.Provider value={{ play, stop, pause, replay, isSpeaking }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
