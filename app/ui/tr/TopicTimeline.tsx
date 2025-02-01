import BottomFade from "../layout/BottomFade"

export default function TopicTimeline() {

    const height = 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 48px)'

    const data = [
        { date: '631', events: ["Period, significant territorial changes occurred in the Mediterranean region involving dif", "It covers the points about Europe's lack of knowledge"] },
        { date: '632', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '633', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '636', events: ["It covers the points about Europe's lack of knowledge", "It happens again tha Charlemagne wins"] },
        { date: '656', events: ["It covers the points about Europe's lack of knowledge", "Defeat of the Burgundians"] },
        { date: '657', events: ["No idea what happened here."] },
        { date: '658', events: ["It covers the points about Europe's lack of knowledge", "Charles Martel becomes King"] },
        { date: '700', events: ["It covers the points about Europe's lack of knowledge", "Defeat of the Arabs"] },
        { date: '702', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '705', events: ["Conquest of Polonia by Alexander"] },
        { date: '708', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '710', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '712', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '722', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '724', events: ["It covers the points about Europe's lack of knowledge"] },
        { date: '726', events: ["It covers the points about Europe's lack of knowledge"] },

    ]

    return (
        <div className="relative">
            <div className="flex flex-col items-center relative no-scrollbar" style={{ maxHeight: height, height: '100%', overflow: "scroll", paddingBottom: 48}}>
                <div className="">
                    {data.map((date: DatePoint) => <Date key={date.date} date={date} />)}
                </div>
            </div>
            <BottomFade height="xl" />
        </div>
    )
}

function Date({ date }: { date: DatePoint }) {
    return (
        <div className="flex flex-row relative py-2">
            <div className="w-1/3 text-right pr-4 text-xl pt-1">{date.date}</div>
            <div className="w-8 h-8 min-w-8 min-h-8 bg-background border-cyan-200 border-2 box-border rounded-full" style={{ zIndex: 4 }}></div>
            <div className="w-2/3 text-left pl-4 pt-1 space-y-1">
                {date.events.map((ev) => <DateEvent key={Math.random()} text={ev} />)}
            </div>

            <div className="flex flex-row justify-center h-full absolute w-full">
                <div className="w-1/3"></div>
                <div className="w-8 min-w-8 flex justify-center">
                    <div className="w-1 border-4 border-cyan-200"></div>
                </div>
                <div className="w-2/3"></div>
            </div>
        </div>
    )
}

function DateEvent({ text }: { text: string }) {

    return (
        <div className="pl-2 text-md">
            <li>{text}</li>
        </div>
    )
}

interface DatePoint {
    date: string
    events: string[]
}