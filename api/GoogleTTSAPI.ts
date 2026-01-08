
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
            throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
        }

        console.log('Response received:', {
            status: response.status,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
        });

        const blob = await response.blob();
        
        const audioUrl = URL.createObjectURL(blob);
        
        return audioUrl;

    }
}