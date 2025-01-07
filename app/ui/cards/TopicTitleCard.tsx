import Book from "../graphics/icons/Book";
import { Topic } from "@/model/topic";

export default function TopicTitleCard({topic}: {topic: string}) {
    return (
        <div className="flex items-center space-x-2">
            <div className="fill-cyan-800 w-10 min-w-10 h-10 rounded-full border-2 border border-cyan-800 p-2">
                <Book />
            </div>
            <div className="flex-col">
                <div className="text-lg capitalize"><b>{topic}</b></div>
            </div>
        </div>

    )
}