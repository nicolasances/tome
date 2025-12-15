

export default function BottomFade({height}: {height?: 'm' | 'lg' | 'xl'}) {

    let h = 'h-[32px]'
    if (height == 'lg') h = 'h-[48px]'
    if (height == 'xl') h = 'h-[64px]'

    return (
        <div className={`absolute ${h} bg-[#00acc1] bottom-0 w-full`} style={{ zIndex:10, background: "linear-gradient( to bottom, rgba(0, 172, 193, 0) 30%, rgba(0, 172, 193, 0.8) 60%, rgb(0, 172, 193) 100% )" }}></div>
    )
}