import { NextRequest, NextResponse } from 'next/server';
import * as textToSpeech from '@google-cloud/text-to-speech';

export async function POST(request: NextRequest) {
    try {
        const { text, languageCode = 'en-US', voiceName = 'en-US-Neural2-D', ssmlGender = 'MALE' } = await request.json();

        if (!text) {
            return NextResponse.json(
                { message: 'Text is required' },
                { status: 400 }
            );
        }

        // Create the text-to-speech client
        const client = new textToSpeech.TextToSpeechClient();

        const [result] = await client.listVoices({ languageCode });
        const voices = result.voices;

        if (!voices || voices.length === 0) {
            return NextResponse.json(
                { message: `No voices available for language '${languageCode}'` },
                { status: 500 }
            );
        }

        // Log available voices for debugging
        // console.log(`Available voices for ${languageCode}:`, voices.map(v => ({ name: v.name, gender: v.ssmlGender })));

        // Find the voice by exact name match first
        let selectedVoice = voices.find(v => v.name === voiceName);
        
        // If exact match not found, try matching by gender
        if (!selectedVoice && ssmlGender !== 'NEUTRAL') {
            const genderMap: { [key: string]: textToSpeech.protos.google.cloud.texttospeech.v1.SsmlVoiceGender } = {
                'MALE': textToSpeech.protos.google.cloud.texttospeech.v1.SsmlVoiceGender.MALE,
                'FEMALE': textToSpeech.protos.google.cloud.texttospeech.v1.SsmlVoiceGender.FEMALE,
                'NEUTRAL': textToSpeech.protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL,
            };
            const targetGender = genderMap[ssmlGender];
            selectedVoice = voices.find(v => v.ssmlGender === targetGender);
        }

        // Fall back to first available voice
        if (!selectedVoice) {
            selectedVoice = voices[0];
        }

        console.log(`Selected voice: ${selectedVoice.name}`);

        const request_body = {
            input: {
                text: text,
            },
            voice: {
                languageCode,
                name: selectedVoice.name,
                ssmlGender: selectedVoice.ssmlGender,
            },
            audioConfig: {
                audioEncoding: textToSpeech.protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
                pitch: 1.0,
                speakingRate: 1.0,
            },
        };

        const response = await client.synthesizeSpeech(request_body);
        const audioContent = response[0].audioContent;

        if (!audioContent) {
            return NextResponse.json(
                { message: 'Failed to generate audio content' },
                { status: 500 }
            );
        }

        // Return the audio as a blob
        return new NextResponse(Buffer.from(audioContent as string, 'binary'), {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': Buffer.byteLength(audioContent as string, 'binary').toString(),
            },
        });
    } catch (error) {
        console.error('TTS Error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
