'use client'

import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import { useVoiceRecording } from "@/app/hooks/useVoiceRecording";

interface SpeechButtonProps {
    onRecordingComplete?: (audioBlob: Blob) => void;
    deviceId?: string;
}

export function SpeechButton({ 
    onRecordingComplete, 
    deviceId 
}: SpeechButtonProps) {

    const { isRecording, isSupported, startRecording, stopRecording } = useVoiceRecording({ 
        onRecordingComplete,
        deviceId,
    });

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
        <button
            onClick={handleToggleRecording}
            disabled={false}
            className="absolute right-14 bottom-3 flex items-center justify-center transition"
            title={isRecording ? "Stop recording" : "Start recording"}
        >
            <MaskedSvgIcon
                src="/images/microphone.svg"
                alt="Speech"
                size="w-6 h-6"
                color={
                    isRecording
                        ? "bg-red-400"
                        : "bg-cyan-200"
                }
            />
        </button>
    );
}
