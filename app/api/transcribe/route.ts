import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Received file:', file.name, 'type:', file.type, 'size:', file.size);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Buffer size:', buffer.length);
    console.log('First 16 bytes (hex):', buffer.slice(0, 16).toString('hex'));

    // Write to temporary file with correct extension based on filename
    const tempDir = os.tmpdir();
    const fileExtension = file.name.split('.').pop() || 'webm';
    const tempFileName = `audio-${Date.now()}.${fileExtension}`;
    tempFilePath = path.join(tempDir, tempFileName);
    
    fs.writeFileSync(tempFilePath, buffer);
    console.log('Wrote temporary file:', tempFilePath, 'size:', buffer.length);

    // Read the file back as a stream for OpenAI
    const fileStream = fs.createReadStream(tempFilePath);

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream as any,
      model: 'whisper-1',
    });

    console.log('Transcription result:', transcription.text);

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Deleted temporary file:', tempFilePath);
      } catch (err) {
        console.warn('Failed to delete temporary file:', err);
      }
    }
  }
}
