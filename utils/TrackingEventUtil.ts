import { TrackingEvent } from "@/api/TomeFlashcardsAPI";

/**
 * Groups tracking events by topic and section and sorts them by sectionCode and then by time
 * 
 * This method does the following:  
 * - Groups all events by section (sectionCode)
 * - In each section, groups all events by flashcard type 
 * - In each section, in each flashcard type group, orders the event by their timestamp (ascending)
 * 
 * - The flashcard type group of a given section will be marked as "generated" if there's an event with type "fcCreatedEventSent" for that section and flashcards type
 * - The section will be marked as "generated" if all flashcard type groups within it are marked as "generated"
 * - The topic will be marked as "generated" if all sections within it are marked as "generated"
 * 
 * @param events The tracking events to group.
 * @returns The grouped tracking events by topic.
 */
export function groupTrackingEvents(events: TrackingEvent[]): TopicTracking {

    if (events.length === 0) {
        return new TopicTracking("", false, []);
    }

    const topicId = events[0].topicId;
    
    // Group by section
    const sectionMap = new Map<string, TrackingEvent[]>();
    events.forEach(event => {
        const sectionCode = event.sectionCode;
        if (!sectionMap.has(sectionCode)) {
            sectionMap.set(sectionCode, []);
        }
        sectionMap.get(sectionCode)!.push(event);
    });

    const sectionTrackings: SectionTracking[] = [];
    
    for (const [sectionCode, sectionEvents] of sectionMap) {
        // Group by flashcard type within section
        const typeMap = new Map<string, TrackingEvent[]>();
        sectionEvents.forEach(event => {
            const type = event.flashcardType;
            if (!typeMap.has(type)) {
                typeMap.set(type, []);
            }
            typeMap.get(type)!.push(event);
        });

        const fcTypeTrackings: FCTypeTracking[] = [];
        
        for (const [type, typeEvents] of typeMap) {
            // Sort events by timestamp
            const sortedEvents = typeEvents.sort((a, b) => 
                a.timestamp.localeCompare(b.timestamp)
            );
            
            // Check if generated (has fcCreatedEventSent)
            const generated = sortedEvents.some(event => event.eventType === "fcCreatedEventSent");
            
            fcTypeTrackings.push(new FCTypeTracking(type, generated, sortedEvents));
        }

        // Section is generated if all flashcard types are generated
        const sectionGenerated = fcTypeTrackings.every(fc => fc.generated);
        
        sectionTrackings.push(new SectionTracking(sectionCode, sectionGenerated, fcTypeTrackings));
    }

    // Topic is generated if all sections are generated
    const topicGenerated = sectionTrackings.every(section => section.generated);

    return new TopicTracking(topicId, topicGenerated, sectionTrackings);
}

export class TopicTracking {
    topicId: string;
    generated: boolean;
    sectionEvents: SectionTracking[];

    constructor(topicId: string, generated: boolean, sectionEvents: SectionTracking[]) {
        this.topicId = topicId;
        this.generated = generated;
        this.sectionEvents = sectionEvents;
    }
}

export class SectionTracking {
    sectionCode: string;
    generated: boolean;      // Tracks whether this section's flashcards have all been generated
    sectionEvents: FCTypeTracking[];

    constructor(sectionCode: string, generated: boolean, sectionEvents: FCTypeTracking[]) {
        this.sectionCode = sectionCode;
        this.generated = generated;
        this.sectionEvents = sectionEvents;
    }
}

export class FCTypeTracking {
    type: string; 
    generated: boolean;         // tracks whether all flashcards with this type have been generated in this section
    events: TrackingEvent[];

    constructor(type: string, generated: boolean, events: TrackingEvent[]) {
        this.type = type;
        this.generated = generated;
        this.events = events;
    }
}