export interface Topic {
    title: string
    code: string
    sections: TopicSection[]
    blog_url: string
}

export interface TopicSection {
    title: string
    code: string
}