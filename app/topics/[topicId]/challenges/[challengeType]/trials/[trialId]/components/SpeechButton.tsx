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
    onRecordingComplete?: ({ transcribedText, jobId }: { transcribedText?: string, jobId?: string }) => void;    // Callback to receive transcribed text or the async job id if the mode is "async"
    onAudioBlob?: (audioBlob: Blob) => void;                    // Callback to receive raw audio blob, in case the caller wants to process it themselves
    deviceId?: string;                                          // Optional audio input device ID
    mode?: "sync" | "async";                                    // Mode for the transcription ("sync" or "async" for Whisper API) default is "sync"

}

export interface SpeechButtonHandle {
    startRecording: () => Promise<void>;
}

export const SpeechButton = forwardRef<SpeechButtonHandle, SpeechButtonProps>(function SpeechButton({ onRecordingComplete, onAudioBlob, deviceId, size, mode = "sync" }, ref) {

    const { isSpeaking } = useAudio();
    const { whisperHost } = useContext(SettingsContext)!;

    // ============ WHISPER MODE ============
    const handleRecordingComplete = async (audioBlob: Blob) => {

        if (!whisperHost) {
            console.error("Whisper host is not set in SettingsContext");
            return;
        }

        // If caller wants raw audio blob, provide it
        onAudioBlob?.(audioBlob);

        // If caller wants transcribed text, transcribe it
        if (onRecordingComplete) {

            try {
                const whisperAPI = new WhisperAPI();
                const speechResponse = await whisperAPI.transcribeAudio(audioBlob, whisperHost, mode);

                if (mode == 'sync') {
                    onRecordingComplete({ transcribedText: speechResponse.text});
                }
                else {
                    // We're in async mode. Return the job ID for now
                    onRecordingComplete({ jobId: speechResponse.jobId });
                }


            }
            catch (error) {
                console.error("Error transcribing audio:", error);
                onRecordingComplete({transcribedText: ""}); // Pass empty string on error
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
            onRecordingComplete?.({ transcribedText: transcript });
        },
        onError: (error: string) => {
            console.error("Speech Recognition error:", error);
            onRecordingComplete?.({ transcribedText: "" }); // Pass empty string on error
        },
    });

    // Determine which mode to use and if it's supported
    const isUsingWhisper = true;    // Always use Whisper for now
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
                src: "/images/microphone.svg",
                alt: isActive ? "Stop recording" : "Start recording",
                color: isActive ? "bg-red-700" : "",
            }}
            secondary={isActive}
        />
    );
});
