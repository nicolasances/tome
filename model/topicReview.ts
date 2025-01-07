
export interface TopicReview {

    id: string,
    topicCode: string,
    topicTitle: string,
    createdOn: string
    rating: number,
    maxRating: number,   // e.g. 5, if the max achievable score is 5

}