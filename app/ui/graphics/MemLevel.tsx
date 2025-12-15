'use client'

type Size = 's' | 'm' | 'l' | 'xl';

const sizeMap = {
    s: { radius: 64, viewBox: 160, container: 'w-8 h-8', font: 'text-xs', label: 'text-xs h-[10px]', strokeWidthBg: 6, strokeWidthFg: 5 },
    m: { radius: 80, viewBox: 200, container: 'w-10 h-10', font: 'text-sm', label: 'text-sm h-[12px]', strokeWidthBg: 8, strokeWidthFg: 7 },
    l: { radius: 96, viewBox: 240, container: 'w-12 h-12', font: 'text-base', label: 'text-base h-[14px]', strokeWidthBg: 10, strokeWidthFg: 9 },
    xl: { radius: 220, viewBox: 600, container: 'w-36 h-36', font: 'text-3xl', label: 'text-3xl h-[40px]', strokeWidthBg: 36, strokeWidthFg: 38 },
};

export default function MemLevel({
    perc,
    showLabel,
    size = 's',
}: Readonly<{ perc: number; showLabel?: boolean; size?: Size }>) {
    const { radius, viewBox, container, font, label, strokeWidthBg, strokeWidthFg } = sizeMap[size];
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (perc / 100) * circumference;

    return (
        <div className={`flex flex-row bg-transparent rounded-md items-center justify-center ${container} space-x-1`}>
            <div className={`relative flex items-center justify-center ${container}`}>
                <svg
                    className="transform -rotate-90 scale-y-[-1]"
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${viewBox} ${viewBox}`}
                >
                    {/* Background border */}
                    <circle
                        cx={viewBox / 2}
                        cy={viewBox / 2}
                        r={radius}
                        stroke="#0891b2"
                        strokeWidth={strokeWidthBg}
                        fill="none"
                    />
                    {/* Highlighted portion */}
                    <circle
                        cx={viewBox / 2}
                        cy={viewBox / 2}
                        r={radius}
                        stroke="#d9f99d"
                        strokeWidth={strokeWidthFg}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                {!showLabel && (
                    <div className={`absolute ${font} font-400 text-cyan-950 flex justify-center items-center`}>
                        <svg
                            className={`fill-cyan-100`}
                            style={{ opacity: `${perc + 20}%` }}
                            width="50%"
                            height="50%"
                            viewBox="0 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>lightning-bolt</title>
                            <path d="M23.5 13.187h-7.5v-12.187l-7.5 17.813h7.5v12.187l7.5-17.813z"></path>
                        </svg>
                    </div>
                )}
                {showLabel && (
                    <div className={`absolute ${label}`}>
                        {perc}
                        <span className="text-sm">%</span>
                    </div>
                )}
            </div>
        </div>
    );
}