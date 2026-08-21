import { ModuleProficiencyEntry } from '@/api/TomeLearningDashboardAPI';
import { getProficiencyLevel } from '@/utils/proficiencyLevel';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

const PROFICIENCY_ICON: Record<1 | 2 | 3 | 4, string> = {
    1: '/images/signal-weak.svg',
    2: '/images/signal-fair.svg',
    3: '/images/signal-good.svg',
    4: '/images/signal.svg',
};

/**
 * Renders a module's User Proficiency Score as a four-level signal-strength icon,
 * on a ghost background of the full signal (same idiom as DifficultySignal/TopicsList).
 * Renders nothing when `proficiency` is null — a missing score must never be shown
 * as a weak one.
 *
 * @param {ModuleProficiencyEntry | null} proficiency - The module's proficiency breakdown, or null when not scoreable.
 * @param {string} color - Tailwind background color class for the icon (monochrome, matches the surrounding row/card tokens).
 *
 * @returns {JSX.Element | null} The signal icon, or null when there is no score to show.
 */
export function ProficiencySignal({ proficiency, color }: { proficiency: ModuleProficiencyEntry | null; color: string }) {
    if (proficiency === null) return null;

    const level = getProficiencyLevel(proficiency.score);

    return (
        <MaskedSvgIcon
            src={PROFICIENCY_ICON[level]}
            alt={`Proficiency level ${level} of 4`}
            color={color}
            backgroundSrc="/images/signal.svg"
        />
    );
}
