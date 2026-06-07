export function ModuleHeader({
    kicker,
    title,
    communicationGoal,
}: {
    kicker: string;
    title: string;
    communicationGoal: string;
}) {
    return (
        <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-widest text-black/50">
                {kicker}
            </span>
            <div className="text-2xl font-bold text-black/80 mt-2">
                {title}
            </div>
            <div className="text-base text-black/70 mt-2">
                {communicationGoal}
            </div>
        </div>
    );
}
