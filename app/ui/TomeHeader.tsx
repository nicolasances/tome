'use client';

import { useState } from 'react';
import RoundButton from './buttons/RoundButton';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import BackSVG from '@/app/ui/graphics/icons/Back';
import { useCarMode } from '@/context/CarModeContext';
import { useHeader } from '@/context/HeaderContext';

export default function TomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { carMode, toggleCarMode } = useCarMode();
    const { config } = useHeader();

    return (
        <>
            <div className="mt-6 px-4 flex justify-between items-center">
                {/* Left section: Back button */}
                <div className="flex-1 flex">
                    {config.backButton?.enabled && (
                        <RoundButton
                            icon={<BackSVG />}
                            onClick={config.backButton.onClick}
                            size="s"
                            secondary
                        />
                    )}
                </div>

                {/* Center section: Title */}
                <div className="flex justify-center text-xl">{config.title || 'Tome'}</div>

                {/* Right section: Car mode icon, custom right icon, and menu button */}
                <div className="flex flex-1 items-center justify-end p-1 flex-shrink-0 gap-2">
                    {carMode && (
                        <MaskedSvgIcon
                            src="/images/car.svg"
                            alt="car mode"
                            size="w-4 h-4"
                            color="bg-red-700"
                            onClick={toggleCarMode}
                        />
                    )}
                    {config.rightIcon && (
                        <MaskedSvgIcon
                            src={config.rightIcon.src}
                            alt={config.rightIcon.alt}
                            size={config.rightIcon.size || "w-4 h-4"}
                            color={config.rightIcon.color || "bg-cyan-800"}
                        />
                    )}
                    {config.actions}
                    {config.rightButton}
                    
                    {/* Menu Button */}
                    <RoundButton
                        svgIconPath={{
                            src: "/images/menu.svg",
                            alt: "Menu",
                        }}
                        slim
                        size="s"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    />
                </div>
            </div>

            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-2xl leading-none text-gray-600 hover:text-gray-900"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                        <span className="text-sm font-medium text-gray-700">Car Mode</span>
                        <button
                            onClick={() => {
                                toggleCarMode();
                                setIsMenuOpen(false);
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
