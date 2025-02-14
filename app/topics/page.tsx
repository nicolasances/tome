'use client'

import { TomeAPI, TopicMemLevel } from "@/api/TomeAPI";
import { Topic } from "@/model/Topic";
import { useEffect, useState } from "react";
import RoundButton from "../ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import Add from "../ui/graphics/icons/Add";
import Link from "next/link";
import Footer from "../ui/layout/Footer";
import HomeSVG from "../ui/graphics/icons/HomeSVG";
import RefreshSVG from "../ui/graphics/icons/RefreshSVG";
import { LoadingBar } from "../ui/graphics/Loading";
import Tick from "../ui/graphics/icons/Tick";
import MemLevel from "../ui/graphics/MemLevel";
import ExpandButton from "../ui/buttons/ExpandButton";

export default function TopicsPage() {

    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicMemorizationLevels, setTopicMemorizationLevels] = useState<TopicMemLevel[] | undefined>(undefined)

    const router = useRouter();

    /**
     * Function to load Topics from the TomeAPI and set them in the state
     */
    const loadTopics = async () => {

        // Call the API to get the topics
        const topics = await new TomeAPI().getTopics();

        // Set the topics in the state
        setTopics(topics.topics);

        const response = await new TomeAPI().getMemLevels()

        const memLeveledTopics = response.topics.sort((a, b) => b.memLevel - a.memLevel)

        setTopicMemorizationLevels(memLeveledTopics)
    }

    const findMemLevel = (topicCode: string): TopicMemLevel | undefined => {

        if (!topicMemorizationLevels) return undefined;

        for (let memLevel of topicMemorizationLevels) {
            if (memLevel.topicCode == topicCode) {
                return memLevel
            }
        }

    }

    useEffect(() => { loadTopics() }, []);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start 2xl:px-[25vw]">
            <div className="flex-1 app-content">
                <div className="text-cyan-700 text-base font-bold mb-2 border-b border-cyan-600 pb-1">Topics in the Knowledge Base</div>
                {topics && topics.map((topic, index) => <TopicItem key={topic.code} topic={topic} memLevel={findMemLevel(topic.code)} index={index} last={index == topics.length - 1} />)}
            </div>
            <Footer>
                <div className="flex justify-center items-center space-x-2">
                    <div className="flex-1 flex justify-end items-center">
                        <RoundButton icon={<HomeSVG />} size='s' onClick={() => { router.back() }} />
                    </div>
                    <RoundButton icon={<Add />} onClick={() => { router.push('/new-topic') }} />
                    <div className="flex-1"></div>
                </div>
            </Footer>
        </div>
    )
}

function TopicItem({ topic, last, memLevel, index }: { topic: Topic, last: boolean, memLevel: TopicMemLevel | undefined, index: number }) {

    const [uploadStatus, setUploadStatus] = useState<'not-started' | 'uploading' | 'failed' | 'success'>("not-started")
    const [showDetails, setShowDetails] = useState(false)

    const reUploadBlog = async () => {

        setUploadStatus("uploading")

        const result = await new TomeAPI().postTopic(topic.blog_url)

        if (result && result.blogUrl != null) {
            setUploadStatus('success');
            // Reset the upload
            setTimeout(() => { setUploadStatus('not-started') }, 2000)
        }
        else setUploadStatus('failed')

    }

    return (
        <div className={`my-1 py-2 group ${index % 2 == 0 ? 'bg-[#00a2b6] border-[#00a2b6]' : 'border-[#00acc1]'} border rounded hover:border-cyan-600`}>
            <div className="flex flex-1">
                <div className="mr-2">
                    {memLevel != null && <MemLevel perc={memLevel.memLevel * 100} />}
                </div>
                <div className="flex flex-col flex-1">
                    <div className="text-lg">{topic.title}</div>
                    <div className="text-sm"><b>{topic.sections.length}</b> sections</div>
                </div>
                <div className="flex md:hidden group-hover:flex items-center mx-4">
                    <ExpandButton onClick={() => { setShowDetails(!showDetails) }} />
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