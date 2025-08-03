import { EventGraph, EventNode, Fact, HistoricalGraphFC } from "@/model/api/GraphFlashcard";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import IdeaSVG from "../../graphics/icons/IdeaSVG";
import { useState } from "react";
import { DateFlashcardPopup, OptionsFlashcardPopup } from "../util/OptionsFlashcardPopup";

const nameColorPalette = ["bg-amber-100", "bg-rose-200", "bg-lime-400", "bg-sky-200", "bg-rose-300", "bg-violet-200"];

export function GraphWidget({ flashcard, onAnswerSelect }: { flashcard: PracticeFlashcard, onAnswerSelect: (isCorrect: boolean) => void }) {

    const [currentIndex, setCurrentIndex] = useState<number>(0); // Tracks the current index in the events storyline. 

    const graph = (flashcard.originalFlashcard as HistoricalGraphFC).graph;
    // const summary = graph.summary;
    const eventGraph = graph.eventGraph;

    // Flatten the event graph into a list of events
    const events = flattenGraph(eventGraph, graph.facts);

    // Extract all unique names from the events
    const uniqueNames = extractAllUniqueNames(events);

    /**
     * Records the answer as wrong. 
     * 
     * Concretely this will increase the counter of wrong answers for the flashcard, and will not move to the next event.
     */
    const recordWrongAnswer = () => {

        onAnswerSelect(false);
    }

    /**
     * When the user answers the event question correctly, you can show the next event
     */
    const onEventAnsweredCorrectly = () => {
        
        // Was this the last event? 
        const lastEvent = currentIndex + 1 >= events.length;

        console.log(`Event answered correctly: ${events[currentIndex].code} - Last event: ${lastEvent}`);
        
        setCurrentIndex(index => index + 1);

        // If the current index is the last one, we can consider the practice finished
        if (lastEvent) {

            // Call the onAnswerSelect to complete the Graph Flashcard
            onAnswerSelect(true);
        }
    }

    return (
        <div>
            <div className="flex flex-col justify-left relative pb-8">
                {events && events.map((event, index) => (
                    index <= currentIndex &&
                    <GraphItem key={event.code} event={event} uniqueNames={uniqueNames} onItemAnsweredCorrectly={onEventAnsweredCorrectly} onWrongAnswer={recordWrongAnswer} />
                )
                )}
                <div className="mt-2"></div>
                <div className="absolute border-cyan-200 border-2" style={{ top: 0, left: '74px', height: '100%' }}>
                </div>
                <div className="absolute bg-cyan-200 rounded-full" style={{ bottom: 0, left: 'calc(74px - 16px + 1px)', width: 32, height: 32 }}>
                </div>
            </div>
            <div className="flex justify-center mt-4 mb-8">
                {/* <RoundButton icon={<Tick />} size="m" onClick={() => { }} /> */}
            </div>
        </div>
    )

}

/**
 * Extract all unique names from a list of events.
 * @param events List of events from the event graph
 * @returns Array of unique names
 */
function extractAllUniqueNames(events: Event[]): string[] {
    const uniqueNames: Set<string> = new Set();

    events.forEach(event => {
        const matches = event.event.match(/<name>(.*?)<\/name>/g);
        if (matches) {
            matches.forEach(match => {
                const name = match.replace(/<\/?name>/g, '');
                uniqueNames.add(name);
            });
        }
    });

    return Array.from(uniqueNames);
}

/**
 * Maps a name to a color from the nameColorPalette.
 * The same name will always map to the same color.
 * 
 * @param name Name of a person or entity
 * @example
 * mapNameToColor("John Doe") // returns "bg-amber-200" if John Doe is the first name in the text
 */
function mapNameToColor(name: string, uniqueName: string[]): string {
    const index = uniqueName.indexOf(name);
    return nameColorPalette[index % nameColorPalette.length];
}

/**
 * On item of the graph, so represents an Event Node
 * @returns 
 */
function GraphItem({ event, uniqueNames, onItemAnsweredCorrectly, onWrongAnswer }: { event: Event, uniqueNames: string[], onItemAnsweredCorrectly: () => void, onWrongAnswer: () => void }) {

    const [eventAnswered, setEventAnswered] = useState<boolean>(false);
    const [dateAnswered, setDateAnswered] = useState<boolean>(false);
    // const [numFactsAnswered, setNumFactsAnswered] = useState<number>(0);

    const eventText = event.event;

    // In the eventText, replace all "<name>...</name>" tags with a <span> element. 
    const formattedEventText = eventText.replace(/<([^>]+)>(.*?)<\/\1>/g, (match, tagName, content) => {
        if (tagName === 'name') {
            // If the tag is "name", wrap the content in a span with a specific class
            return `<span class="${mapNameToColor(content, uniqueNames)} px-1 rounded">${content}</span>`;
        }
        return `<span class="text-cyan-100">${content}</span>`;
    });

    const onEventAnswer = (isCorrect: boolean): void => {

        if (isCorrect) {
            setEventAnswered(true);

            // If there's no date, we can consider the event answered
            if (event.date === null || event.date === undefined) {
                onDateAnswered(true);
            }
        }
        else {
            onWrongAnswer();
        }

    }

    const onDateAnswered = (isCorrect: boolean) => {

        setDateAnswered(true);

        if (!isCorrect) onWrongAnswer();

        // No matter what, we can move on, because if the user answered wrongly, the right answer was shown and the popup closed
        onItemAnsweredCorrectly();
    }

    return (
        <div className="flex flex-row justify-start items-start" style={{ margin: "6px 0" }}>

            {dateAnswered && <div className="min-w-[56px] text-base rounded-full bg-cyan-700 text-white text-center mr-2 mt-1"><b>{event.date}</b></div>}
            {!dateAnswered && eventAnswered && <EventDateQuestionButton event={event} onAnswered={onDateAnswered} />}
            {!dateAnswered && !eventAnswered && <div className="min-w-[56px] mr-2 mt-1"></div>}

            <div className="w-6 h-6 min-w-6 min-h-6 border-2 border-cyan-200 rounded-full" style={{ backgroundColor: 'var(--background)', zIndex: 1 }}></div>
            <div className="ml-2">
                {eventAnswered && <div className="text-base" dangerouslySetInnerHTML={{ __html: formattedEventText }} />}
                {!eventAnswered && <div><EventQuestionButton event={event} onAnswer={onEventAnswer} /></div>}

                {dateAnswered &&
                    <div className="flex flex-col space-y-2 mt-2 mb-2">
                        {event.facts && event.facts.map((fact) => (
                            <FactItem key={Math.random()} fact={fact} />
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

function EventQuestionButton({ event, onAnswer }: { event: Event, onAnswer: (isCorrect: boolean) => void }) {
    const [pressed, setPressed] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const disabled = false; // Set to true if you want to disable the button

    const onAnswerSelected = (isCorrect: boolean): void => {

        setTimeout(() => {
            setShowQuestion(!isCorrect) // If the answer is correct, we can close the question popup
            onAnswer(isCorrect);
        }, isCorrect ? 500 : 50);

    }

    return (
        <>
            <div className={`flex rounded border border-dashed border-cyan-300 p-2 text-sm text-white cursor-pointer`}
                style={{
                    transform: pressed ? "scale(0.95)" : "scale(1)",
                }}
                onMouseDown={() => !disabled && setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                onTouchStart={() => !disabled && setPressed(true)}
                onTouchEnd={() => setPressed(false)}
                onClick={() => setShowQuestion(true)}
            >
                What happened?
            </div>
            <OptionsFlashcardPopup question={event.question} options={event.answers} correctAnswerIndex={event.correctAnswerIndex} open={showQuestion} onClose={() => setShowQuestion(false)} onAnswerSelected={onAnswerSelected} />
        </>
    )
}

function EventDateQuestionButton({ event, onAnswered }: { event: Event, onAnswered: (isCorrect: boolean) => void }) {
    const [pressed, setPressed] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const disabled = false; // Set to true if you want to disable the button

    const onAnswerSelected = (isCorrect: boolean): void => {

        setTimeout(() => {
            setShowQuestion(false);
            onAnswered(isCorrect);
        }, isCorrect ? 500 : 1000);
    }

    return (
        <>
            <div className="min-w-[56px] text-base rounded-full border border-dashed border-cyan-300 text-cyan-200 text-center mr-2 mt-1 cursor-pointer"
                style={{
                    transform: pressed ? "scale(0.95)" : "scale(1)",
                }}
                onMouseDown={() => !disabled && setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                onTouchStart={() => !disabled && setPressed(true)}
                onTouchEnd={() => setPressed(false)}
                onClick={() => setShowQuestion(true)}
            >
                ?
            </div>
            <DateFlashcardPopup open={showQuestion} question="When did the event happen?" correctYear={parseInt(event.date!)} sectionTitle="" id={event.code} onClose={() => setShowQuestion(false)} onAnswerSelected={onAnswerSelected} />
        </>
    )
}

function FactItem({ fact }: { fact: Fact }) {

    // Remove all tags from the fact text
    const factText = fact.fact.replace(/<[^>]+>/g, '');

    return (
        <div className="flex rounded bg-cyan-800 p-2 text-sm text-white">
            <div className="fill-lime-300 text-lime-300 mr-2" style={{ minWidth: 16, height: 'auto' }}> <IdeaSVG /> </div>
            <div>{factText}</div>
        </div>
    )
}

interface Event {
    code: string; // Unique code for the event
    event: string;
    reason: string | null; // Reason for the event, if mentioned
    date: string | null; // Date in a specific format
    dateFormat: string | null; // e.g. "YYYY-MM-DD", "MM-DD", "DD-MM"
    question: string;
    answers: string[]; // Array of answers, only one is correct
    correctAnswerIndex: number; // Index of the correct answer in the answers array
    link?: "causal" | "chronological"; // Link type with the previous event in the graph, if applicable
    facts?: Fact[]
}

function flattenGraph(eventGraph: EventGraph, facts: Fact[]): Event[] {

    const events: Event[] = [];

    let currentNode: EventNode | null = eventGraph.firstEvent;

    while (currentNode) {

        // Find out if there's a fact related to that event
        const relatedFacts = facts.filter(f => f.eventCode === currentNode!.code);

        events.push({
            code: currentNode.code,
            event: currentNode.event,
            reason: currentNode.reason,
            date: currentNode.date,
            dateFormat: currentNode.dateFormat,
            question: currentNode.question,
            answers: currentNode.answers,
            correctAnswerIndex: currentNode.correctAnswerIndex,
            link: currentNode.link,
            facts: relatedFacts
        });
        currentNode = currentNode.nextEvent;
    }

    return events;
}