import React, { useState } from "react";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";

export default function RoundButton({
    icon,
    svgIconPath,
    onClick,
    size,
    disabled,
    loading,
    dark,
    secondary,
    slim
}: {
    icon?: React.ReactNode;
    svgIconPath?: {
        src: string;
        alt: string;
        color?: string;
        backgroundSrc?: string;
        backgroundOpacity?: number;
    };
    onClick: () => void;
    size?: "xs" | "s" | "m" | "car" | undefined;
    disabled?: boolean;
    iconOnly?: boolean;
    loading?: boolean;
    dark?: boolean;
    secondary?: boolean;
    slim?: boolean;
}) {
    const [pressed, setPressed] = useState(false);

    let iconSize = "w-6 h-6";
    let buttonPadding = "p-2";

    if (size === "s") {
        iconSize = "w-4 h-4";
        buttonPadding = "p-2";
    } 
    else if (size == "xs") {
        iconSize = "w-3 h-3";
        buttonPadding = "p-1";
    }
    else if (size === "car") {
        iconSize = "w-12 h-12";
        buttonPadding = "p-6";
    }

    if (slim) {
        buttonPadding = "p-0";
    }

    const reactToClick = () => {
        if (disabled || loading) return;
        if (onClick) onClick();
    };

 const baseClasses = `rounded-full ${buttonPadding} ${secondary || slim ? "" : "border-2"} cursor-pointer transition-transform duration-100`;
    const enabledClasses = secondary || slim ? "text-cyan-600 hover:opacity-70" : dark ? "border-cyan-800" : "border-lime-200";
    const disabledClasses = secondary || slim ? "text-cyan-600 cursor-not-allowed opacity-50" : disabled ? "border-cyan-600 cursor-not-allowed" : "border-transparent cursor-not-allowed";

    const iconClasses = `${iconSize} stroke-current fill-current`;
    const iconColor = disabled || loading
        ? "text-cyan-600"
        :  `${dark ? "text-cyan-600" : "text-lime-200"} group-hover:text-current`;
    
    const svgIconColor = disabled || loading
        ? "bg-cyan-600"
        : dark ? "bg-cyan-600" : "bg-lime-200";

    const animatedCircleRadius = 15;

    return (
        <div
            className={`${baseClasses} ${disabled || loading ? disabledClasses : enabledClasses}`}
            style={{
                transform: pressed ? "scale(0.95)" : "scale(1)",
            }}
            onClick={reactToClick}
            onMouseDown={() => !disabled && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => !disabled && setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            tabIndex={0}
            role="button"
            aria-disabled={disabled}
        >
            {svgIconPath ? (
                <MaskedSvgIcon
                    src={svgIconPath.src}
                    alt={svgIconPath.alt}
                    size={iconSize}
                    color={svgIconPath.color || svgIconColor}
                    backgroundSrc={svgIconPath.backgroundSrc}
                    backgroundOpacity={svgIconPath.backgroundOpacity}
                />
            ) : (
                <div className={`${iconClasses} ${iconColor}`}>{icon}</div>
            )}

            {/* Looading animation */}
            {loading && (
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 32 32"
                    fill="none"
                    style={{ zIndex: 1 }}
                >
                    <circle
                        cx="16"
                        cy="16"
                        r={animatedCircleRadius}
                        stroke="#0891b2"
                        strokeWidth="1"
                        strokeDasharray={Math.PI * 2 * animatedCircleRadius}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        style={{
                            transition: "stroke-dashoffset 2s linear",
                            animation: "fillCircle 2s linear infinite"
                        }}
                    />
                    <style>
                        {`
                @keyframes fillCircle {
                    0% { stroke-dashoffset: ${Math.PI * 2 * animatedCircleRadius}; }
                    50% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -${Math.PI * 2 * animatedCircleRadius}; }
                }
                `}
                    </style>
                </svg>
            )}
        </div>
    );
}