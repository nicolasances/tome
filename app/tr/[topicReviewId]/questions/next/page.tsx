'use client'

import { TomeAPI } from "@/api/TomeAPI";
import RoundButton from "@/app/ui/buttons/RoundButton";
import BackSVG from "@/app/ui/graphics/icons/Back";
import Book from "@/app/ui/graphics/icons/Book";
import NextSVG from "@/app/ui/graphics/icons/Next";
import QuestionSVG from "@/app/ui/graphics/icons/QuestionSVG";
import SendSVG from "@/app/ui/graphics/icons/Send";
import Tick from "@/app/ui/graphics/icons/Tick";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import BottomFade from "@/app/ui/layout/BottomFade";
import Footer from "@/app/ui/layout/Footer";
import { AnswerRating } from "@/model/answer";
import { TopicReviewQuestion } from "@/model/questions";
import { FormattedDetailedRatingExplanation, FormattedRatingExplanation } from "@/utils/RatingExplanation";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QuestionAndAnswerPage() {

    const params = useParams()

    const topicReviewId = String(params.topicReviewId);

    const [question, setQuestion] = useState<TopicReviewQuestion>();
    const [rating, setRating] = useState<AnswerRating>();

    const loadQuestion = async () => {

        const question = await new TomeAPI().getNextQuestion(topicReviewId);

        console.log(question);
        

        setQuestion(question)

    }

    /**
     * Sends the answer and gets it rated
     */
    const sendAnswer = async (answer: string) => {

        if (!answer || !question) return;

        const ratingResponse = await new TomeAPI().sendAnswer({ questionId: question.id, answer: answer })

        setRating(ratingResponse);

    }

    useEffect(() => { loadQuestion() }, [])

    return (

        <div className="flex flex-1 flex-col items-stretch justify-start">

            {question && !rating && <Question question={question} onAnswer={sendAnswer} />}
            {question && rating && <UserAnswerRating rating={rating} topicReviewId={topicReviewId} />}

        </div>
    )

}

function Question({ question, onAnswer }: { question: TopicReviewQuestion, onAnswer: (answer: string) => Promise<any> }) {  // eslint-disable-line @typescript-eslint/no-explicit-any

    const [answer, setAnswer] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const maxTextAreaHeight = 240; // Maximum height in pixels
    const minTextAreaHeight = 64; // Minimum height in pixels
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /**
     * Dynamically adjusts the height of the textarea based on its content, up to a maximum height.
     */
    const adjustTextAreaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height to calculate the new scrollHeight
            const newHeight = Math.min(textareaRef.current.scrollHeight, maxTextAreaHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswer(e.target.value);
        adjustTextAreaHeight();
    };

    const onClickSendAnswer = async () => {
        if (!answer.trim()) return;

        setLoading(true);

        await onAnswer(answer);

        setLoading(false);
    };

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start text-lg">
            {/* Question Box */}
            <div className="flex flex-1 flex-col align-left mt-2">
                <div className="font-bold flex items-center">
                    <span className="mr-2 bg-cyan-800 rounded px-1 py-[2px] text-cyan-200">{question.questionNum}/{question.numQuestions}</span>Question:
                </div>
                <div className="mt-2 font-bold text-xl">
                    {question.sectionTitle}
                </div>
                <div className="overflow-y-auto max-h-[200px] mt-2">
                    {question.question}
                </div>
            </div>

            {loading && (
                <div className="mb-2 px-2">
                    <LoadingBar label="Evaluating your Answer" />
                </div>
            )}

            {/* Answer box */}
            <div className="flex flex-col border border-cyan-800 rounded-xl px-4 py-3 mb-2">
                <textarea
                    ref={textareaRef}
                    onChange={onChangeHandler}
                    value={answer}
                    className="bg-transparent no-border focus:outline-none w-full text-xl"
                    rows={1}
                    style={{
                        resize: "none",
                        overflowY: answer.length > 0 && textareaRef.current?.scrollHeight! > maxTextAreaHeight ? 'auto' : 'hidden', // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
                        minHeight: `${minTextAreaHeight}px`,
                        maxHeight: `${maxTextAreaHeight}px`,
                    }}
                ></textarea>
                <div className="flex justify-end fill-cyan-800">
                    {!loading && <RoundButton icon={<SendSVG />} onClick={onClickSendAnswer} size="s" />}
                </div>
            </div>
        </div>
    );
}

function UserAnswerRating({ rating, topicReviewId }: { rating: AnswerRating, topicReviewId: string }) {

    const [showDetails, setShowDetails] = useState(false)

    const router = useRouter()

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            <div className="relative">
                <div style={{ maxHeight: 'calc(96vh - var(--app-header-height) - var(--app-footer-height))', height: 'calc(96vh - var(--app-header-height) - var(--app-footer-height))', overflow: 'scroll' }} className="no-scrollbar mb-4">

                    <div className="flex items-center text-lg">
                        <div className="">Rating: </div>
                        <div className="ml-2 bg-cyan-200 rounded px-2 py-1"><span className="font-bold">{rating.rating}</span><span>/{rating.maxRating}</span></div>
                    </div>

                    {/* Explanation Box */}
                    <div id="explanation-box" className="flex flex-1 flex-col align-left mt-4" >
                        {!showDetails && <FormattedRatingExplanation explanation={rating.explanations} />}
                        {showDetails &&
                            <div className="mb-4 text-base md:text-lg">
                                <FormattedDetailedRatingExplanation text={rating.detailedExplanations} />
                            </div>
                        }
                    </div>

                </div>
                <BottomFade height='lg' />
            </div>

            <div className="flex-1"></div>

            <div style={{ height: 'var(--app-footer-height)' }}>
                <Footer>
                    <div className="flex justify-center items-center flex-row space-x-2" style={{ maxHeight: 'var(--app-footer-height)' }}>
                        <div className="flex-1 flex justify-end">
                            <RoundButton icon={<Book />} size='s' onClick={() => { router.push(`/tr/${topicReviewId}`) }} />
                        </div>

                        <div className="">
                            {!rating.topicReviewFinished && !showDetails && <RoundButton icon={<NextSVG />} onClick={() => { window.location.reload() }} />}
                            {!rating.topicReviewFinished && showDetails && <RoundButton icon={<BackSVG />} onClick={() => { setShowDetails(false) }} />}
                            {rating.topicReviewFinished && <RoundButton icon={<Tick />} onClick={() => { router.push(`/tr/${topicReviewId}`) }} />}
                        </div>

                        <div className="flex-1 flex justify-start">
                            {!showDetails && <RoundButton icon={<QuestionSVG />} size='s' onClick={() => { setShowDetails(true) }} />}
                        </div>
                    </div>
                </Footer>
            </div>

        </div>
    )
}