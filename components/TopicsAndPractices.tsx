import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { ProgressBar } from "@/app/ui/general/ProgressBar";
import LampSVG from "@/app/ui/graphics/icons/Lamp";
import { Practice } from "@/model/Practice";
import { calculateFreshness } from "@/utils/TopicUtil";
import { useEffect, useState } from "react";
import { TopicProgressBar } from "./TopicProgressBar";
import moment from "moment";
import ExpandButton from "@/app/ui/buttons/ExpandButton";
import { useRouter } from "next/navigation";

interface ExtendedTopic extends Topic {
    ongoingPractice?: Practice; // The ongoing practice for this topic, if any
    progress?: number;          // If there is a practice, its progress percentage
    freshness: number;        // Freshness percentage of the topic
}

export function TopicsAndPractices() {

    const [topics, setTopics] = useState<ExtendedTopic[]>([]);
    const [ongoingTopics, setOngoingTopics] = useState<ExtendedTopic[]>([]);
    const [numMoreTopics, setNumMoreTopics] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    /**
     * Load the topics and their ongoing practices.
     */
    const loadData = async () => {

        const { topics } = await new TomeTopicsAPI().getTopics();

        await loadOngoingPractices(topics);

        setLoading(false);

    }

    /**
     * Load the ongoing practices for each topic and update the topics state with the ongoing practice if it exists.
     */
    const loadOngoingPractices = async (topics: Topic[]) => {

        const { practices } = await new TomePracticeAPI().getAllOngoingPractices();

        // Update the topics with the ongoing practice if it exists
        const updatedTopics = await Promise.all(topics.map(async (topic) => {

            const ongoingPractice = practices == null ? null : practices.find(practice => practice.topicId === topic.id);
            const progress = ongoingPractice ? await computeOngoingPracticeProgress(ongoingPractice) : undefined;
            const freshness = topic.lastPracticed ? calculateFreshness(topic) : 0;

            return { ...topic, ongoingPractice: ongoingPractice || undefined, progress, freshness };
        }))

        const topicsWithOngoingPractice = updatedTopics.filter(topic => topic.ongoingPractice != undefined);
        topicsWithOngoingPractice.sort((a, b) => b.progress! - a.progress!);

        // Suggested topics are the top 2 ones with no ongoing practice, filtered by freshness
        const numSuggestions = topicsWithOngoingPractice.length > 0 ? 2 : 4;
        const suggestedTopics = updatedTopics.filter(topic => topic.ongoingPractice == undefined).sort((a, b) => a.freshness! - b.freshness!).slice(0, numSuggestions);

        // Split topics by whether they have ongoing practice
        setTopics(suggestedTopics);
        setOngoingTopics(topicsWithOngoingPractice);
        setNumMoreTopics(updatedTopics.length - suggestedTopics.length - topicsWithOngoingPractice.length);
    }

    /**
     * Compute the progress of the ongoing practice
     * @param practice The practice to compute the progress for
     * @returns 
     */
    const computeOngoingPracticeProgress = async (practice: Practice | null) => {

        if (!practice || !practice.id) return;

        // 1. Looad ongoing practice flashcards
        const { flashcards } = await new TomePracticeAPI().getPracticeFlashcards(practice.id);

        // 2. Compute progress
        const answeredFlashcards = flashcards.filter(f => f.correctlyAsnwerAt !== null).length;
        const totalFlashcards = flashcards.length;

        return answeredFlashcards / totalFlashcards * 100;

    }

    useEffect(() => { loadData() }, []);

    if (loading) return (
        <div className="text-base opacity-50">Loading Topics..</div>
    )

    return (
        <div className="mt-2">

            {/* Topics that have an ongoing practice */}
            <div className="mb-6 mx-4 space-y-2">
                <SectionHeader title="Ongoing Practices" />
                {ongoingTopics.map((topic, idx) => (
                    <OngoingTopic key={topic.id} topic={topic} idx={idx} />
                ))}
            </div>

            {/* Suggested Topics */}
            <div className="mb-4 mx-4 space-y-2">
                <SectionHeader title="Suggested Topics to practice" />
                {topics.map((topic) => (
                    <SuggestedTopic key={topic.id} topic={topic} />
                ))}
                <div className="flex items-center pt-2">
                    <ExpandButton expanded={false} onClick={() => { }} />
                    <div className="ml-2 text-sm">{numMoreTopics} more topics</div>
                </div>
            </div>

        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center text-sm opacity-70 bg-cyan-300 -ml-8 px-4 py-1 mb-4 rounded-r-full w-fit">
            <div className="w-3 h-3 mr-2"><LampSVG /> </div>
            <div className="uppercase">{title}</div>
        </div>
    )
}

function OngoingTopic({ topic, idx }: { topic: ExtendedTopic, idx: number }) {

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
            <div className="text-xl text-cyan-200 text-center pr-2 border-r-2 border-r-cyan-200 w-6 min-w-6">{idx + 1}</div>
            <div className="flex flex-col ml-4">
                <div className="">{topic.name}</div>
                <ProgressBar id={topic.id} size="s" current={topic.progress!} max={100} hideNumber={true} />
            </div>
        </div>
    )
}

function SuggestedTopic({ topic }: { topic: ExtendedTopic }) {

    const [pressed, setPressed] = useState(false);

    const router = useRouter();

    const daysSinceLastPractice = (topic: ExtendedTopic) => {

        const daysAgo = moment().diff(moment(topic.lastPracticed, 'YYYYMMDD'), 'days');

        return daysAgo;
    }

    return (
        <div className="text-base flex items-center w-full cursor-pointer"
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
            <div className="flex flex-col w-full">
                <div className="mb-1">{topic.name} <span className="opacity-50 text-sm">({daysSinceLastPractice(topic)} days ago)</span></div>
                <TopicProgressBar current={topic.freshness} max={100} />
            </div>
        </div>
    )
}