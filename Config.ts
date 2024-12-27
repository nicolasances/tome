export type ApiName = 'tomeQuiz' | 'auth'
export interface ApiEndpoint { name: ApiName, endpoint: string }

const ApiEndpoints = new Map<ApiName, string>();
ApiEndpoints.set("auth", String(process.env.REACT_APP_AUTH_API_ENDPOINT))
ApiEndpoints.set("tomeQuiz", String(process.env.REACT_APP_TOMEQUIZ_API_ENDPOINT))

export function endpoint(api: ApiName) {
    return ApiEndpoints.get(api)
}

export const APP_VERSION = "0.1.0"

