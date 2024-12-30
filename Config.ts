export type ApiName = 'toto-ms-tome-agent' | 'auth'
export interface ApiEndpoint { name: ApiName, endpoint: string }

const ApiEndpoints = new Map<ApiName, string>();
ApiEndpoints.set("auth", String(process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT))
ApiEndpoints.set("toto-ms-tome-agent", String(process.env.NEXT_PUBLIC_TOTO_API_ENDPOINT_AWS))

export function endpoint(api: ApiName) {

    return ApiEndpoints.get(api)
}

export const APP_VERSION = "0.1.0"

