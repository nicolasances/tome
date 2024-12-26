'use client'

export default function ScoreCard({ scoreNumerator, scoreDenominator }: Readonly<{ scoreNumerator: number, scoreDenominator: number }>) {

    return (
        <div className="flex flex-col bg-cyan-800 text-cyan-100 rounded-md shadow p-4 items-center hover:shadow-lg h-21 min-w-24">
            <div className="flex flex-row items-end ">
                <div className="text-4xl">{scoreNumerator}</div><div className="text-xs pb-1">/{scoreDenominator}</div>
            </div>
            <div className="opacity-60 text-[8px] uppercase">score</div>
        </div>
    )
}