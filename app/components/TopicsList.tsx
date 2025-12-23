'use client'

import { useEffect, useState } from "react";
import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useRouter } from "next/navigation";
import { Challenge, TomeChallengesAPI } from "@/api/TomeChallengesAPI";
import { ProgressBar } from "../ui/general/ProgressBar";

interface ExtendedTopic {
    topic: Topic;
    progress: number;  // Progress in percent (0-100)
    status: "not-started" | "in-progress" | "completed";
}

export function TopicsList() {

    const [topics, setTopics] = useState<ExtendedTopic[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTopics = async () => {
        try {

            const promises = [];
            promises.push(new TomeTopicsAPI().getTopics());
            promises.push(new TomeChallengesAPI().getChallenges());

            const [topicsResponse, challengesResponse] = await Promise.all(promises) as [{ topics: Topic[] }, { challenges: { challenge: Challenge, status: "not-started" | "in-progress" | "completed" }[] }];

            // Calculate progress for each topic based on challenges. For now it's just the number of completed challenges / total challenges for the topic 
            const extendedTopics: ExtendedTopic[] = topicsResponse.topics.map(topic => {

                const topicChallenges = challengesResponse.challenges.filter(c => c.challenge.topicId === topic.id);

                const numCompletedChallenges = topicChallenges.filter(c => c.status === "completed").length;
                const status = topicChallenges.some(c => c.status === "in-progress") ? "in-progress" : (numCompletedChallenges === 0 ? "not-started" : "completed");
                
                let progress = topicChallenges.length === 0 ? 0 : Math.round((numCompletedChallenges / topicChallenges.length) * 100);
                
                if (status == "in-progress" && progress < 3) progress = 3;

                return { topic, progress, status };
            });

            setTopics(extendedTopics);

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
        if (numSections <= 10) return 'signal';
        return 'signal-good';
    }

    return (
        <div className="mt-2 ml-4">
            <SectionHeader title="All Topics" />
            <div className="mb-6 space-y-2">
                {topics.map((extendedTopic) => (
                    <TopicItem key={extendedTopic.topic.id} topic={extendedTopic} signalIcon={getSignalIcon(extendedTopic.topic.numSections)} />
                ))}
            </div>
        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center text-sm opacity-70 py-1 mb-4 w-fit">
            <div className="uppercase">{title}</div>
        </div>
    )
}

function TopicItem({ topic, signalIcon }: { topic: ExtendedTopic, signalIcon: string }) {

    const [pressed, setPressed] = useState(false);
    const router = useRouter();

    return (
        <div className="text-base flex items-center cursor-pointer"
            onClick={() => router.push(`/topics/${topic.topic.id}`)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
                opacity: pressed ? 0.5 : 1,
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
            <div>
                <div>{topic.topic.name}</div>
                {topic.progress > 0 && (<div><ProgressBar size='s' id={topic.topic.id} current={topic.progress} max={100} hideNumber={true} /></div>)}
            </div>
        </div>
    )
}
