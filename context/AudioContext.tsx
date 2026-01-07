'use client'

import { createContext, useContext, useRef, useCallback } from 'react';

interface AudioContextType {
    play: (audioUrl: string, onEnded?: () => void) => Promise<void>;
    stop: () => void;
    pause: () => void;
    isSpeaking: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isSpeakingRef = useRef(false);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const play = useCallback(async (audioUrl: string, onEnded?: () => void) => {
        // Stop any currently playing audio
        stop();

        isSpeakingRef.current = true;

        try {
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.addEventListener('ended', () => {
                isSpeakingRef.current = false;
                if (onEnded) onEnded();
            });

            // Catch and ignore AbortError from interrupted play
            audio.play().catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Error playing audio:', error);
                }
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            isSpeakingRef.current = false;
        }
    }, [stop]);

    return (
        <AudioContext.Provider value={{ play, stop, pause, isSpeaking: isSpeakingRef.current }}>
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
