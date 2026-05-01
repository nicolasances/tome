'use client';

import { useEffect, useRef, forwardRef } from 'react';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

interface TranslationInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export const TranslationInput = forwardRef<HTMLTextAreaElement, TranslationInputProps>(
    function TranslationInput({ value, onChange, onSubmit, disabled = false, placeholder = 'Type translation…' }, ref) {
        const internalRef = useRef<HTMLTextAreaElement>(null);
        const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

        // Auto-expand textarea
        useEffect(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 200) + 'px';
        }, [value, textareaRef]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!disabled) onSubmit();
            }
        };

        return (
            <div className="relative w-full">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    rows={1}
                    className="w-full py-4 px-4 pr-14 bg-transparent border-2 border-cyan-300 rounded-lg focus:outline-none text-lg resize-none overflow-y-auto no-scrollbar placeholder:text-cyan-200 disabled:opacity-50"
                    style={{ maxHeight: '200px', fontSize: '16px', touchAction: 'manipulation' }}
                />
                <button
                    onClick={onSubmit}
                    disabled={disabled || !value.trim()}
                    className="absolute right-3 bottom-5 flex items-center justify-center transition disabled:pointer-events-none"
                >
                    <MaskedSvgIcon
                        src="/images/send.svg"
                        alt="Send"
                        size="w-6 h-6"
                        color={value.trim() ? 'bg-lime-200' : 'bg-cyan-400'}
                    />
                </button>
            </div>
        );
    }
);
