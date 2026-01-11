'use client'

import { useEffect, useState } from "react";
import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useRouter } from "next/navigation";
import { Challenge, TomeChallengesAPI } from "@/api/TomeChallengesAPI";
import { MaskedSvgIcon } from "./MaskedSvgIcon";

interface ExtendedTopic {
    topic: Topic;
    progress: number;  // Progress in percent (0-100)
    status: "not-started" | "in-progress" | "completed";
}

export function BrainView() {

    const [topics, setTopics] = useState<ExtendedTopic[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadTopics = async () => {

        try {

            setTimeout(() => {
                if (topics.length === 0) setLoading(true)
            }, 300); // Show loading only if it takes more than 200ms

            const promises = [];
            promises.push(new TomeTopicsAPI().getTopics());
            promises.push(new TomeChallengesAPI().getChallenges());

            const [topicsResponse, challengesResponse] = await Promise.all(promises) as [{ topics: Topic[] }, { challenges: { challenge: Challenge, status: "not-started" | "in-progress" | "completed" }[] }];
            await new Promise(resolve => setTimeout(resolve, 3000)); // Artificial delay to show loading state

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

    return (
        <div className="grid grid-cols-7 gap-2">
            {topics && topics.map((t) => (
                <BrainTile key={`braintile-${t.topic.id!}`} topic={t} onClick={() => { router.push(`/topics/${t.topic.id}`) }} loading={false} />
            ))}
            {loading && topics.length === 0 && Array.from({ length: 12 }).map((_, i) => (
                <BrainTile key={`braintile-loading-${i}`} loading={true} />
            ))}
        </div>
    )
}

export function BrainTile({ topic, onClick, loading }: { topic?: ExtendedTopic, onClick?: (topic: ExtendedTopic) => void, loading: boolean }) {

    const [pressed, setPressed] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [bgColor, setBgColor] = useState("bg-lime-200");
    const timerRef = 0;

    // const finalOpacity = (topic?.status === "not-started" ? 0.1 : (topic?.progress ?? 0) / 100);

    useEffect(() => {
        if (loading) setInterval(() => {
            setOpacity(Math.random() * 0.2);
            setBgColor("bg-black");
        }, 500)
        else {
            setOpacity((topic?.status === "not-started" ? 0.1 : (topic?.progress ?? 0) / 100));
            setBgColor("bg-lime-200");
            clearInterval(timerRef);
        }
    }, [loading])

    return (
        <div className={`w-10 h-10 rounded bg-cyan-700 cursor-pointer relative`}
            style={{
                transform: pressed ? "scale(0.95)" : "scale(1)",
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            onClick={() => { if (onClick && topic) onClick(topic) }}
        >
            <div className={`absolute inset-0 rounded ${bgColor}`} style={{ opacity }} />
            <div className={`w-full h-full flex items-center rounded justify-center relative z-10`}>
                {topic?.topic.icon && (
                    <MaskedSvgIcon
                        src={topic.topic.icon}
                        alt={topic.topic.name}
                        size="w-6 h-6"
                        color="bg-cyan-800"
                    />
                )}
            </div>
        </div >
    )
}