'use client'

import { TomeAPI } from "@/api/TomeAPI";
import { AnswerRatingWidget } from "@/app/ui/AnswerRatingWidget";
import { AnswerTextArea } from "@/app/ui/AnswerTextArea";
import RoundButton from "@/app/ui/buttons/RoundButton";
import Book from "@/app/ui/graphics/icons/Book";
import IdeaSVG from "@/app/ui/graphics/icons/IdeaSVG";
import NextSVG from "@/app/ui/graphics/icons/Next";
import { LoadingBar } from "@/app/ui/graphics/Loading";
import BottomFade from "@/app/ui/layout/BottomFade";
import Footer from "@/app/ui/layout/Footer";
import QuestionBox from "@/app/ui/QuestionBox";
import UserAnswer from "@/app/ui/UserAnswer";
import { useTomeContext } from "@/context/TomeContext";
import { AnswerRating } from "@/model/answer";
import { TopicReviewQuestion } from "@/model/questions";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuestionDetailPage() {

    const tomeContext = useTomeContext()

    const [question, setQuestion] = useState<TopicReviewQuestion>()
    const [answer, setAnswer] = useState<string>("");
    const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
    const [rating, setRating] = useState<AnswerRating>();

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const maxTextAreaHeight = 340; // Maximum height in pixels

    const topicReviewId = String(params.topicReviewId);
    const questionId = String(params.questionId);

    /**
     * Loads the question identified by the id in the URL
     */
    const loadQuestion = async () => {

        const question = await new TomeAPI().getQuestion(questionId)

        setQuestion(question)

    }

    /**
     * Go to the page where the user can be helped with a refresher of the topic
     */
    const onClickIdea = () => {

        router.push(`${pathname}/refresher`)

    }

    /**
     * Sends the answer and waits for the rating of the answer
     */
    const onClickSendAnswer = async () => {
        if (!answer.trim()) return;

        setEvaluatingAnswer(true);

        const ratingResponse = await new TomeAPI().sendAnswer({ questionId: questionId, answer: answer })

        setRating(ratingResponse);

        setEvaluatingAnswer(false);
    };

    /**
     * Shows the next question
     */
    const onNextQuestion = () => {

        const nextQuestion = getNextQuestion()

        console.log(nextQuestion);


        if (!nextQuestion) return;

        router.push(`/tr/${topicReviewId}/questions/${nextQuestion.id}`)

    }

    /**
     * Retrieves the next question (the one coming after the current one)
     */
    const getNextQuestion = () => {

        const questions = tomeContext.topicReviewContext?.questions

        if (!questions) return null;
        if (!question) return null;

        let nextQuestion = false
        for (const q of questions) {

            // If we found the next question, return it
            if (nextQuestion) return q;

            // If q is the current question, flag that we're gonna get the next in line at the iteration
            if (!nextQuestion && q.id == question.id) nextQuestion = true;

        }

        return null;

    }

    /**
     * Returns true if the TR is finished after this question
     */
    const isLastQuestion = () => {

        return getNextQuestion() == null;
    }

    /**
     * Defines whether this question was the last one of the section. 
     * 
     * In case the question is the last one, this will enable the user
     * to view a recap of the section, so that she can better remember next time. 
     */
    const isLastQuestionOfSection = () => {

        const questions = tomeContext.topicReviewContext?.questions

        if (!questions) return false;
        if (!question) return false;

        const nextQuestion = getNextQuestion();

        if (nextQuestion?.sectionCode != question.sectionCode) return true;

        return false;
    }


    useEffect(() => { loadQuestion() }, [])

    if (!question) return <></>

    let displayedRating: AnswerRating | undefined = undefined;
    if (question.rating != null) displayedRating = {
        rating: question.rating,
        explanations: question.explanations,
        detailedExplanations: question.detailedExplanation,
        maxRating: question.maxRating
    }
    else if (rating != null) displayedRating = rating;

    const bottomPadding = '12px'
    const contentHeight = `calc(100vh - var(--app-header-height) - ${bottomPadding})`
    let textHeight = `calc(${contentHeight} - ${maxTextAreaHeight}px)`
    if (displayedRating) textHeight = `calc(96vh - var(--app-header-height) - var(--app-footer-height) )`
    // if (textareaRef && textareaRef.current) textHeight = `calc(96vh - var(--app-header-height) - var(--app-footer-height) - ${textareaRef.current.style.height}px)`

    let displayedAnswer = question ? question.answer : undefined;
    if (!displayedAnswer && answer) displayedAnswer = answer;

    return (

        <div className={`flex flex-1 flex-col items-stretch justify-start text-lg`} style={{minHeight: contentHeight}}>

            <div className="relative">
                <div style={{ minHeight: textHeight, maxHeight: textHeight, height: textHeight, overflow: 'scroll' }} className="no-scrollbar mb-4">

                    {/* Question Box */}
                    <QuestionBox question={question} />

                    {/* Answer Box */}
                    <UserAnswer answer={displayedAnswer} className="mt-4" />

                    {evaluatingAnswer && (
                        <div className="mt-4">
                            <LoadingBar label="Evaluating your Answer" />
                        </div>
                    )}

                    <AnswerRatingWidget className="mt-4" rating={displayedRating} />

                </div>
                <BottomFade height='lg' />

            </div>

            <div className="flex-1"></div>

            {/* Answer box */}
            {!displayedRating && <AnswerTextArea answer={answer} onChange={(value) => { setAnswer(value) }} onClickSendAnswer={onClickSendAnswer} loading={evaluatingAnswer} />}

            {displayedRating &&
                <Footer>
                    <div className="flex justify-center items-center space-x-2">
                        <div className="flex flex-1 justify-end">
                            {!isLastQuestion() && <RoundButton icon={<Book />} size='s' onClick={() => { router.push(`/tr/${topicReviewId}`) }} />}
                        </div>
                        {!isLastQuestion() && <RoundButton icon={<NextSVG />} onClick={onNextQuestion} />}
                        {isLastQuestion() && <RoundButton icon={<Book />} onClick={() => { router.push(`/tr/${topicReviewId}`) }} />}
                        <div className="flex-1 flex">
                            {isLastQuestionOfSection() && <RoundButton icon={<IdeaSVG />} onClick={onClickIdea} size='s' />}
                        </div>
                    </div>
                </Footer>
            }


        </div>
    )
}

