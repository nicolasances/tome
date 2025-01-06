import Book from "../graphics/icons/Book";

export default function QuizTopicCard() {
    return (
        <div className="flex items-center space-x-2">
            <div className="fill-cyan-800 w-10 min-w-10 h-10 rounded-full border-2 border border-cyan-800 p-2">
                <Book />
            </div>
            <div className="flex-col">
                <div className="text-lg uppercase"><b>Cortés</b></div>
                <div className="text-base">Invasion of Mexico and La Noche Triste</div>
            </div>
        </div>

    )
}