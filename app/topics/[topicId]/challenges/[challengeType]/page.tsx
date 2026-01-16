'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Challenge, TomeChallengesAPI, Trial } from "@/api/TomeChallengesAPI";
import { ChallengeDetailList, ExtendedChallenge } from "@/app/topics/[topicId]/challenges/[challengeType]/components/ChallengeDetailList";
import { useHeader } from "@/context/HeaderContext";

export default function ChallengeDetailPage() {

    const router = useRouter();
    const params = useParams()
    const { setConfig } = useHeader();

    const [topic, setTopic] = useState<Topic>()
    const [challenges, setChallenges] = useState<ExtendedChallenge[]>([]);
    const [challengeName, setChallengeName] = useState<string>("");
    const [trials, setTrials] = useState<Trial[]>([]);

    useEffect(() => {
        if (topic) {
            setConfig({
                title: `${topic.name}`,
                backButton: {
                    enabled: true,
                    onClick: () => { router.back() }
                },
                actions: undefined,
            });
        }
    }, [topic, challengeName, setConfig]);

    const loadData = async () => {
        loadTopic();
        loadChallenges();
    }

    /**
     * Loads the challenges for the topic
     * @returns 
     */
    const loadChallenges = async () => {

        const [{challenges}, {trials}] = await Promise.all([
            new TomeChallengesAPI().getTopicChallenges(String(params.topicId)),
            new TomeChallengesAPI().getNonExpiredTrialsOnChallenge(String(params.topicId), String(params.challengeType))
        ]);

        setTrials(trials);

        if (!challenges) return;

        // Filter out to only keep the challenge with the matching type
        // Sort by section index
        const filteredChallenges: Challenge[] = challenges.filter(challenge => challenge.code === String(params.challengeType)).sort((a, b) => a.sectionIndex - b.sectionIndex);

        // Extend challenges
        // 1. Find the lowest section index that has NOT completed the trial
        // 1.1. Find the set of completed section indexes
        const completedSectionIndexes = new Set<number>();
        trials.forEach(trial => {
            const challenge = challenges.find(challenge => challenge.id === trial.challengeId);
            if (challenge && trial.completedOn) {
                completedSectionIndexes.add(challenge.sectionIndex);
            }
        });
        
        // 1.2. Find the lowest section index that is not in the completed set
        let lowestIncompleteSectionIndex = 0;
        if (completedSectionIndexes.size > 0) {
            lowestIncompleteSectionIndex = Array.from(completedSectionIndexes.values()).sort((a, b) => a - b)[completedSectionIndexes.size - 1] + 1;
        }

        // 2. Mark challenges as enabled if their section index is less than or equal to the lowest incomplete section index
        const extendedChallenges: ExtendedChallenge[] = filteredChallenges.map(challenge => ({
            ...challenge,
            enabled: challenge.sectionIndex <= lowestIncompleteSectionIndex
        }));

        setChallenges(extendedChallenges);

        if (filteredChallenges && filteredChallenges.length > 0) {
            setChallengeName(filteredChallenges[0].name);
        }
    }

    /**
     * Load the topic 
     */
    const loadTopic = async () => {
        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));
        setTopic(topic);
    }

    /**
     * Starts or resumes a trial for the given challenge
     * 
     * @param challengeId the id of the challenge to start or resume a trial for
     */
    const startOrResumeTrial = async (challengeId: string) => {

        const response = await new TomeChallengesAPI().startOrResumeTrial(challengeId) as { id: string } | { code: string; message: string };

        if ('code' in response) {
            console.log('Error starting or resuming trial:', response.code, response.message);
            return;
        }

        // Redirect to the trial page
        router.push(`/topics/${params.topicId}/challenges/${params.challengeType}/trials/${response.id}`);

    }

    useEffect(() => { loadData() }, [])

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="flex justify-center text-base opacity-70">
                {challengeName}
            </div>
            <ChallengeDetailList challenges={challenges} nonExpiredTrials={trials} onChallengeClick={startOrResumeTrial} />
            <div className="flex-1 mt-6 text-center">
            </div>
        </div>
    )
}
