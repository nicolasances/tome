import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

interface AnswerBoxProps {
    text: string;
    ok: boolean;
    big?: boolean;
    block?: boolean;
}

export function AnswerBox({ text, ok, big, block }: AnswerBoxProps) {
    return (
        <div className={`${block ? 'flex' : 'inline-flex'} items-center gap-2 rounded-xl border-2 ${ok ? 'border-lime-200' : 'border-red-800 bg-red-600/10'} ${big ? 'px-4 py-2.5' : 'px-3 py-2'}`}>
            <span className={`font-bold ${big ? 'text-xl' : 'text-lg'} ${ok ? 'text-black' : 'text-red-800 line-through'} ${block ? 'break-words flex-1' : 'whitespace-nowrap'}`}>
                {text}
            </span>
            <span className={`font-black flex-shrink-0 ${big ? 'text-base' : 'text-sm'} ${ok ? 'text-cyan-800' : 'text-red-600'}`}>
                {ok ? <MaskedSvgIcon src="/images/tick.svg" alt="Correct" size="w-6 h-6" color="bg-lime-200" /> : <MaskedSvgIcon src="/images/close.svg" alt="Incorrect" size="w-3 h-3" color="bg-red-800" />}
            </span>
        </div>
    );
}

export function AnswerLine({ text, ok }: AnswerBoxProps) {
    return (
        <div className={`flex items-center border-b-2 px-2 ${ok ? 'border-lime-200' : 'border-red-800'}`}>
            <span className={`inline-block min-w-20 py-0.5 pr-4 text-center ${ok ? 'text-lime-200' : 'text-red-800'}`}>
                {text || ""}
            </span>
            {ok ? <MaskedSvgIcon src="/images/tick.svg" alt="Correct" size="w-6 h-6" color="bg-lime-200" /> : <MaskedSvgIcon src="/images/close.svg" alt="Incorrect" size="w-3 h-3" color="bg-red-800" />}
        </div>
    );
}
