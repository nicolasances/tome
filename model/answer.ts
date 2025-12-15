

export interface Answer {

    questionId: string,
    answer: string
}

export interface AnswerRating {

    rating: number
    maxRating: number
    explanations: string
    detailedExplanations: string 
    topicReviewFinished?: boolean
}
