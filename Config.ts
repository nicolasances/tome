export type ApiName = 'toto-ms-tome-scraper' | 'auth' | 'tome-ms-flashcards' | 'tome-ms-topics' | 'tome-ms-practice' | 'tome-ms-points' | 'tome-ms-challenges' | 'whispering';
export interface ApiEndpoint { name: ApiName, endpoint: string }
 
const ApiEndpoints = new Map<ApiName, string>();
ApiEndpoints.set("auth", String(process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT))
ApiEndpoints.set("toto-ms-tome-scraper", String(process.env.NEXT_PUBLIC_TOME_SCRAPER_API_ENDPOINT))
ApiEndpoints.set("tome-ms-topics", String(process.env.NEXT_PUBLIC_TOME_TOPICS_API_ENDPOINT))
ApiEndpoints.set("tome-ms-practice", String(process.env.NEXT_PUBLIC_TOME_PRACTICE_API_ENDPOINT))
ApiEndpoints.set("tome-ms-points", String(process.env.NEXT_PUBLIC_TOME_POINTS_API_ENDPOINT))
ApiEndpoints.set("tome-ms-flashcards", String(process.env.NEXT_PUBLIC_TOME_FLASHCARDS_API_ENDPOINT))
ApiEndpoints.set("tome-ms-challenges", String(process.env.NEXT_PUBLIC_TOME_CHALLENGES_API_ENDPOINT))
ApiEndpoints.set("whispering", String(process.env.NEXT_PUBLIC_WHISPERING_API_ENDPOINT))

export function endpoint(api: ApiName) {

    return ApiEndpoints.get(api)
}

export const APP_VERSION = "5.0.0"

