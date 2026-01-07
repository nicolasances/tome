interface MaskedSvgIconProps {
    src: string;
    alt: string;
    size?: string;
    color?: string;
    backgroundSrc?: string;
    backgroundOpacity?: number;
    onClick?: () => void;
}

/**
 * A reusable component that displays an SVG icon using CSS mask technique.
 * Allows coloring SVG icons with a solid color, and optionally shows a background SVG.
 * 
 * @param src - The URL of the SVG icon to display
 * @param alt - Alternative text for the icon
 * @param size - Tailwind size class (default: "w-5 h-5")
 * @param color - Tailwind color class for the icon (default: "text-cyan-800")
 * @param backgroundSrc - Optional URL of a background SVG to show behind the icon
 * @param backgroundOpacity - Opacity of the background SVG (default: 0.2, only used if backgroundSrc is provided)
 */
export function MaskedSvgIcon({
    src,
    alt,
    size = "w-5 h-5",
    color = "bg-cyan-800",
    backgroundSrc,
    backgroundOpacity = 0.2, 
    onClick = () => {}
}: MaskedSvgIconProps) {

    const sizeClasses = size;
    const colorClass = color;

    return (
        <div className={`${sizeClasses} relative flex items-center justify-center`} onClick={onClick}>
            {/* Background SVG with low opacity */}
            {backgroundSrc && (
                <div 
                    className={`absolute ${sizeClasses} ${colorClass} opacity-${Math.round(backgroundOpacity * 100)}`}
                    style={{
                        maskImage: `url(${backgroundSrc})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskImage: `url(${backgroundSrc})`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        opacity: backgroundOpacity
                    }}
                ></div>
            )}
            
            {/* Foreground SVG */}
            <div 
                className={`${sizeClasses} ${colorClass} relative z-10`}
                style={{
                    maskImage: `url(${src})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: `url(${src})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center'
                }}
                title={alt}
            ></div>
        </div>
    );
}
