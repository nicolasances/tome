'use client'

export default function ScoreCard({ scoreNumerator, scoreDenominator, label, style }: Readonly<{
    scoreNumerator: number,
    scoreDenominator: number,
    label: string, 
    style?: 'normal' | 'empty',
}>) {

    let cardStyle = 'bg-cyan-800 text-cyan-100 shadow '
    if (style == 'empty') cardStyle = 'border border-cyan-600'

    return (
        <div className={`flex flex-col rounded-md p-4 items-center hover:shadow-lg h-21 min-w-24 ${cardStyle}`}>
            <div className="flex flex-row items-end ">
                <div className="text-4xl">{scoreNumerator}</div><div className="text-xs pb-1">/{scoreDenominator}</div>
            </div>
            <div className="opacity-60 text-[8px] uppercase">{label}</div>
        </div>
    )
}