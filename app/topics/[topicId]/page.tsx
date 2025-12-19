'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LampSVG from "../../ui/graphics/icons/Lamp";
import HomeSVG from "@/app/ui/graphics/icons/HomeSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";
import moment from "moment";
import { ProgressBar } from "@/app/ui/general/ProgressBar";
import { TomePracticeAPI } from "@/api/TomePracticeAPI";
import RefreshSVG from "@/app/ui/graphics/icons/RefreshSVG";
import DotsSVG from "@/app/ui/graphics/icons/DotsSVG";
import { Challenge, TomeChallengesAPI } from "@/api/TomeChallengesAPI";
import { ChallengesList } from "@/app/components/ChallengesList";


export default function TopicDetailPage() {

    const router = useRouter();
    const params = useParams()

    let topicRefreshInterval: NodeJS.Timeout | undefined;

    const [topic, setTopic] = useState<Topic>()
    const [refreshingTopic, setRefreshingTopic] = useState<boolean | null>(false)
    const [startingPractice, setStartingPractice] = useState<boolean>(false)
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    const loadData = async () => {
        loadTopic();
        loadChallenges();
    }

    /**
     * Load the challenges for this topic
     */
    const loadChallenges = async () => {

        const { challenges } = await new TomeChallengesAPI().getTopicChallenges(String(params.topicId));

        // There are multiple challenges of a given type per topic (there's one per section), so we only keep one challenge per type for now
        const uniqueChallenges = challenges.reduce((acc: Challenge[], challenge) => {
            if (!acc.find(c => c.type === challenge.type)) {
                acc.push(challenge);
            }
            return acc;
        }, []);

        setChallenges(uniqueChallenges);
    }

    /**
     * Load the topic 
     */
    const loadTopic = async () => {

        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));

        setTopic(topic);

        // If the flashcards generation is marked as complete, make sure to stop any running topicRefreshInterval
        if (topic.flashcardsGenerationComplete) {
            console.log("Flashcards Generation Complete - Stopping any running interval.");

            clearInterval(topicRefreshInterval);

            setRefreshingTopic(false);
        }
        else if (topic.flashcardsGenerationComplete === false && !refreshingTopic) {
            // Start refreshing the topic
            console.log("Flashcards Generation Incomplete - Starting interval.");

            setRefreshingTopic(true);

            clearInterval(topicRefreshInterval);
            topicRefreshInterval = setInterval(() => { loadTopic() }, 3000);

        }
    }

    const refreshTopic = async () => {

        setRefreshingTopic(true)

        await new TomeTopicsAPI().refreshTopic(String(params.topicId));

        topicRefreshInterval = setInterval(() => { loadTopic() }, 3000);

    }

    /**
     * Starts a practice on this topic
     */
    const startPractice = async () => {

        setStartingPractice(true);

        const response = await new TomePracticeAPI().startPractice(String(params.topicId), "options")

        if (response && 'practiceId' in response) {
            router.push(`${params.topicId}/practice/${response.practiceId}`);
        }
        else if (response && response.subcode == 'ongoing-practice-found') {

            // Load ongoing practice
            const { practices } = await new TomePracticeAPI().getOngoingPractice(String(params.topicId));

            // Route
            router.push(`${params.topicId}/practice/${practices[0].id}`);
        }


    }

    useEffect(() => { loadData() }, [])

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="mt-6 flex justify-center text-xl">{topic.name}</div>
            <div className="flex justify-center mt-2 space-x-2 text-sm">
                <div className="bg-cyan-900 rounded-full px-2 text-white">
                    {`${topic.numSections ?? '-'} sections`}
                </div>
            </div>
            {/* {ongoingPracticeProgress != null &&
                <div className="mt-4">
                    <div className="text-xs uppercase">Ongoing Practice...</div>
                    <ProgressBar hideNumber={true} current={ongoingPracticeProgress} max={100} />
                </div>
            } */}
            <div className="mt-8 flex justify-center items-center space-x-2">
                <RoundButton icon={<HomeSVG />} onClick={() => { router.back() }} size="s" />
                <RoundButton icon={<LampSVG />} onClick={startPractice} size="m" loading={startingPractice} disabled={!topic.flashcardsCount || refreshingTopic!} />
                {/* <RoundButton icon={<RefreshSVG />} onClick={refreshTopic} size="s" loading={refreshingTopic!} disabled={startingPractice || ongoingPracticeProgress != null} /> */}
                {refreshingTopic && <RoundButton icon={<DotsSVG />} onClick={() => { router.push(`${params.topicId}/tracking`) }} size="s" />}
            </div>
            <ChallengesList challenges={challenges} topicId={String(params.topicId)} />
            <div className="flex-1"></div>
        </div>
    )
}

// function LastPracticeTimedelta({ lastPracticeDate }: { lastPracticeDate: string }) {

//     if (!lastPracticeDate) return <></>

//     const daysAgo = moment().diff(moment(lastPracticeDate, 'YYYYMMDD'), 'days');

//     return (
//         <div className="text-base">
//             {daysAgo == 0 && "Today!"}
//             {daysAgo > 0 && <><b>{daysAgo}</b> day{daysAgo > 1 ? "s" : ""} ago</>}
//         </div>
//     )
// }