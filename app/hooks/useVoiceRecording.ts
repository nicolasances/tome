import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecordingOptions {
    onRecordingComplete?: (audioBlob: Blob) => void;
    deviceId?: string;
}

interface UseVoiceRecordingReturn {
    isRecording: boolean;
    isSupported: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    resetRecording: () => void;
    audioDevices: MediaDeviceInfo[];
    loadAudioDevices: () => Promise<void>;
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}): UseVoiceRecordingReturn {

    const [isRecording, setIsRecording] = useState(false);
    const [isSupported] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !!(navigator.mediaDevices?.getUserMedia);
    });
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

    const audioChunksRef = useRef<Blob[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const loadAudioDevices = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            setAudioDevices(audioInputs);
            console.log('Available audio devices:', audioInputs);
        } catch (error) {
            console.error('Error enumerating audio devices:', error);
        }
    }, []);

    const startRecording = useCallback(async () => {
        if (!isSupported) {
            console.warn('Voice recording is not supported in this browser');
            return;
        }

        try {
            // Clear any previously recorded audio
            audioChunksRef.current = [];

            // Request access to the user's microphone
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    deviceId: options.deviceId ? { exact: options.deviceId } : undefined,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: true,
                }
            });

            console.log('Got audio stream:', stream);
            console.log('Audio tracks:', stream.getAudioTracks());
            console.log('Audio track enabled:', stream.getAudioTracks()[0]?.enabled);

            // Create a new MediaRecorder instance using the audio stream
            const mediaRecorder = new MediaRecorder(stream);

            console.log('MediaRecorder created with MIME type:', mediaRecorder.mimeType);

            // Save the recorder instance to the ref so it can be accessed later
            mediaRecorderRef.current = mediaRecorder;

            // When audio data is available (every 500ms), store it in the chunks array
            mediaRecorder.addEventListener('dataavailable', (event) => {
                console.log('dataavailable event:', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            mediaRecorder.addEventListener('start', () => {
                console.log('MediaRecorder started');
            });

            mediaRecorder.addEventListener('error', (event) => {
                console.error('MediaRecorder error:', event.error);
            });

            // Start recording and collect audio chunks every 500ms
            mediaRecorder.start(500);

            // Set recording state to true
            setIsRecording(true);
            console.log('Recording started');
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }, [isSupported]);

    const stopRecording = useCallback(async () => {
        return new Promise<void>((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve();
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;

            // When recording stops, combine chunks and trigger callback
            mediaRecorder.addEventListener('stop', () => {
                console.log('Recording stopped. Total chunks:', audioChunksRef.current.length);
                
                // Combine the audio chunks into a single Blob
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                console.log('Created audio blob with size:', audioBlob.size, 'bytes');

                // Notify parent component with the final audio Blob
                options.onRecordingComplete?.(audioBlob);

                // Update recording state to false
                setIsRecording(false);
                resolve();
            }, { once: true });

            // Stop the media recorder (this triggers the 'stop' event)
            mediaRecorder.stop();

            // Stop all tracks from the media stream to release the microphone
            mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        });
    }, [options]);

    const resetRecording = useCallback(() => {
        audioChunksRef.current = [];
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current = null;
        }
        setIsRecording(false);
    }, []);

    return {
        isRecording,
        isSupported,
        startRecording,
        stopRecording,
        resetRecording,
        audioDevices,
        loadAudioDevices,
    };
}
