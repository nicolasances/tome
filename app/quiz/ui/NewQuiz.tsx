import LightningBoltSVG from "@/app/ui/buttons/assets/LightningBoltSVG";
import RoundButton from "@/app/ui/buttons/RoundButton";

export default function NewQuiz({ onStartQuiz }: { onStartQuiz: () => void }) {

    return (
        <div className="flex flex-1 flex-col items-center justify-center space-y-2">
            <div className="text-3xl mb-6">
                Ready to start?
            </div>
            <div className="flex">
                <RoundButton icon={<LightningBoltSVG />} onClick={onStartQuiz} />
            </div>
        </div>
    )
}