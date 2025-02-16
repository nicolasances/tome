import { Timeline, TimelineDate } from "@/model/topicReview"

export default function TopicTimeline({ timeline, size }: { timeline?: Timeline, size?: 's' | 'm' }) {

    let height = 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 48px)'
    if (size == 's') height = 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 48px - 94px)'

    if (!timeline || !timeline.timeline) return <div></div>

    return (
        <div className="flex flex-col items-center relative no-scrollbar" style={{ maxHeight: height, height: '100%', overflow: "scroll", paddingBottom: 48 }}>
            <div className="">
                {timeline.timeline.map((date: TimelineDate) => <Date key={date.date} date={date} />)}
            </div>
        </div>
    )
}

function Date({ date }: { date: TimelineDate }) {
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
        <div className="pl-2 text-base">
            <li>{text}</li>
        </div>
    )
}
