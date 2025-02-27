// import RoundButton from "../buttons/RoundButton";
// import Add from "../graphics/icons/Add";
import { useEffect, useState } from "react";
import { Topic } from "@/model/Topic";
import { useRouter } from "next/navigation";
import { TomeAPI } from "@/api/TomeAPI";

export default function TopicsCard() {

    const [topics, setTopics] = useState<Topic[]>([]);
    // const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const init = async () => {

        // let timer = setTimeout(() => {setLoading(true)}, 500);

        const topics = await new TomeAPI().getTopics();

        // clearTimeout(timer);
        // setLoading(false);

        setTopics(topics.topics);
        
    }
    
    const goToTopicsListPage = () => {
        router.push('/topics');
    }

    useEffect(() => {init()}, []);

    return (
        <div className="flex flex-row items-center justify-center space-x-2 text-base -mx-2 px-3 py-2 hover:bg-cyan-600 cursor-pointer" onClick={goToTopicsListPage}>
            <div className="rounded bg-cyan-600 w-10 h-10 flex items-center justify-center text-lg" onClick={goToTopicsListPage}>{topics ? topics.length : ''}</div>
            <div className="flex-1 md:flex-none md:pr-4" onClick={goToTopicsListPage}><b>Topic{topics ? (topics.length > 1 ? 's' : '') : ''}</b> in the Knowledge Base</div>
            {/* <div className="">
                <RoundButton icon={<Add />} onClick={() => {router.push('/new-topic')}} size="s" />
            </div> */}
        </div>
    )
}