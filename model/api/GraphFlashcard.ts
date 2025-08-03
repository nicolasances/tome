export interface HistoricalGraphFC {

    id?: string | undefined;
    type: string;
    topicId: string;
    topicCode: string;
    sectionCode: string;
    sectionIndex: number;
    user: string;
    
    sectionTitle: string; 
    sectionShortTitle: string;

    // Fields specific to Historical Graphs
    graph: HistoricalGraph;

    // Model related
    llmName: string; 
    llmProvider: string;
}

export interface HistoricalGraph {

    summary: string; 
    eventGraph: EventGraph;
    facts: Fact[];

}

export interface EventGraph {
    firstEvent: EventNode; // The first event in the graph
}

export interface EventNode {
    code: string; // Unique code for the event
    event: string;
    reason: string | null; // Reason for the event, if mentioned
    date: string | null; // Date in a specific format
    dateFormat: string | null; // e.g. "YYYY-MM-DD", "MM-DD", "DD-MM"
    nextEvent: EventNode | null;
    question: string; 
    answers: string[]; // Array of answers, only one is correct
    correctAnswerIndex: number; // Index of the correct answer in the answers array
    link?: "causal" | "chronological"; // Link type with the previous event in the graph, if applicable
}

export interface Fact {
    fact: string; 
    eventCode: string | null; // Code of the event this fact is connected to, or null if not related to any event
    linkReason: string | null; // Reason for the link to the specified event, if applicable
}