import { useState } from "react";
import DotsSVG from "../graphics/icons/DotsSVG";
import Minus from "../graphics/icons/Minus";

export default function ExpandButton({ onClick }: { onClick: () => void }) {

    const [expanded, setExpanded] = useState<boolean>(false) 

    const onButtonClick = () => {

        onClick()

        setExpanded(!expanded)
        
    }

    return (
        <div className="fill-cyan-800 w-8 h-4 bg-cyan-200 rounded-md px-2 cursor-pointer" onClick={onButtonClick}>
            {!expanded && <DotsSVG />}
            {expanded && <Minus strokeColor='cyan-800'/>}
        </div>
    )
}