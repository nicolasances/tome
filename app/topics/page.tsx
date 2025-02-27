'use client'

import { TomeAPI } from "@/api/TomeAPI";
import { Topic } from "@/model/Topic";
import { useEffect, useState } from "react";
import RoundButton from "../ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import Add from "../ui/graphics/icons/Add";
import Link from "next/link";
import Footer from "../ui/layout/Footer";
import HomeSVG from "../ui/graphics/icons/HomeSVG";

export default function TopicsPage() {

    const [topics, setTopics] = useState<Topic[]>([]);

    const router = useRouter();

    /**
     * Function to load Topics from the TomeAPI and set them in the state
     */
    const loadTopics = async () => {

        // Call the API to get the topics
        const topics = await new TomeAPI().getTopics();

        // Set the topics in the state
        setTopics(topics.topics);
    }

    useEffect(() => { loadTopics() }, []);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 app-content">
                <div className="text-cyan-200 text-base font-bold">Topics in the Knowledge Base</div>
                {topics && topics.map((topic, index) => <TopicItem key={topic.code} topic={topic} last={index == topics.length - 1} />)}
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

function TopicItem({ topic, last }: { topic: Topic, last: boolean }) {

    return (
        <div className={`${!last ? "border-b" : ''} border-cyan-600 py-2`}>
            <div className=""></div>
            <div className="flex flex-col">
                <div className="text-lg">{topic.title}</div>
                <div className="text-sm"><b>{topic.sections.length}</b> sections</div>
                {topic.blog_url && <div className="text-sm"><Link href={topic.blog_url} /></div>}
            </div>
        </div>
    )
}