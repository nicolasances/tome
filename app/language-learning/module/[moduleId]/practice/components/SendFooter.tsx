import { RoundButton } from 'toto-react';

interface SendFooterProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function SendFooter({value, onChange, onSend, placeholder = 'Type your answer…', disabled, autoFocus}: SendFooterProps) {
    const canSend = value.trim().length > 0 && !disabled;

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && canSend) onSend();
    }

    return (
        <div className="px-4 pb-4 pt-2.5 flex items-center gap-3">
            <input
                type="text"
                autoFocus={autoFocus}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 min-w-0 bg-transparent border-2 border-cyan-400 focus:border-lime-200 rounded-xl px-4 py-3 text-xl text-black placeholder-cyan-300 outline-none transition-colors disabled:opacity-50"
            />
            <RoundButton
                svgIconPath={{ src: '/images/send.svg', alt: 'Send' }}
                type="primary"
                size="m"
                disabled={!canSend}
                onClick={onSend}
            />
        </div>
    );
}
