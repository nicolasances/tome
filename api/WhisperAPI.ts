/**
 * API to transcribe audio using OpenAI's Whisper model
 */
export class WhisperAPI {
  /**
   * Transcribe audio blob to text using OpenAI Whisper
   * @param audioBlob - The audio blob to transcribe
   * @returns Promise with the transcribed text
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    
    // Determine file extension based on MIME type
    let fileName = 'audio.webm';
    if (audioBlob.type.includes('mp4')) {
      fileName = 'audio.mp4';
    } else if (audioBlob.type.includes('webm')) {
      fileName = 'audio.webm';
    }
    
    console.log('Sending audio blob with MIME type:', audioBlob.type, 'as', fileName);
    formData.append('file', audioBlob, fileName);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Transcription failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
}
