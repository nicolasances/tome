import { TomeQuizAPI } from "@/api/TomeQuizAPI";
import RoundButton from "../buttons/RoundButton";
import Add from "../graphics/icons/Add";
import { useEffect, useState } from "react";
import { Topic } from "@/model/Topic";
import { useRouter } from "next/navigation";

export default function TopicsCard() {

    const [topics, setTopics] = useState<Topic[]>([]);
    // const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const init = async () => {

        // let timer = setTimeout(() => {setLoading(true)}, 500);

        const topics = await new TomeQuizAPI().getTopics();

        // clearTimeout(timer);
        // setLoading(false);

        setTopics(topics.topics);
        
    }

    useEffect(() => {init()}, []);

    return (
        <div className="flex flex-row items-center space-x-2 text-base">
            <div className="rounded bg-cyan-600 w-8 h-8 flex items-center justify-center text-lg">{topics ? topics.length : ''}</div>
            <div className="flex-1"><b>Topic{topics ? (topics.length > 1 ? 's' : '') : ''}</b> in the Knowledge Base</div>
            <div className="">
                <RoundButton icon={<Add />} onClick={() => {router.push('/new-topic')}} size="s" />
            </div>
        </div>
    )
}