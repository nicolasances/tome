'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RoundButton from "../ui/buttons/RoundButton"
import Tick from "../ui/graphics/icons/Tick"
import { useState } from "react"
import { LoadingBar } from "../ui/graphics/Loading"
import { useRouter } from "next/navigation"
import { TomeAPI } from "@/api/TomeAPI"
import Footer from "../ui/layout/Footer"
import BackSVG from "../ui/graphics/icons/Back"
import { TomeTopicsAPI } from "@/api/TomeTopicsAPI"

export default function NewTopic() {

    const [blogUrl, setBlogUrl] = useState('')
    const [topicName, setTopicName] = useState<string>()
    const [uploading, setUploading] = useState(false)

    const router = useRouter()

    const uploadBlog = async () => {

        if (!topicName) return;

        console.log('Uploading blog: ' + blogUrl);

        setUploading(true);

        await new TomeTopicsAPI().postTopic(blogUrl, topicName);

        setUploading(false);

        router.back();
    }

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4">
            <div className="mt-6 flex justify-center text-xl">{topicName ? topicName : "New Topic"}</div>

            <div className="flex-1 app-content">

                <div className="grid w-full items-center gap-1.5 mt-4">
                    <Label htmlFor="name">Topic name</Label>
                    <Input disabled={uploading} className="text-base md:text-lg" type="text" id="name" placeholder="Insert the name of the Topic" onChange={(v) => { setTopicName(v.target.value) }} />
                </div>

                <div className="text-sm mt-4 px-2">
                    To upload a new topic, please copy below the URL of the blog you want to upload.
                </div>

                <div className="grid w-full items-center gap-1.5 mt-4">
                    <Label htmlFor="email">URL of the Blog</Label>
                    <Input disabled={uploading} className="text-base md:text-lg" type="url" id="email" placeholder="Insert the URL of the Blog" onChange={(v) => { setBlogUrl(v.target.value) }} />
                </div>

                {uploading &&
                    <div className="mt-4 pl-2">
                        <LoadingBar label="Uploading the Blog.." />
                    </div>
                }
            </div>

            <Footer>
                <div className="flex justify-center items-center space-x-2">
                    <div className="flex-1 flex justify-end items-center">
                        <RoundButton icon={<BackSVG />} size='s' onClick={() => { router.back() }} />
                    </div>
                    <RoundButton icon={<Tick />} onClick={uploadBlog} loading={uploading} />
                    <div className="flex-1"></div>
                </div>
            </Footer>
        </div>
    )
}