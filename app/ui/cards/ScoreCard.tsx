'use client'

export default function ScoreCard({ scoreNumerator, scoreDenominator, style, round }: Readonly<{
    scoreNumerator: number,
    scoreDenominator: number,
    label: string,
    style?: 'normal' | 'empty',
    round?: boolean 
}>) {

    let cardStyle = 'text-lime-200 border border-2 border-lime-200'
    if (style == 'empty') cardStyle = 'border border-cyan-600'

    return (
        <div className={`flex flex-col rounded-md p-2 items-center ${cardStyle}`}>
            <div className="flex flex-row items-end ">
                <div className="text-xl"><b>{scoreNumerator != -1 ? (round === true ? scoreNumerator.toFixed(1) : scoreNumerator) : '--'}</b></div><div className="text-xs pb-1">/{scoreDenominator}</div>
            </div>
        </div>
    )
}