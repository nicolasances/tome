
export class TomeFlashAPI {

    /**
     * Fetches the flash cards for the specified topic 
     */
    async getFlashCards(topic: string): Promise<GetFlashCardsResponse> {

        const cards =
            [
                {
                    "question": "Who were the Theophilacts?",
                    "answers": [
                        "A Roman noble family involved in papal politics",
                        "A dynasty of emperors in Byzantium",
                        "A German royal house",
                        "A religious order"
                    ],
                    "correctAnswerIndex": 0,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who was Marozia’s father?",
                    "answers": ["Alberic", "Theophilact", "Hugh of Provence", "Pope Sergius"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who was Marozia’s mother?",
                    "answers": ["Matilda", "Theodora", "Irene", "Sophia"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who was Marozia’s lover and father of her son John?",
                    "answers": ["Pope Leo VII", "Pope Formosus", "Pope Sergius", "Pope Benedict"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who was the bishop Theodora promoted to papacy?",
                    "answers": ["Pope Leo IX", "Pope John X", "Pope Nicholas I", "Pope Formosus"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who was Marozia’s second husband, a northern military lord?",
                    "answers": ["Hugh of Provence", "Alberic", "Berengar", "Otto I"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who were Marozia’s sons?",
                    "answers": ["John and Leo", "John and Alberic II", "Hugh and Alberic I", "Benedict and Leo"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who did Marozia marry to make him King of Italy?",
                    "answers": ["Otto I", "Berengar", "Hugh of Provence", "Henry the Fowler"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "Which of Marozia's sons became pope?",
                    "answers": ["Alberic II", "Leo", "John", "Benedict"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "Who led a rebellion against Marozia?",
                    "answers": ["Pope John", "Hugh of Provence", "Alberic II", "Theodora"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "When did the rule of the Theophilacts begin?",
                    "answers": ["9th century", "10th century", "11th century", "12th century"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "When did the Theophilact era end?",
                    "answers": ["Late 10th century", "Mid-11th century", "Early 12th century", "9th century"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "How long did the Theophilacts' influence over the papacy last?",
                    "answers": ["50 years", "Over 100 years", "30 years", "Less than a century"],
                    "correctAnswerIndex": 1,
                    "tag": "the bad popes"
                },
                {
                    "question": "How long did Alberic II rule Rome?",
                    "answers": ["10 years", "15 years", "20 years", "25 years"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "What significant military victory did the triumvirate in Rome achieve?",
                    "answers": ["Defeated the Normans", "Defeated the Byzantines", "Defeated the Saracens", "Conquered Constantinople"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "What political body ruled Rome including Theophilact, Alberic, and the pope?",
                    "answers": ["The Roman Senate", "The Holy Alliance", "A triumvirate", "The College of Cardinals"],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "What happened to Marozia after Alberic II rebelled?",
                    "answers": [
                        "She was exiled to France",
                        "She became Empress",
                        "She was immured in Castel Sant’Angelo",
                        "She ruled as regent"
                    ],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "What action did Marozia take to try to become Empress?",
                    "answers": [
                        "Invaded Rome",
                        "Convinced Otto I to marry her",
                        "Married Hugh of Provence and planned to use her son Pope John",
                        "Became pope herself"
                    ],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "What change did Alberic II make to papal authority?",
                    "answers": [
                        "Increased its power",
                        "Made it hereditary",
                        "Removed its temporal power",
                        "Abolished it entirely"
                    ],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "What title did Theodora effectively hold despite her husband's status?",
                    "answers": ["Regent", "Abbess", "Empress", "Senatrix"],
                    "correctAnswerIndex": 3,
                    "tag": "the bad popes"
                },
                {
                    "question": "What unusual family dynamic existed between Theodora, Marozia, and the papacy?",
                    "answers": [
                        "All three became nuns",
                        "They collectively held religious office",
                        "Each had a lover who became pope",
                        "They created a female-only priesthood"
                    ],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                },
                {
                    "question": "Why was Marozia considered politically powerful?",
                    "answers": [
                        "She led the Roman army",
                        "She crowned herself pope",
                        "She placed lovers and sons in papal office",
                        "She led the Crusades"
                    ],
                    "correctAnswerIndex": 2,
                    "tag": "the bad popes"
                }
            ]


        return { cards };


    }


}

export interface FlashCard {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    tag: string;
}

export interface GetFlashCardsResponse {
    cards: FlashCard[];
}
