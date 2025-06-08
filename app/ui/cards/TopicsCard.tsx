// import RoundButton from "../buttons/RoundButton";
// import Add from "../graphics/icons/Add";
import { useEffect, useState } from "react";
import { Topic } from "@/model/Topic";
import { TomeAPI, TopicMemLevel } from "@/api/TomeAPI";
import ExpandButton from "../buttons/ExpandButton";
import MemLevel from "../graphics/MemLevel";
import Link from "next/link";
import RoundButton from "../buttons/RoundButton";
import RefreshSVG from "../graphics/icons/RefreshSVG";
import { LoadingBar } from "../graphics/Loading";
import Tick from "../graphics/icons/Tick";

export default function TopicsCard({ onSelectTopic }: { onSelectTopic?: (topic: Topic) => void }) {

    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicMemorizationLevels, setTopicMemorizationLevels] = useState<TopicMemLevel[] | undefined>(undefined)


    /**
     * Function to load Topics from the TomeAPI and set them in the state
     */
    const loadTopics = async () => {

        // Call the API to get the topics
        const topics = await new TomeAPI().getTopics();

        if (!topics || !topics.topics || topics.topics.length == 0) return;

        const response = await new TomeAPI().getMemLevels()

        const memLeveledTopics = response.topics.sort((a, b) => b.memLevel - a.memLevel)

        setTopicMemorizationLevels(memLeveledTopics)

        // Sort topic by their memorization level: topics with hight mem level come first
        const sortedTopics = topics.topics.sort((a, b) => {
            const memLevelA = memLeveledTopics.find((memLevel) => memLevel.topicCode === a.code)?.memLevel || 0;
            const memLevelB = memLeveledTopics.find((memLevel) => memLevel.topicCode === b.code)?.memLevel || 0;
            return memLevelB - memLevelA;
        });

        setTopics(sortedTopics);
    }

    const findMemLevel = (topicCode: string): TopicMemLevel | undefined => {

        if (!topicMemorizationLevels) return undefined;

        for (const memLevel of topicMemorizationLevels) {
            if (memLevel.topicCode == topicCode) {
                return memLevel
            }
        }

    }

    useEffect(() => { loadTopics() }, []);

    return (
        <div className="flex-1 app-content">
            <div className="text-cyan-700 text-base font-bold mb-2 px-4">Topics in the Knowledge Base</div>
            {topics && topics.map((topic, index) => <TopicItem key={topic.code} topic={topic} memLevel={findMemLevel(topic.code)} index={index} onClick={onSelectTopic} />)}
        </div>

    )
}


function TopicItem({ topic, memLevel, index, onClick }: { topic: Topic, memLevel: TopicMemLevel | undefined, index: number, onClick?: (topic: Topic) => void }) {

    const [uploadStatus, setUploadStatus] = useState<'not-started' | 'uploading' | 'failed' | 'success'>("not-started")
    const [showDetails, setShowDetails] = useState(false)

    const reUploadBlog = async () => {

        setUploadStatus("uploading")

        try {
            const result = await new TomeAPI().postTopic(topic.blog_url)

            if (result && result.blogUrl != null) {
                setUploadStatus('success');
                // Reset the upload
                setTimeout(() => { setUploadStatus('not-started') }, 2000)
            }
        }
        catch (e) {
            console.log(e);
            setUploadStatus('failed')
            // Reset the upload
            setTimeout(() => { setUploadStatus('not-started') }, 1000)
        }

    }

    /**
     * Reacts to the clicking of the topic (row)
     * Does: 
     * - Calls the callback if any
     * - If no callback, opens the detail of the topic
     */
    const onClickTopic = () => {

        if (onClick) {
            onClick(topic);
            return;
        }

        // No onClick configured: open the detail
        if (!showDetails) setShowDetails(true)

    }

    return (
        <div className={`my-1 px-2 py-2 group ${index % 2 == 0 ? 'bg-[#00a2b6] border-[#00a2b6]' : 'border-[#00acc1]'} border rounded hover:border-cyan-600`} onClick={onClickTopic}>
            <div className="flex flex-1">
                <div className="mr-2">
                    {memLevel != null && <MemLevel perc={memLevel.memLevel * 100} />}
                </div>
                <div className="flex flex-col flex-1">
                    <div className="text-lg">{topic.title}</div>
                    {/* <div className="text-sm"><b>{topic.sections.length}</b> sections</div> */}
                </div>
                <div className="flex md:hidden group-hover:flex items-center mx-4">
                    {showDetails && <ExpandButton expanded={showDetails} onClick={() => { setShowDetails(!showDetails) }} />}
                </div>
                <div className="flex items-center">
                </div>
            </div>
            {/* Details */}
            {showDetails &&
                <div className="">
                    <div className="flex pt-1">
                        <div style={{ width: 48 }}></div>
                        {topic.blog_url != null && <div className="text-sm"><Link className="hover:text-cyan-200 hover:underline" href={topic.blog_url} target="_blank">{topic.blog_url}</Link></div>}
                    </div>
                    <div className="flex pt-2 pb-2">
                        <div style={{ width: 48 }}></div>
                        {(uploadStatus == 'not-started') && <div className=""><RoundButton icon={<RefreshSVG />} size='xs' onClick={reUploadBlog} /></div>}
                        {(uploadStatus == 'uploading') && <div className=""><LoadingBar hideLabel={true} /></div>}
                        {(uploadStatus == 'success') && <div className="fill-cyan-200 stroke-cyan-200 w-6 h-6"><Tick /></div>}
                    </div>
                </div>
            }
        </div>
    )
}