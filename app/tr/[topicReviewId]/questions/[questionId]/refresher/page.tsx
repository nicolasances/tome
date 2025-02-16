'use client'

import { TomeAPI } from "@/api/TomeAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import { Topic } from "@/model/Topic";
import { FormattedDetailedRatingExplanation } from "@/utils/RatingExplanation";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link'
import Footer from "@/app/ui/layout/Footer";
import BackSVG from "@/app/ui/graphics/icons/Back";
import BottomFade from "@/app/ui/layout/BottomFade";

export default function RefresherPage() {

    const [loading, setLoading] = useState<boolean>(true)
    const [refresher, setRefresher] = useState<string>()
    const [topic, setTopic] = useState<Topic>()

    const params = useParams()
    const router = useRouter()

    const questionId = String(params.questionId);

    const loadRefresher = async () => {

        setLoading(true)

        const refresher = await new TomeAPI().getRefresher(questionId);

        setRefresher(refresher.refresher)
        // setRefresher("<div class='refresher'><h1>The Third Crusade (1189-1192)</h1><p>The Third Crusade began when <span class='highlight-person'>Guy of Lusignan</span>, breaking his promise to not take arms against <span class='highlight-person'>Saladin</span>, marched to Acre in <span class='highlight-date'>1189</span>. The battle of Acre would prove to be a lengthy siege, with the Frankish fleet maintaining a naval blockade that prevented Muslim supply lines from reaching the city.</p><p>The Crusade was officially led by three powerful monarchs:</p><ul>    <li><span class='highlight-person'>Philippe Auguste</span>, King of France</li>    <li><span class='highlight-person'>Richard Lionheart</span>, soon-to-be King of England</li>    <li><span class='highlight-person'>Frederick Barbarossa</span>, German Emperor (who tragically drowned during the journey)</li></ul><p>Prior to the Crusade, <span class='highlight-person'>Philippe Auguste</span> and <span class='highlight-person'>Richard</span> had been at war in Northern France, but the Pope's call united them in this holy endeavor. Though <span class='highlight-person'>Frederick Barbarossa's</span> army continued after his death, it played only a minor role.</p><p>In <span class='highlight-date'>1191</span>, both <span class='highlight-person'>Richard</span> and <span class='highlight-person'>Philippe</span> arrived at Acre, which fell that same year. The aftermath was brutal - the population was either <b>killed or enslaved</b>, showing none of the mercy that <span class='highlight-person'>Saladin</span> had previously demonstrated.</p><p>Due to persistent illness, <span class='highlight-person'>Philippe Auguste</span> abandoned the Crusade and returned to France. <span class='highlight-person'>Richard</span> remained and achieved significant victories against <span class='highlight-person'>Saladin</span>, including:</p><ul>    <li>The recovery of Jaffa</li>    <li>Reclaiming numerous important Christian territories</li></ul><p>However, <span class='highlight-person'>Richard</span> never succeeded in capturing Jerusalem. In <span class='highlight-date'>1092</span>, urgent matters in England forced him to abandon the Crusade.</p><p><span class='highlight-person'>Saladin</span>, devastated by the loss of many of his conquests, died in <span class='highlight-date'>1093</span>. A succession war erupted between his sons and brother, ultimately won by his brother <span class='highlight-person'>al-Adel</span> in <span class='highlight-date'>1202</span>.</p></div>")
        setTopic(refresher.topic)
        setLoading(false)

    }

    useEffect(() => { loadRefresher() }, [])

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start text-lg">

            <div className="relative" >

                <div className="flex flex-1 flex-col align-left mt-4 pb-8 md:pb-[64px] overflow-scroll no-scrollbar" style={{ maxHeight: 'calc(100vh - var(--app-header-height) - var(--app-footer-height) - 48px)' }}>
                    {loading &&
                        <div className="mt-1">
                            <LoadingBar />
                        </div>
                    }
                    {!loading && refresher &&
                        <div className="mt-2">
                            {refresher.includes('</div>') && (
                                <div className="" dangerouslySetInnerHTML={{ __html: refresher }} />
                            )}
                            {!refresher.includes('</div>') && (
                                <FormattedDetailedRatingExplanation text={refresher} />
                            )}
                            {topic &&
                                <div className="mt-4">
                                    <div className="text-cyan-200">Want more information?</div>
                                    <Link href={topic.blog_url} target="_blank"><span className="underline text-blue">{topic.blog_url}</span></Link>
                                </div>
                            }
                        </div>
                    }
                </div>
                <BottomFade height="lg" />
            </div>

            <div className="flex-1"></div>

            <Footer>
                <div className="flex justify-center items-center space-x-2">
                    <div className="flex flex-1 justify-end">
                    </div>
                    <RoundButton icon={<BackSVG />} onClick={() => { router.back() }} />
                    <div className="flex-1">
                    </div>
                </div>
            </Footer>

        </div>
    )

}