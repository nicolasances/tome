'use client';

import RoundButton from "@/app/ui/buttons/RoundButton";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import BackSVG from "@/app/ui/graphics/icons/Back";
import { useCarMode } from "@/context/CarModeContext";

interface TomeHeaderProps {
  title: string;
  backButton?: {
    enabled: boolean;
    onClick: () => void;
  };
  rightIcon?: {
    src: string;
    alt: string;
    size?: string;
    color?: string;
  };
}

export default function TomeHeader({
  title,
  backButton,
  rightIcon,
}: TomeHeaderProps) {
  const { carMode, toggleCarMode } = useCarMode();

  return (
    <div className="mt-6 flex justify-between items-center">
      {/* Left section: Back button */}
      <div className="flex-1 flex">
        {backButton?.enabled && (
          <RoundButton
            icon={<BackSVG />}
            onClick={backButton.onClick}
            size="s"
            secondary
          />
        )}
      </div>

      {/* Center section: Title */}
      <div className="flex justify-center text-xl">{title}</div>

      {/* Right section: Car mode icon and custom right icon */}
      <div className="flex flex-1 items-center justify-end p-1 flex-shrink-0 gap-2">
        {carMode && (
          <MaskedSvgIcon
            src="/images/car.svg"
            alt="car mode"
            size="w-5 h-5"
            color="bg-red-700"
            onClick={toggleCarMode}
          />
        )}
        {rightIcon && (
          <MaskedSvgIcon
            src={rightIcon.src}
            alt={rightIcon.alt}
            size={rightIcon.size || "w-5 h-5"}
            color={rightIcon.color || "bg-cyan-800"}
          />
        )}
      </div>
    </div>
  );
}
