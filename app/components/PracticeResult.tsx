'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

export type PracticeResultType = 'correct' | 'incorrect' | 'reference';

interface PracticeResultProps {
    type: PracticeResultType;
    text: string;
}

export function PracticeResult({ type, text }: PracticeResultProps) {

    let imageUrl = '/images/close.svg';
    let iconSize = 'w-5 h-5';
    if (type === 'correct') {
        imageUrl = '/images/tick.svg';
        iconSize = 'w-8 h-8';
    }
    else if (type === 'reference') imageUrl = '/images/point-right.svg';

    return (
        <div className='flex flex-col items-stretch text-left'>
            <div className={`flex rounded-md items-center ${type != 'correct' ? 'px-4' : 'px-2'} py-2 border-2 ${type === 'correct' ? 'border-green-800 text-green-800' : type === 'incorrect' ? 'border-red-800 text-red-800' : 'border-cyan-400 text-cyan-200'}`}>
                <div className="">
                    <MaskedSvgIcon src={imageUrl} size={iconSize} alt='Result Icon' color={type === 'correct' ? 'bg-green-800' : type === 'incorrect' ? 'bg-red-800' : 'bg-cyan-300'} />
                </div>
                <div className={`flex-1 flex flex-col items-start justify-center ${type != 'correct' ? 'pl-4' : 'pl-1'} border-l-4 border-[var(--background)] self-stretch -my-2 py-2`}>
                    <div>{text || <em className="text-muted-foreground">empty</em>}</div>
                </div>
            </div>
        </div>
    );
}