'use client'

import { useState, useEffect, useRef } from 'react';
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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-cyan-400/20 rounded transition"
                title="Audio Device Settings"
            >
                <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
            </button>

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
                            <div className="bg-slate-950 border-2 border-cyan-300 rounded-lg p-6 w-80 shadow-2xl">
                                <h2 className="text-lg font-semibold text-cyan-300 mb-4">
                                    Select Audio Device
                                </h2>
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
