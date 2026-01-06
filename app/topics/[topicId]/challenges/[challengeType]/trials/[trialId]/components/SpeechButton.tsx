'use client'

import RoundButton from "@/app/ui/buttons/RoundButton";
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
        <RoundButton
            onClick={handleToggleRecording}
            svgIconPath={{
                src: "/images/microphone.svg",
                alt: isRecording ? "Stop recording" : "Start recording",
                color: isRecording ? "bg-red-400" : "",
            }}
        />
    );
}
