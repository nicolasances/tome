import LeafSVG from "@/app/ui/graphics/icons/LeafSVG";

export function TopicProgressBar({ current, max }: { current: number, max: number }) {

    const height = 10;
    const iconHeight = 14;
    // let barHeight = 12;
    const targetProgress = (current / max) * 100; // Set target percentage (0 to 100)

    return (
        <div className="flex flex-row w-full items-center">
            <div className="flex items-center fill-cyan-400" style={{ height: iconHeight, width: iconHeight, marginRight: 4 }}>
                <LeafSVG />
            </div>
            <div className="w-full relative" style={{ height: height }}>
                <div className="bg-cyan-700 w-full h-full rounded-full" style={{ zIndex: 1 }} ></div>
                {current > 4 && <div className="bg-cyan-400 absolute h-full rounded-full" style={{ width: `${targetProgress}%`, top: 0, zIndex: 2 }}></div>}
            </div>
        </div>
    )
}