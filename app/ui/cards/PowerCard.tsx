'use client'

export default function PowerCard({ perc }: Readonly<{ perc: number }>) {

    const circleRadius = 64; // Radius of the circle
    const circumference = 2 * Math.PI * circleRadius; // Circumference of the circle
    const offset = circumference - (perc / 100) * circumference;

    return (
        <div className="flex flex-row bg-transparent rounded-md items-center justify-center h-24 min-w-24 space-x-1">
            <div className="relative w-20 h-20 flex items-center justify-center">
                <svg
                    className="transform -rotate-90"
                    width="100%"
                    height="100%"
                    viewBox="0 0 160 160"
                >
                    {/* Background border */}
                    <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        stroke="#0891b2"
                        strokeWidth="4"
                        fill="none"
                    />
                    {/* Highlighted portion */}
                    <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        stroke="#d9f99d"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute text-base font-400 text-cyan-950 flex justify-center items-center">
                    <svg className="fill-cyan-100" width="50%" height="50%" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <title>lightning-bolt</title>
                        <path d="M23.5 13.187h-7.5v-12.187l-7.5 17.813h7.5v12.187l7.5-17.813z"></path>
                    </svg>
                </div>
            </div>
            <div className="">
                <div className="text-2xl">{perc}%</div>
                <div className="text-[8px] uppercase opacity-70">memorization level</div>
            </div>
        </div>
    )
}