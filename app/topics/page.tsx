'use client'

import RoundButton from "../ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import Add from "../ui/graphics/icons/Add";
import Footer from "../ui/layout/Footer";
import HomeSVG from "../ui/graphics/icons/HomeSVG";
import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";

export default function TopicsPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: 'Topics',
            actions: undefined,
        });
    }, [setConfig]);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 app-content">
                {/* {topics && topics.map((topic, index) => <TopicItem key={topic.code} topic={topic} memLevel={findMemLevel(topic.code)} index={index} />)} */}
                {/* <TopicsCard /> */}
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