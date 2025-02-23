import NextSVG from "../graphics/icons/Next"
import RoundButton from "../buttons/RoundButton"
import { useRouter } from "next/navigation"
import LaureateSVG from "../graphics/icons/LaureateSVG"

export default function NewTopicReviewCard() {

    const router = useRouter()

    return (
        <div className="flex flex-row items-center justify-center mt-6 md:mt-0">
            <div className="group w-full md:w-fit flex items-center border-2 rounded rounded-full border-lime-200 px-3 py-2 space-x-2 cursor-pointer hover:border-cyan-200" onClick={() => { router.push(`/tr/new`) }} > 
                <div className="w-10 h-10 p-2 fill-lime-200 group-hover:fill-cyan-200"><LaureateSVG /></div>
                <div className="flex flex-col flex-1 md:flex-none">
                    <div className="text-lg text-lime-200 group-hover:text-cyan-200"><b>Start a new Topic Review</b></div>
                </div>
                <div className="md:pl-8 group-hover:text-cyan-200">
                    <RoundButton icon={<NextSVG />} iconOnly={true} size="s" onClick={() => { router.push(`/tr/new`) }} />
                </div>
            </div>
        </div>
    )
}