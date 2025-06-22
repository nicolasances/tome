export type ApiName = 'toto-ms-tome-agent' | 'toto-ms-tome-scraper' | 'auth' | 'tome-ms-flashcards' | 'tome-ms-topics'
export interface ApiEndpoint { name: ApiName, endpoint: string }

const ApiEndpoints = new Map<ApiName, string>();
ApiEndpoints.set("auth", String(process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT))
ApiEndpoints.set("toto-ms-tome-agent", String(process.env.NEXT_PUBLIC_TOTO_API_ENDPOINT_AWS))
ApiEndpoints.set("toto-ms-tome-scraper", String(process.env.NEXT_PUBLIC_TOTO_API_ENDPOINT_AWS))
ApiEndpoints.set("tome-ms-flashcards", String(process.env.NEXT_PUBLIC_TOME_FLASHCARDS_API_ENDPOINT))
ApiEndpoints.set("tome-ms-topics", String(process.env.NEXT_PUBLIC_TOME_TOPICS_API_ENDPOINT))

export function endpoint(api: ApiName) {

    return ApiEndpoints.get(api)
}

export const APP_VERSION = "0.1.0"

