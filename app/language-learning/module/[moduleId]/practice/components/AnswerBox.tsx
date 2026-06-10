interface AnswerBoxProps {
    text: string;
    ok: boolean;
    big?: boolean;
    block?: boolean;
}

export function AnswerBox({text, ok, big, block}: AnswerBoxProps) {
    return (
        <div className={`${block ? 'flex' : 'inline-flex'} items-${block ? 'start' : 'center'} gap-2 rounded-xl border-2 ${ok ? 'border-lime-400 bg-lime-100/40' : 'border-red-600 bg-red-600/10'} ${big ? 'px-4 py-2.5' : 'px-3 py-2'}`}>
            <span className={`font-bold ${big ? 'text-xl' : 'text-lg'} ${ok ? 'text-black' : 'text-red-600 line-through'} ${block ? 'break-words flex-1' : 'whitespace-nowrap'}`}>
                {text}
            </span>
            <span className={`font-black flex-shrink-0 ${big ? 'text-base' : 'text-sm'} ${ok ? 'text-cyan-800' : 'text-red-600'}`}>
                {ok ? '✓' : '✕'}
            </span>
        </div>
    );
}
