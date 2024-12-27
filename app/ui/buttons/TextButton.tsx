
export default function TextButton({ label, onClick, size }: { label: string, onClick: () => void, size?: 's' | 'm' | undefined }) {

    const buttonPadding = size === 's' ? 'p-1' : 'py-2 px-4'

    return (
        <div className={`border border-cyan-200 rounded-3xl cursor-pointer ${buttonPadding} hover:shadow-lg`} onClick={onClick}>
            <div className="text-cyan-100 font-bold">{label}</div>
        </div>
    )

}