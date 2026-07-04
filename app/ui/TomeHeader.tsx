'use client';

import RoundButton from './buttons/RoundButton';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import BackSVG from '@/app/ui/graphics/icons/Back';
import { useCarMode } from '@/context/CarModeContext';
import { useHeader } from '@/context/HeaderContext';
import { useRouter } from 'next/navigation';

export default function TomeHeader() {
    const { carMode, toggleCarMode } = useCarMode();
    const { config } = useHeader();
    const router = useRouter();

    return (
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
                    onClick={() => router.push('/menu')}
                />
            </div>
        </div>
    );
}