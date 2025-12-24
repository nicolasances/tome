'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BackSVG from "@/app/ui/graphics/icons/Back";
import RoundButton from "@/app/ui/buttons/RoundButton";
import DotsSVG from "@/app/ui/graphics/icons/DotsSVG";
import { Challenge, TomeChallengesAPI, Trial } from "@/api/TomeChallengesAPI";
import { ChallengesList, ExtendedChallenge } from "@/app/components/ChallengesList";


export default function TopicDetailPage() {

    const router = useRouter();
    const params = useParams();

    const [topic, setTopic] = useState<Topic>()
    const [refreshingTopic, setRefreshingTopic] = useState<boolean | null>(false)
    const [challenges, setChallenges] = useState<ExtendedChallenge[]>([]);

    const loadData = async () => {
        loadTopic();
        loadChallenges();
        loadTopicTrials();
    }

    const loadTopicTrials = async () => {

        const { trials } = await new TomeChallengesAPI().getNonExpiredTrialsOnTopic(String(params.topicId));

        return trials;
    }

    /**
     * Load the challenges for this topic
     */
    const loadChallenges = async () => {

        const promises = [];
        promises.push(new TomeChallengesAPI().getTopicChallenges(String(params.topicId)));
        promises.push(loadTopicTrials());

        const [challengesResponse, trials] = await Promise.all(promises) as [{ challenges: Challenge[] }, Trial[]];

        // Create a map of challengeId -> challengeCode for quick lookup
        const challengeIdToCode = new Map(
            challengesResponse.challenges.map(challenge => [challenge.id!, challenge.code])
        );

        // Group trials by challenge code
        const trialsByChallengeCode: { [code: string]: Trial[] } = {};          // Actually ongoing or completed non-expired trials per challenge code
        let expectedTrialsByChallengeCode: { [code: string]: number } = {};   // Count of expected trials per challenge code

        expectedTrialsByChallengeCode = challengesResponse.challenges.reduce((acc: { [code: string]: number }, challenge: Challenge) => {
            acc[challenge.code] = (acc[challenge.code] || 0) + 1;
            return acc;
        }, {});

        trials.forEach(trial => {
            const challengeCode = challengeIdToCode.get(trial.challengeId);
            if (challengeCode) {
                if (!trialsByChallengeCode[challengeCode]) {
                    trialsByChallengeCode[challengeCode] = [];
                }
                trialsByChallengeCode[challengeCode].push(trial);
            }
        });

        // There are multiple challenges of a given type per topic (there's one per section), so we only keep one challenge per type for now
        const uniqueChallenges = challengesResponse.challenges.reduce((acc: ExtendedChallenge[], challenge: Challenge) => {

            if (!acc.find(c => c.challenge.type === challenge.type)) {

                const extendedChallenge = {
                    challenge: challenge,
                    progress: 0,
                    score: 0
                }

                // Calculate the progress and score for this challenge based on its trials
                const trialsForChallenge = trialsByChallengeCode[challenge.code] || []

                if (trialsForChallenge.length > 0) {
                    // Progress is the num of trials completed / total trials for this challenge
                    const numCompletedTrials = trialsForChallenge.filter(trial => trial.completedOn != null && trial.completedOn != undefined).length;
                    const totalTrials = expectedTrialsByChallengeCode[challenge.code] || 0;

                    console.log(`${numCompletedTrials} / ` + totalTrials);
                    
                    extendedChallenge.progress = Math.round((numCompletedTrials / totalTrials) * 100);

                    // Score is calculated ONLY if all trials are completed
                    if (numCompletedTrials === totalTrials) {
                        const totalScore = trialsForChallenge.reduce((sum, trial) => sum + (trial.score || 0), 0);
                        extendedChallenge.score = Math.round(totalScore * 100 / totalTrials);
                    }
                }

                acc.push(extendedChallenge);
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

    }

    const refreshTopic = async () => {

        setRefreshingTopic(true);

        await new TomeTopicsAPI().refreshTopic(String(params.topicId));

    }

    useEffect(() => { loadData() }, [])

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="mt-6 flex justify-between items-center">
                <div className="flex-1 flex">
                    <RoundButton icon={<BackSVG />} onClick={() => { router.back() }} size="s" secondary />
                </div>
                <div className="flex justify-center text-xl flex-1 whitespace-nowrap">{topic.name}</div>
                <div className="flex-1"></div>
            </div>
            <div className="flex justify-center mt-1 space-x-2 text-sm">
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
                <RoundButton svgIconPath={{ src: "/images/spider.svg", alt: "Crawl & Regenerate Challenges" }} size="s" onClick={refreshTopic}/>
                {/* <RoundButton icon={<LampSVG />} onClick={startPractice} size="m" loading={startingPractice} disabled={!topic.flashcardsCount || refreshingTopic!} /> */}
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