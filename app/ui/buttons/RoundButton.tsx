export default function RoundButton({ icon, onClick, size, disabled }: { icon: React.ReactNode, onClick: () => void, size?: 's' | 'm' | undefined, disabled?: boolean }) {

    const iconSize = size === 's' ? 'w-4 h-4' : 'w-6 h-6';
    const buttonPadding = size === 's' ? 'p-1' : 'p-2'

    const reactToClick = () => {

        if (disabled) return;

        if (onClick) onClick()
    }

    const baseClasses = `rounded-full ${buttonPadding} border border-2 cursor-pointer`;
    const enabledClasses = 'border-lime-200';
    const disabledClasses = 'border-cyan-600 cursor-not-allowed';

    const iconClasses = `${iconSize} stroke-current fill-current`;
    const iconColor = disabled ? 'text-cyan-600' : 'text-lime-200';

    return (
        <div 
            className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`} 
            onClick={reactToClick}
        >
            <div className={`${iconClasses} ${iconColor}`}>
                {icon}
            </div>
        </div>
    );

}