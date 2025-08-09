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
import { PracticeHistoryGraph } from "@/components/graph/PracticeHistory";
import { Practice } from "@/model/Practice";
import RefreshSVG from "@/app/ui/graphics/icons/RefreshSVG";
import { TomeFlashcardsAPI } from "@/api/TomeFlashcardsAPI";
import OkSVG from "@/app/ui/graphics/icons/Ok";


export default function TopicDetailPage() {

    const router = useRouter();
    const params = useParams()

    let topicRefreshInterval: NodeJS.Timeout | undefined;

    const [topic, setTopic] = useState<Topic>()
    const [refreshingTopic, setRefreshingTopic] = useState<boolean | null>(false)
    const [startingPractice, setStartingPractice] = useState<boolean>(false)
    const [lastPracticeDate, setLastPracticeDate] = useState<string>("");
    const [historicalPractices, setHistoricalPractices] = useState<Practice[]>([]);
    const [ongoingPracticeProgress, setOngoingPracticeProgress] = useState<number | null>(null);
    const [latestGeneration, setLatestGeneration] = useState<string>("");
    const [loadingLatestGeneration, setLoadingLatestGeneration] = useState<boolean>(false);

    const loadData = async () => {
        loadTopic();
        loadLatestFinishedPractice();
        loadHistoricalPractices();
        loadOngoingPractice();
        loadLatestFlashcardsGeneration();
    }

    /**
     * Load the latest flashcards generation for this topic
     */
    const loadLatestFlashcardsGeneration = async () => {

        setLoadingLatestGeneration(true);

        const { latestGeneration } = await new TomeFlashcardsAPI().getLatestFlashcardsGeneration();

        setLatestGeneration(latestGeneration);
        setLoadingLatestGeneration(false);  
    }

    /**
     * Load the ongoing practice for this topic, if any
     */
    const loadOngoingPractice = async () => {

        const { practices } = await new TomePracticeAPI().getOngoingPractice(String(params.topicId));

        if (practices) computeOngoingPracticeProgress(practices[0]);

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

        setOngoingPracticeProgress(answeredFlashcards / totalFlashcards * 100);

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

    /**
     * Load historical finished practices on the topic
     */
    const loadHistoricalPractices = async () => {

        const { practices } = await new TomePracticeAPI().getHistoricalPractices(String(params.topicId));

        setHistoricalPractices(practices);
    }


    /**
     * Loads the latest finished practice for this topic and save its score for the header
     */
    const loadLatestFinishedPractice = async () => {
        const latestFinishedPractice = await new TomePracticeAPI().getLatestFinishedPractice(String(params.topicId));
        setLastPracticeDate(latestFinishedPractice?.finishedOn ?? "");
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
        <div className="flex flex-1 flex-col items-stretch justify-start px-8 h-full">
            <div className="mt-6 flex justify-center text-xl">{topic.name}</div>
            <div className="flex justify-center mt-2 space-x-2 text-sm">
                <div className="flex items-center bg-green-200 rounded-full px-2">
                    {!loadingLatestGeneration && <div className={`${latestGeneration == topic.generation ? "fill-green-600" : "fill-red-600 text-red-600"}`} style={{marginRight: 3, width: 12}}>{latestGeneration == topic.generation ? (<OkSVG/>) : (<RefreshSVG/>)}</div>}
                    {topic.generation ?? 'g0.0'}
                </div>
                <div className="bg-pink-300 rounded-full px-2">
                    {`${topic.flashcardsCount ?? 0} flashcards`}
                </div>
                <div className="bg-cyan-900 rounded-full px-2 text-white">
                    {`${topic.numSections ?? '-'} sections`}
                </div>
            </div>
            <div className="flex items-center mt-8">
                <div className="w-6"><LampSVG /></div>
                <div className="flex flex-col px-4">
                    <div className="text-xs uppercase">Last Practice</div>
                    <LastPracticeTimedelta lastPracticeDate={lastPracticeDate} />
                </div>
            </div>
            {ongoingPracticeProgress != null &&
                <div className="mt-4">
                    <div className="text-xs uppercase">Ongoing Practice...</div>
                    <ProgressBar hideNumber={true} current={ongoingPracticeProgress} max={100} />
                </div>
            }
            <div className="mt-8 flex justify-center items-center space-x-2">
                <RoundButton icon={<HomeSVG />} onClick={() => { router.back() }} size="s" />
                <RoundButton icon={<LampSVG />} onClick={startPractice} size="m" loading={startingPractice} disabled={!topic.flashcardsCount || refreshingTopic!} />
                <RoundButton icon={<RefreshSVG />} onClick={refreshTopic} size="s" loading={refreshingTopic!} disabled={startingPractice || ongoingPracticeProgress != null} />
            </div>
            <div className="flex-1"></div>
            <div className="">
                <div className="text-center text-base text-cyan-900 uppercase ">Historical Scores</div>
                {historicalPractices && <PracticeHistoryGraph historicalPractices={historicalPractices} />}
            </div>
        </div>
    )
}

function LastPracticeTimedelta({ lastPracticeDate }: { lastPracticeDate: string }) {

    if (!lastPracticeDate) return <></>

    const daysAgo = moment().diff(moment(lastPracticeDate, 'YYYYMMDD'), 'days');

    return (
        <div className="text-base">
            {daysAgo == 0 && "Today!"}
            {daysAgo > 0 && <><b>{daysAgo}</b> day{daysAgo > 1 ? "s" : ""} ago</>}
        </div>
    )
}