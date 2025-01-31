
export default function Minus({strokeColor}: {strokeColor: string}) {
    return (
        <svg  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
            <path d="M6 12L18 12" stroke={`var(--${strokeColor})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}