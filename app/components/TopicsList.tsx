'use client'

import { useEffect, useState } from "react";
import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useRouter } from "next/navigation";

export function TopicsList() {

    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadTopics = async () => {
        try {
            const { topics } = await new TomeTopicsAPI().getTopics();
            setTopics(topics);
        } catch (error) {
            console.error('Error loading topics:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTopics();
    }, []);

    if (loading) {
        return <div className="text-base opacity-50">Loading Topics..</div>
    }

    if (topics.length === 0) {
        return <div className="text-base opacity-50">No topics yet</div>
    }

    /**
     * Determines which signal icon to use based on the number of sections
     * signal-weak: 1-3 sections
     * signal-fair: 4-6 sections
     * signal-good: 7-10 sections
     * signal: 11+ sections
     */
    const getSignalIcon = (numSections?: number) => {
        if (!numSections) return 'signal-weak';
        if (numSections <= 3) return 'signal-weak';
        if (numSections <= 6) return 'signal-fair';
        if (numSections <= 10) return 'signal-good';
        return 'signal';
    }

    return (
        <div className="mt-2">
            <SectionHeader title="All Topics" />
            <div className="mb-6 mx-4 space-y-2">
                {topics.map((topic) => (
                    <TopicItem key={topic.id} topic={topic} signalIcon={getSignalIcon(topic.numSections)} />
                ))}
            </div>
        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center text-sm opacity-70 ml-2 py-1 mb-4 w-fit">
            <div className="uppercase">{title}</div>
        </div>
    )
}

function TopicItem({ topic, signalIcon }: { topic: Topic, signalIcon: string }) {

    const [pressed, setPressed] = useState(false);
    const router = useRouter();

    return (
        <div className="text-base flex items-center cursor-pointer"
            onClick={() => router.push(`/topics/${topic.id}`)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
                transform: pressed ? "scale(0.95)" : "scale(1)",
            }}
        >
            <div className="w-10 h-10 mr-3 flex items-center justify-center border-2 border-cyan-800 rounded-full p-1 relative">
                {/* Background: full signal with low opacity */}
                <div 
                    className="absolute w-5 h-5 bg-cyan-800 opacity-20"
                    style={{
                        maskImage: `url(/images/signal.svg)`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskImage: `url(/images/signal.svg)`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center'
                    }}
                ></div>
                {/* Foreground: actual signal icon */}
                <div 
                    className="w-5 h-5 bg-cyan-800 relative z-10"
                    style={{
                        maskImage: `url(/images/${signalIcon}.svg)`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskImage: `url(/images/${signalIcon}.svg)`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center'
                    }}
                ></div>
            </div>
            <div>{topic.name}</div>
        </div>
    )
}
