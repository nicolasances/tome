import React, { useState } from "react";

export default function RoundButton({
    icon,
    onClick,
    size,
    disabled,
    iconOnly,
    loading,
}: {
    icon: React.ReactNode;
    onClick: () => void;
    size?: "xs" | "s" | "m" | undefined;
    disabled?: boolean;
    iconOnly?: boolean;
    loading?: boolean
}) {
    const [pressed, setPressed] = useState(false);

    let iconSize = "w-8 h-8";
    let buttonPadding = "p-3";

    if (size === "s") {
        iconSize = "w-4 h-4";
        buttonPadding = "p-2";
    } else if (size == "xs") {
        iconSize = "w-3 h-3";
        buttonPadding = "p-1";
    }

    const reactToClick = () => {
        if (disabled || loading) return;
        if (onClick) onClick();
    };

    const baseClasses = `rounded-full ${buttonPadding} ${iconOnly ? "" : "border-2"
        } cursor-pointer transition-transform duration-100`;
    const enabledClasses = "border-lime-200";
    const disabledClasses = disabled ? "border-cyan-600 cursor-not-allowed" : "border-transparent cursor-not-allowed";

    const iconClasses = `${iconSize} stroke-current fill-current`;
    const iconColor = disabled || loading
        ? "text-cyan-600"
        :  "text-lime-200 group-hover:text-current";

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
            <div className={`${iconClasses} ${iconColor}`}>{icon}</div>

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