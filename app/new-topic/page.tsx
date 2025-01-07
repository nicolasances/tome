'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RoundButton from "../ui/buttons/RoundButton"
import Tick from "../ui/graphics/icons/Tick"
import { useState } from "react"
import { LoadingBar } from "../ui/graphics/Loading"
import { useRouter } from "next/navigation"
import { TomeAPI } from "@/api/TomeAPI"

export default function NewTopic() {

    const [blogUrl, setBlogUrl] = useState('')
    const [uploading, setUploading] = useState(false)

    const router = useRouter()

    const uploadBlog = async () => {

        console.log('Uploading blog: ' + blogUrl);

        setUploading(true);

        await new TomeAPI().postTopic(blogUrl);

        setUploading(false);

        router.back();
    }

    return (
        <div className="flex flex-1 flex-col items-stretch text-base md:text-lg">

            <div className="">
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

            <div className="flex flex-1 flex-col justify-end items-center">
                <div className="flex">
                    <RoundButton icon={<Tick />} onClick={uploadBlog} disabled={uploading} />
                </div>
            </div>
        </div>
    )
}