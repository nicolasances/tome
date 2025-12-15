"use client"

import { TomeFlashcardsAPI, TrackingEvent } from "@/api/TomeFlashcardsAPI"
import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI"
import RoundButton from "@/app/ui/buttons/RoundButton";
import RefreshSVG from "@/app/ui/graphics/icons/RefreshSVG";
import { SyncSVG } from "@/app/ui/graphics/icons/SyncSVG";
import Tick from "@/app/ui/graphics/icons/Tick";
import { FCTypeTracking, groupTrackingEvents, SectionTracking, TopicTracking } from "@/utils/TrackingEventUtil";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";

export default function TopicRefreshTrackingPage() {

    const params = useParams()

    const [topic, setTopic] = useState<Topic>()
    const [groupedEvents, setGroupedEvents] = useState<TopicTracking>()

    const loadData = async () => {
        loadTopic();
        loadTrackingEvents();
    }

    const loadTrackingEvents = async () => {

        const { events } = await new TomeFlashcardsAPI().getTrackingEvents(String(params.topicId));

        const groupedEvents = groupTrackingEvents(events);

        setGroupedEvents(groupedEvents);
    }


    /**
     * Load the topic 
     */
    const loadTopic = async () => {

        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));

        setTopic(topic);

    }

    const rescrapeTopic = async () => {

        await new TomeTopicsAPI().refreshTopic(String(params.topicId));

        setTimeout(() => { loadTrackingEvents() }, 2000);
    }

    useEffect(() => { loadData() }, [params.topicId])

    if (!topic) return (<></>);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-8 h-full">
            <div className="mt-6 flex justify-center text-xl">{topic?.name}</div>
            <div className="flex items-center justify-center my-4 space-x-2">
                <RoundButton icon={<SyncSVG />} onClick={rescrapeTopic} />
                <RoundButton icon={<RefreshSVG />} onClick={loadTrackingEvents} />
            </div>
            <div className="flex flex-col mt-4 space-y-2">
                {groupedEvents && groupedEvents.sectionEvents.map((section, index) => (
                    <Section key={index} section={section} />
                ))}
            </div>
        </div>
    )
}

function Section({ section }: { section: SectionTracking }) {

    const [expanded, setExpanded] = useState(false);

    const toggleSection = () => {
        // Handle section expansion logic here
        setExpanded(!expanded);
    }

    return (
        <div className="bg-cyan-700 px-2 py-2 rounded cursor-pointer">
            <div className="flex items-center" onClick={toggleSection}>
                <div className={`flex justify-center items-center w-4 h-4 rounded-full border ${section.generated ? "border-cyan-200 bg-cyan-200 fill-cyan-800 text-cyan-800" : "border-red-400"}`}>
                    {section.generated == true ? (<Tick />) : (<></>)}
                </div>
                <div className="ml-2 text-base text-cyan-200">
                    {section.sectionCode}
                </div>
            </div>

            {expanded &&
                <div className="flex flex-col mt-4 space-y-2">
                    {section.sectionEvents.map((group, index) => (<SectionTypeGroup key={index} group={group} />))}
                </div>

            }
        </div>
    );
}

function SectionTypeGroup({ group }: { group: FCTypeTracking }) {

    const [expanded, setExpanded] = useState(false);

    const toggleSection = () => {
        // Handle section expansion logic here
        setExpanded(!expanded);
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center" onClick={toggleSection}>
                <div className={`flex justify-center items-center w-4 h-4 rounded border ${group.generated ? "border-cyan-200 bg-cyan-200 fill-cyan-800 text-cyan-800" : "border-red-400"}`}>
                    {group.generated == true ? (<Tick />) : (<></>)}
                </div>
                <div className="ml-2 text-base text-cyan-200">
                    {group.type}
                </div>
            </div>

            {expanded &&
                <div className="flex flex-col mt-2 space-y-1 pl-[5px]">
                    {group.events.map((event, index) => (
                        <Event key={index} event={event} />
                    ))}
                </div>
            }

        </div>
    );
}

function Event({ event }: { event: TrackingEvent }) {

    const [pressed, setPressed] = useState(false);

    return (
        <div className="flex items-center">
            <div className="w-2 h-2 min-w-[0.5rem] min-h-[0.5rem] bg-cyan-400 rounded-full"></div>
            <div className="flex flex-col border-l border-cyan-200 ml-2">
                <div className="ml-2 text-base text-cyan-200">
                    {event.eventType}
                </div>
                <div className="ml-2 text-xs text-cyan-300">
                    <span>{event.timestamp}</span>
                </div>
                <div
                    className={`ml-2 text-xs text-cyan-300 cursor-pointer hover:underline transition-transform duration-100`}
                    style={{
                        transform: pressed ? "scale(0.95)" : "scale(1)",
                    }}
                    onClick={() => {
                        navigator.clipboard.writeText(event.trackingId);
                    }}
                    onMouseDown={() => setPressed(true)}
                    onMouseUp={() => setPressed(false)}
                    onMouseLeave={() => setPressed(false)}
                    onTouchStart={() => setPressed(true)}
                    onTouchEnd={() => setPressed(false)}
                    title="Copy to clipboard"
                >
                    {event.trackingId}
                </div>
            </div>
        </div>
    )
}   