import { MaskedSvgIcon } from "toto-react";

interface DifficultySignalProps {
    failureRatio: number | null;
}

function getSignalIcon(failureRatio: number | null): { src: string; alt: string } {
    if (failureRatio === null || failureRatio < 0.25) {
        return { src: "/images/signal-weak.svg", alt: "Low difficulty" };
    }
    if (failureRatio < 0.5) {
        return { src: "/images/signal-fair.svg", alt: "Fair difficulty" };
    }
    if (failureRatio < 0.75) {
        return { src: "/images/signal-good.svg", alt: "Good difficulty" };
    }
    return { src: "/images/signal.svg", alt: "High difficulty" };
}

export function DifficultySignal({ failureRatio }: DifficultySignalProps) {
    const icon = getSignalIcon(failureRatio);
    return <MaskedSvgIcon src={icon.src} alt={icon.alt} />;
}
