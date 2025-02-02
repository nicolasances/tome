
export interface TopicReview {

    id: string,
    topicCode: string,
    topicTitle: string,
    createdOn: string,
    completedOn: string,
    rating: number,
    maxRating: number,   // e.g. 5, if the max achievable score is 5

}

export interface TimelineDate {
    date: string
    events: string[]
}

export interface Timeline {

    timeline: TimelineDate[]
}