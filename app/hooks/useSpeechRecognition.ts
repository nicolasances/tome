import { useState, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    timeoutMs?: number;
    onTranscript?: (transcript: string) => void;
    onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
    const {
        lang = 'en-US',
        continuous = false,
        interimResults = false,
        timeoutMs = 15000,
        onTranscript,
        onError,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [isSupported] = useState(() => {
        if (typeof window === 'undefined') return false;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        return !!SpeechRecognition;
    });

    const startListening = useCallback(() => {

        if (!isSupported) {
            console.warn('Speech Recognition is not supported in this browser');
            onError?.('Speech Recognition is not supported in your browser.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
            console.log('Speech Recognition started');
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            console.log('Speech Recognition result:', transcript);
            onTranscript?.(transcript);
        };

        recognition.onerror = (event: any) => {
            const errorMessage = `Sorry, there was an error with speech recognition: ${event.error}`;
            console.error(errorMessage);
            onError?.(errorMessage);
            setIsListening(false);
        };

        recognition.onend = () => {
            console.log('Speech Recognition ended');
            setIsListening(false);
        };

        // Auto-stop after specified timeout
        const timeoutId = setTimeout(() => {
            recognition.stop();
        }, timeoutMs);

        recognition.start();

        // Return cleanup function
        return () => clearTimeout(timeoutId);
    }, [isSupported, lang, continuous, interimResults, timeoutMs, onTranscript, onError]);

    const stopListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.stop();
            setIsListening(false);
        }
    }, []);

    return {
        isListening,
        isSupported,
        startListening,
        stopListening,
    };
}
