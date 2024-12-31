'use client'

export default function SingleValueCard({ value, label, style }: Readonly<{
    value: string,
    label: string, 
    style?: 'normal' | 'empty' | 'none',
}>) {

    let cardStyle = 'bg-cyan-800 text-cyan-100 shadow hover:shadow-lg '
    if (style == 'empty') cardStyle = 'border border-cyan-600 hover:shadow-lg '
    else if (style == 'none') cardStyle = 'hover:shadow-none '

    return (
        <div className={`flex flex-col rounded-md p-4 items-center h-21 min-w-24 ${cardStyle}`}>
            <div className="opacity-60 text-xs uppercase">{label}</div>
            <div className="flex flex-row items-end ">
                <div className="text-lg">{value}</div>
            </div>
        </div>
    )
}