'use client'

import { useEffect } from 'react';

interface AudioDeviceSelectorProps {
    onDeviceSelected: (deviceId: string) => void;
    audioDevices: MediaDeviceInfo[];
    loadAudioDevices: () => Promise<void>;
}

export function AudioDeviceSelector({
    onDeviceSelected,
    audioDevices,
    loadAudioDevices,
}: AudioDeviceSelectorProps) {
    
    useEffect(() => {
        loadAudioDevices();
    }, [loadAudioDevices]);

    return (
        <div className="mb-4">
            {audioDevices.length > 0 ? (
                <select
                    onChange={(e) => onDeviceSelected(e.target.value)}
                    className="w-full px-3 py-2 border border-cyan-300 rounded-lg bg-transparent focus:outline-none"
                >
                    <option value="">Default Device</option>
                    {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Audio Input ${device.deviceId.slice(0, 5)}`}
                        </option>
                    ))}
                </select>
            ) : (
                <p className="text-sm text-gray-400">
                    Loading audio devices...
                </p>
            )}
        </div>
    );
}
