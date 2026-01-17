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
    let extendedChallenges = extendChallenges(filteredChallenges, trials);

    // Apply Sequential Gate
    extendedChallenges = sequentialGate(extendedChallenges);

    // Apply Sections Group Score Gate
    extendedChallenges = sectionsGroupScoreGate(extendedChallenges);

    return { challenges: extendedChallenges, trials };

}

/**
 * Takes each challenge and converts it into an Extended Challenge, by adding needed additional properties (see ExtendedChallenge interface)
 * 
 * By default, all challenges are enabled. The gating logic is implemented elsewhere.
 * 
 * @param challenges 
 * @param trials 
 */
function extendChallenges(challenges: Challenge[], trials: Trial[]): ExtendedChallenge[] {

    // Go through each trial and take the score and apply it to the extended challenge
    const extendedChallenges: ExtendedChallenge[] = challenges.map(challenge => {

        // Important: there could be multiple trials on the same challenge (due to retries): keep the latest completed one. 

        // Find the trial for this challenge
        const trial = trials.filter(trial => trial.challengeId === challenge.id && trial.completedOn).sort((a, b) => new Date(b.completedOn!).getTime() - new Date(a.completedOn!).getTime())[0];

        let score: number | undefined = undefined;
        if (trial && trial.score !== undefined && trial.score !== null) score = trial.score;

        return {
            ...challenge,
            enabled: true,
            toRepeat: false,
            score: score,
        }
    });

    return extendedChallenges;

}

/**
 * Implements the Sequential Gate logic
 * 
 * @param challenges 
 * @param trials 
 */
function sequentialGate(challenges: ExtendedChallenge[]): ExtendedChallenge[] {

    // 1. Find the lowest section index that has NOT completed the trial
    // 1.1. Sort challenges by seciton index 
    const sortedChallenges = challenges.slice().sort((a, b) => a.sectionIndex - b.sectionIndex);

    // 1.2. Find the lowest section index that is not in the completed set
    let lowestIncompleteSectionIndex = 0;
    for (const challenge of sortedChallenges) {
        if (challenge.score === undefined) {
            lowestIncompleteSectionIndex = challenge.sectionIndex;
            break;
        }
    }

    // 2. Mark challenges as enabled if their section index is less than or equal to the lowest incomplete section index
    const extendedChallenges: ExtendedChallenge[] = challenges.map(challenge => {
        challenge.enabled = challenge.sectionIndex <= lowestIncompleteSectionIndex;
        return challenge;
    });

    return extendedChallenges;
}

/**
 * Implements the Sections Score Gate logic. 
 * 
 * The logic goes as follows: 
 * - There are N sections in a topic 
 * - The next section in line to be executed is section Ni 
 * - That section can only be enabled if the user has achieved a MIN_AVG_SCORE on the previous SECTIONS_WINDOW sections (Ni-1, Ni-2, ... Ni-SECTIONS_WINDOW)
 * 
 * @param challenges 
 * @param trials 
 */
function sectionsGroupScoreGate(challenges: ExtendedChallenge[]): ExtendedChallenge[] {

    const sortedChallenges = challenges.sort((a, b) => a.sectionIndex - b.sectionIndex);

    const numSections = challenges.length;
    const SECTIONS_WINDOW = 3;
    const MIN_AVG_SCORE = 0.6;
    const currentSectionIndex = sortedChallenges.findIndex(challenge => challenge.score === undefined);

    // Find the (Ni-1, Ni-2, ... Ni-SECTIONS_WINDOW)
    if (currentSectionIndex >= SECTIONS_WINDOW && currentSectionIndex < numSections) {

        const previousSections = sortedChallenges.slice(currentSectionIndex - SECTIONS_WINDOW, currentSectionIndex);

        // Calculate average score
        const totalScore = previousSections.reduce((sum, challenge) => sum + (challenge.score || 0), 0);
        const avgScore = totalScore / SECTIONS_WINDOW;

        // If average score is less than MIN_AVG_SCORE, disable the current section
        if (avgScore < MIN_AVG_SCORE) {
            sortedChallenges[currentSectionIndex].enabled = false;

            // Mark all previous sections to be repeated
            previousSections.forEach(challenge => {
                challenge.toRepeat = true;
            });
        }
    }

    return sortedChallenges;

}