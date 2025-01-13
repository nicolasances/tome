
export interface TopicReviewQuestion {
    id: string 
    questionNum: number
    numQuestions: number
    question: string  
    topicReviewId: string 
    sectionTitle: string
    sectionCode: string

    answer: string 
    answerOn: string 
    rating: number
    maxRating: number

    detailedExplanation: string 
    explanations: string
}