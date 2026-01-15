'use client'

import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { useVoiceRecording } from "@/app/hooks/useVoiceRecording";
import { useSpeechRecognition } from "@/app/hooks/useSpeechRecognition";
import { WhisperAPI } from "@/api/WhisperAPI";
import { useAudio } from "@/context/AudioContext";
import { SettingsContext } from "@/context/SettingsContext";

interface SpeechButtonProps {
    size?: "xs" | "s" | "m" | "car";
    onRecordingComplete?: (transcribedText: string) => void;    // Callback to receive transcribed text
    onAudioBlob?: (audioBlob: Blob) => void;                    // Callback to receive raw audio blob, in case the caller wants to process it themselves
    deviceId?: string;                                          // Optional audio input device ID
    mode?: "whisper" | "default";                               // "whisper" for audio transcription, "default" for embedded (browser) API (default: "default")
}

export interface SpeechButtonHandle {
    startRecording: () => Promise<void>;
}

export const SpeechButton = forwardRef<SpeechButtonHandle, SpeechButtonProps>(function SpeechButton({ onRecordingComplete, onAudioBlob, deviceId, size, mode = "default" }, ref) {

    const [isTranscribing, setIsTranscribing] = useState(false);
    const { isSpeaking } = useAudio();
    const { whisperHost } = useContext(SettingsContext)!;

    // ============ WHISPER MODE ============
    const handleRecordingComplete = async (audioBlob: Blob) => {
        // If caller wants raw audio blob, provide it
        onAudioBlob?.(audioBlob);

        // If caller wants transcribed text, transcribe it
        if (onRecordingComplete) {
            setIsTranscribing(true);

            try {
                const whisperAPI = new WhisperAPI();
                const transcribedText = await whisperAPI.transcribeAudio(audioBlob, whisperHost);

                console.log("Transcribed text:", transcribedText);

                onRecordingComplete(transcribedText);

            }
            catch (error) {
                console.error("Error transcribing audio:", error);
                onRecordingComplete(""); // Pass empty string on error
            }
            finally {
                setIsTranscribing(false);
            }
        }
    };

    const { isRecording: isRecordingWhisper, isSupported: isSupportedWhisper, startRecording: startRecordingWhisper, stopRecording: stopRecordingWhisper } = useVoiceRecording({ onRecordingComplete: handleRecordingComplete, deviceId });

    // ============ DEFAULT MODE ============
    const { isListening, isSupported: isSupportedDefault, startListening, stopListening } = useSpeechRecognition({
        lang: "en-US",
        continuous: false,
        interimResults: false,
        timeoutMs: 15000,
        onTranscript: (transcript: string) => {
            console.log("Speech Recognition result:", transcript);
            onRecordingComplete?.(transcript);
        },
        onError: (error: string) => {
            console.error("Speech Recognition error:", error);
            onRecordingComplete?.(""); // Pass empty string on error
        },
    });

    // Determine which mode to use and if it's supported
    const isUsingWhisper = mode === "whisper";
    const isSupported = isUsingWhisper ? isSupportedWhisper : isSupportedDefault;
    const isActive = isUsingWhisper ? isRecordingWhisper : isListening;

    /**
     * Used to programmatically start the recording from parent components
     */
    useImperativeHandle(ref, () => ({
        startRecording: async () => {
            if (!isActive) {
                if (isUsingWhisper) {
                    await startRecordingWhisper();
                } else {
                    startListening();
                }
            }
        },
    }));

    if (!isSupported) {
        return null;
    }

    /**
     * Toggles the recording state (start/stop)
     */
    const handleToggleRecording = async () => {
        if (isUsingWhisper) {
            if (isRecordingWhisper) {
                await stopRecordingWhisper();
            } else {
                await startRecordingWhisper();
            }
        } else {
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
    };

    return (
        <RoundButton
            disabled={isSpeaking}
            size={size}
            onClick={handleToggleRecording}
            svgIconPath={{
                src: isTranscribing ? "/images/processing-voice.svg" : "/images/microphone.svg",
                alt: isActive ? "Stop recording" : "Start recording",
                color: isActive || isTranscribing ? "bg-red-700" : "",
            }}
            secondary={isActive || isTranscribing}
        />
    );
});
