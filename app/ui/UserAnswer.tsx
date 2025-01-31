import { useState } from "react"
import ExpandButton from "./buttons/ExpandButton"

export default function UserAnswer({ answer, className }: { answer: string | undefined, className: string }) {

    const [answerVisible, setAnswerVisible] = useState<boolean>(false)

    if (!answer) return <div></div>

    return (
        <div className={`flex flex-1 flex-col align-left ${className}`}>
            <div className="flex flex-row">
                <div className="font-bold flex items-center"> Answer: </div>
                <div className="flex flex-1 justify-end"> <ExpandButton onClick={() => { setAnswerVisible(!answerVisible) }} /> </div>
            </div>
            {answerVisible &&
                <div className="mt-1">
                    {answer}
                </div>
            }
        </div>
    )
}