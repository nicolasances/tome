'use client'

import { useState } from 'react';
import RoundButton from "@/app/ui/buttons/RoundButton";
import { AudioDeviceSelector } from './AudioDeviceSelector';

interface AudioDevicePopupProps {
    audioDevices: MediaDeviceInfo[];
    loadAudioDevices: () => Promise<void>;
    onDeviceSelected: (deviceId: string) => void;
}

export function AudioDevicePopup({
    audioDevices,
    loadAudioDevices,
    onDeviceSelected,
}: AudioDevicePopupProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleDeviceSelect = (deviceId: string) => {
        onDeviceSelected(deviceId);
        setIsOpen(false);
    };

    return (
        <>
            <RoundButton
                secondary={true}
                dark={true}
                onClick={() => setIsOpen(!isOpen)}
                svgIconPath={{
                    src: "/images/settings.svg",
                    alt: "Audio Device Settings",
                }}
            />

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <div className="pointer-events-auto">
                            <div className="rounded-lg p-4 w-80 shadow-2xl" style={{ backgroundColor: 'var(--background)' }}>
                                <div className="text-lg font-semibold text-cyan-700 mb-4">
                                    Select Audio Device
                                </div>
                                <AudioDeviceSelector
                                    audioDevices={audioDevices}
                                    loadAudioDevices={loadAudioDevices}
                                    onDeviceSelected={handleDeviceSelect}
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full mt-4 px-4 py-2 bg-cyan-300/20 hover:bg-cyan-300/30 text-cyan-300 rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
