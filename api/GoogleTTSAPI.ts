
export class GoogleTTSAPI {

    async synthesizeSpeech(text: string, languageCode: string = 'en-US', voiceName: string = 'en-US-Neural2-I'): Promise<string> {
        
        const backendUrl = '/api/tts/synthesize';

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                languageCode,
                voiceName
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`TTS API error: ${error.message || response.statusText}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        return audioUrl;

    }
}