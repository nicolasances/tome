
export default function UserAnswer({ answer, className }: { answer: string | undefined, className: string }) {

    if (!answer) return <div></div>

    return (
        <div className={`flex flex-1 flex-col align-left ${className}`}>
            <div className="font-bold flex items-center">
                Answer:
            </div>
            <div className="overflow-y-auto max-h-[200px] mt-1">
                {answer}
            </div>
        </div>
    )
}