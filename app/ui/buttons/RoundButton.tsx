import React, { useState } from "react";

export default function RoundButton({
    icon,
    onClick,
    size,
    disabled,
    iconOnly,
}: {
    icon: React.ReactNode;
    onClick: () => void;
    size?: "xs" | "s" | "m" | undefined;
    disabled?: boolean;
    iconOnly?: boolean;
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
        if (disabled) return;
        if (onClick) onClick();
    };

    const baseClasses = `rounded-full ${buttonPadding} ${
        iconOnly ? "" : "border-2"
    } cursor-pointer transition-transform duration-100`;
    const enabledClasses = "border-lime-200";
    const disabledClasses = "border-cyan-600 cursor-not-allowed";

    const iconClasses = `${iconSize} stroke-current fill-current`;
    const iconColor = disabled
        ? "text-cyan-600"
        : "text-lime-200 group-hover:text-current";

    return (
        <div
            className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
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
        </div>
    );
}