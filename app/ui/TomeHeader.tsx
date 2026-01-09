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
                className={`fixed top-0 right-0 h-full w-64 shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ backgroundColor: 'var(--background)' }}
            >
                <div className="flex flex-col gap-4">
                    <MenuItem onClick={() => {window.location = "/" as any}} icon="/images/home.svg" iconColor="bg-cyan-700" label="Home" />
                    <MenuItem onClick={toggleCarMode} icon="/images/car.svg" iconColor={carMode ? "bg-red-700" : "bg-cyan-700"} label="Car Mode" tag={carMode ? "active" : undefined} />
                </div>
            </div>
        </>
    );
}

function MenuItem({ onClick, icon, iconColor, label, tag }: { onClick?: () => void, icon: string, iconColor: string, label: string, tag?: string }) {

    const [pressed, setPressed] = useState(false);

    return (
        <div className="flex items-center text-base gap-4 cursor-pointer" onClick={onClick}
            style={{ transform: pressed ? "scale(0.95)" : "scale(1)", }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
        >
            <div>
                <MaskedSvgIcon src={icon} alt={label} color={iconColor} />
            </div>
            <div className="pt-1">{label} {tag && (<span className='rounded-full bg-red-300 px-2 ml-2'>{tag}</span>)}</div>
        </div>
    )
}