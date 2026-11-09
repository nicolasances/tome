interface CheckFooterProps {
    enabled: boolean;
    onCheck: () => void;
}

export function CheckFooter({enabled, onCheck}: CheckFooterProps) {
    return (
        <div className="px-4 pb-4 pt-2.5">
            <button
                disabled={!enabled}
                onClick={onCheck}
                className={`w-full border-0 rounded-full font-bold text-base py-3.5 tracking-wide transition-colors ${enabled ? 'bg-lime-200 text-cyan-900 cursor-pointer' : 'bg-black/8 text-black/30 cursor-default'}`}>
                Check
            </button>
        </div>
    );
}
