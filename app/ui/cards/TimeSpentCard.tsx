'use client'

export default function TimeSpentCard({ perc }: Readonly<{ perc: number }>) {

    return (
        <div className="flex flex-col bg-cyan-800 text-cyan-100 rounded-md shadow p-4 items-center hover:shadow-lg h-24 min-w-24">
            <div className="flex flex-row items-end ">
                <div className="text-4xl">{perc}</div><div className="text-xs pb-1">/15</div>
            </div>
            <div className="opacity-40 text-xs -mt-1">min</div>
        </div>
    )
}