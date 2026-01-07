'use client'

import { forwardRef, useImperativeHandle } from "react";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { useVoiceRecording } from "@/app/hooks/useVoiceRecording";

interface SpeechButtonProps {
    size?: "xs" | "s" | "m" | "car";
    onRecordingComplete?: (audioBlob: Blob) => void;
    deviceId?: string;
}

export interface SpeechButtonHandle {
    startRecording: () => Promise<void>;
}

export const SpeechButton = forwardRef<SpeechButtonHandle, SpeechButtonProps>(function SpeechButton(
    { onRecordingComplete, deviceId, size },
    ref
) {
    const { isRecording, isSupported, startRecording, stopRecording } = useVoiceRecording({ 
        onRecordingComplete,
        deviceId,
    });

    useImperativeHandle(ref, () => ({
        startRecording: async () => {
            if (!isRecording) {
                await startRecording();
            }
        },
    }));

    if (!isSupported) {
        return null;
    }

    const handleToggleRecording = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    };

    return (
        <RoundButton
            size={size}
            onClick={handleToggleRecording}
            svgIconPath={{
                src: "/images/microphone.svg",
                alt: isRecording ? "Stop recording" : "Start recording",
                color: isRecording ? "bg-red-700" : "",
            }}
            secondary={isRecording}
        />
    );
});
