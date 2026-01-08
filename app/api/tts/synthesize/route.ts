import { NextRequest, NextResponse } from 'next/server';
import * as textToSpeech from '@google-cloud/text-to-speech';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { message: 'Text is required' },
                { status: 400 }
            );
        }

        // Create the text-to-speech client
        const client = new textToSpeech.TextToSpeechClient();

        const request_body = {
            input: {
                text: text,
            },
            voice: {
                languageCode: "en-US",
                name: "en-US-Neural2-J",
                ssmlGender: textToSpeech.protos.google.cloud.texttospeech.v1.SsmlVoiceGender.MALE,
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
