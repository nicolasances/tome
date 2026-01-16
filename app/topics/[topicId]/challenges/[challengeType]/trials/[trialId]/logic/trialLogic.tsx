import { Challenge, TomeChallengesAPI, Trial } from "@/api/TomeChallengesAPI";
import { ExtendedChallenge } from "../../../components/ChallengeDetailList";



/**
 * Loads the exntded challenges for the topic. 
 * 
 * Performs the following logic: 
 * - Implements the Sequential Gate by only enabling a challenge if all previous challenges have been completed.
 * - Implements the Sections Score Gate by only enabling a challenge if the user has achieved a minimum score in the previous group of challenges
 * 
 * @returns 
 */
export async function loadTopicChallenges(topicId: string, challengeType: string): Promise<{ challenges: ExtendedChallenge[], trials: Trial[] } | null> {

    const [{ challenges }, { trials }] = await Promise.all([
        new TomeChallengesAPI().getTopicChallenges(String(topicId)),
        new TomeChallengesAPI().getNonExpiredTrialsOnChallenge(String(topicId), String(challengeType))
    ]);

    if (!challenges) return null;

    // Filter out to only keep the challenge with the matching type
    // Sort by section index
    const filteredChallenges: Challenge[] = challenges.filter(challenge => challenge.code === String(challengeType)).sort((a, b) => a.sectionIndex - b.sectionIndex);

    // Extend challenges
    const extendedChallenges = sequentialGate(filteredChallenges, trials);

    return { challenges: extendedChallenges, trials };

}

/**
 * Implements the Sequential Gate logic
 * 
 * @param challenges 
 * @param trials 
 */
function sequentialGate(challenges: Challenge[], trials: Trial[]): ExtendedChallenge[] {

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
    const extendedChallenges: ExtendedChallenge[] = challenges.map(challenge => ({
        ...challenge,
        enabled: challenge.sectionIndex <= lowestIncompleteSectionIndex
    }));

    return extendedChallenges;
}