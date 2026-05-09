'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { RoundButton } from 'toto-react';

export default function SelectPracticePage() {
    const router = useRouter();
    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: 'Select Practice',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6">
            <div className="flex flex-col items-center gap-3">
                <RoundButton
                    svgIconPath={{ src: '/images/language.svg', alt: 'Vocabulary Practice' }}
                    onClick={() => router.push('/language-learning/vocabulary-practice')}
                    type="primary"
                />
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Vocabulary</span>
            </div>

            <div className="flex flex-col items-center gap-3">
                <RoundButton
                    svgIconPath={{ src: '/images/sentences.svg', alt: 'Sentence Practice' }}
                    onClick={() => router.push('/language-learning/sentence-practice')}
                    type="primary"
                />
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Sentences</span>
            </div>
        </div>
    );
}
