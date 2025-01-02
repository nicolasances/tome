
export interface QuizQuestion {
    id: string 
    questionNum: number
    question: string  
    quizId: string 
    numQuestionsInQuiz: number
    answer: string 
    answerOn: string 
    rating: number
    maxRating: number
}