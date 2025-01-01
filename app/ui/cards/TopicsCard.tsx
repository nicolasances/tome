import RoundButton from "../buttons/RoundButton";
import Add from "../graphics/icons/Add";

export default function TopicsCard() {

    return (
        <div className="flex flex-row items-center space-x-2 text-base">
            <div className="rounded bg-cyan-600 w-8 h-8 flex items-center justify-center text-lg">12</div>
            <div className="flex-1"><b>Topics</b> in the Knowledge Base</div>
            <div className="">
                <RoundButton icon={<Add />} onClick={() => {}} size="s" />
            </div>
        </div>
    )
}