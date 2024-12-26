export default function RoundButton({ icon, onClick, size }: { icon: React.ReactNode, onClick: () => any, size?: 's' | 'm' | undefined }) {

    const iconSize = size === 's' ? 'w-4 h-4' : 'w-10 h-10';
    const buttonPadding = size === 's' ? 'p-2' : 'p-3'

    return (
        <div className={`bg-cyan-200 rounded-full ${buttonPadding} shadow hover:shadow-lg`} onClick={onClick}>
            <div className={`${iconSize} fill-cyan-800`}>
                {icon}
            </div>
        </div>
    )

}