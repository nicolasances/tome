export interface Topic {
    title: string
    code: string
    sections: TopicSection[]
}

export interface TopicSection {
    title: string
    code: string
}