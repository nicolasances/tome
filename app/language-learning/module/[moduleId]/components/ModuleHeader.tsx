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
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.50)',
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                }}
            >
                {kicker}
            </span>
            <div
                style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: 'rgba(0,0,0,0.80)',
                    marginTop: 6,
                    lineHeight: 1.1,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    fontSize: 13.5,
                    color: 'rgba(0,0,0,0.70)',
                    marginTop: 9,
                    lineHeight: 1.5,
                }}
            >
                {communicationGoal}
            </div>
        </div>
    );
}
