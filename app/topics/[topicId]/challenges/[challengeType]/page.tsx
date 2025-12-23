'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import { Challenge, TomeChallengesAPI, Trial } from "@/api/TomeChallengesAPI";
import BackSVG from "@/app/ui/graphics/icons/Back";
import { ChallengeDetailList } from "@/app/topics/[topicId]/challenges/[challengeType]/components/ChallengeDetailList";

export default function ChallengeDetailPage() {

    const router = useRouter();
    const params = useParams()

    const [topic, setTopic] = useState<Topic>()
    const [challenges, setChallenges] = useState<any[]>([]);
    const [challengeName, setChallengeName] = useState<string>("");
    const [trials, setTrials] = useState<Trial[]>([]);

    const loadData = async () => {
        loadTopic();
        loadChallenges();
        loadTrials(challenges);
    }

    /**
     * Loads all the non-expired trials for the challenge identified by the code (in params) and for the given topic
     */
    const loadTrials = async (challenges: Challenge[]) => {

        const { trials } = await new TomeChallengesAPI().getNonExpiredTrialsOnChallenge(String(params.topicId), String(params.challengeType));

        setTrials(trials);
    }

    /**
     * Loads the challenges for the topic
     * @returns 
     */
    const loadChallenges = async () => {


        const { challenges } = await new TomeChallengesAPI().getTopicChallenges(String(params.topicId));

        if (!challenges) return;

        // Filter out to only keep the challenge with the matching type
        const filteredChallenges = challenges.filter(challenge => challenge.code === String(params.challengeType)).sort((a, b) => a.sectionIndex - b.sectionIndex);

        setChallenges(filteredChallenges);

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

        console.log(`Starting trial on challenge ${challengeId}`);


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

    const challengeType = String(params.challengeType);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
            <div className="mt-6 flex justify-between items-center">
                <div className="flex-1 flex">
                    <RoundButton icon={<BackSVG />} onClick={() => { router.back() }} size="s" secondary />
                </div>
                <div className="flex justify-center text-xl">{topic.name}</div>
                <div className="flex flex-1 items-center justify-end p-1 flex-shrink-0">
                    <MaskedSvgIcon
                        src={`/images/challenges/${challengeType}.svg`}
                        alt={challengeType}
                        size="w-5 h-5"
                        color="bg-cyan-800"
                    />
                </div>
            </div>
            <div className="flex justify-center text-base opacity-70">
                {challengeName}
            </div>
            <ChallengeDetailList challenges={challenges} nonExpiredTrials={trials} onChallengeClick={startOrResumeTrial} />
            <div className="flex-1 mt-6 text-center">
            </div>
        </div>
    )
}
