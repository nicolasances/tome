import { TotoAPI } from "./TotoAPI";

export class TomeSourcesAPI {

    async getSources(language: string): Promise<GetSourcesResponse> {
        return (await new TotoAPI().fetch('tome-ms-sources', `/sources?language=${language}`)).json();
    }

    async createSource(req: CreateSourceRequest): Promise<{ id: string }> {
        return (await new TotoAPI().fetch('tome-ms-sources', '/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req),
        })).json();
    }

    async extractSource(sourceId: string): Promise<ExtractionResult> {
        return (await new TotoAPI().fetch('tome-ms-sources', `/sources/${sourceId}/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })).json();
    }

}

export interface Source {
    id: string;
    type: string;
    language: string;
    name: string;
    resourceId: string;
    createdAt: string;
    lastExtractedAt: string | null;
}

export interface GetSourcesResponse {
    sources: Source[];
}

export interface CreateSourceRequest {
    type: string;
    language: string;
    name: string;
    resourceId: string;
}

export interface ExtractionResult {
    sourceId: string;
    wordsExtracted: number;
    wordsCreated: number;
    wordsErrored: number;
}

/** Maps a source type value to a display label. */
export function sourceTypeLabel(type: string): string {
    switch (type) {
        case 'google_doc': return 'Google Doc';
        default: return type;
    }
}

/** Maps a source type value to an SVG icon path in /public/images/. */
export function sourceTypeIcon(type: string): string {
    switch (type) {
        case 'google_doc': return '/images/sourceTypes/google-doc.svg';
        case 'audio': return '/images/sourceTypes/audio.svg';
        default: return '/images/metadata-missing.svg';
    }
}

/** All source types currently supported for creation. */
export const SUPPORTED_SOURCE_TYPES: Array<{ type: string; label: string; icon: string; disabled?: boolean }> = [
    { type: 'google_doc', label: 'Google Doc', icon: '/images/sourceTypes/google-doc.svg' },
    { type: 'audio', label: 'Audio', icon: '/images/sourceTypes/audio.svg', disabled: true },
];
