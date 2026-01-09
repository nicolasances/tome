'use client';

import { useState } from 'react';
import { useCarMode } from '@/context/CarModeContext';
import RoundButton from './buttons/RoundButton';

export default function SideMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { carMode, toggleCarMode } = useCarMode();

    return (
        <>
            {/* Menu Icon - Fixed in top right */}
            <div className="fixed top-5 right-4 z-40">
                <RoundButton
                    svgIconPath={{
                        src: "/images/menu.svg",
                        alt: "Menu",
                    }}
                    slim
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-64 shadow-lg z-40 transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ backgroundColor: 'var(--background' }}
            >
                <div className="flex justify-between items-center mb-8">
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                        <span className="text-sm font-medium">Car Mode</span>
                        <button
                            onClick={() => {
                                toggleCarMode();
                            }}
                            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                                carMode
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            }`}
                        >
                            {carMode ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
