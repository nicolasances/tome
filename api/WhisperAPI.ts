import { TotoAPI } from "./TotoAPI";

/**
 * API to transcribe audio using OpenAI's Whisper model
 */
export class WhisperAPI {
  /**
   * Transcribe audio blob to text using OpenAI Whisper model. 
   * 
   * @param audioBlob - The audio blob to transcribe
   * @param modelHost - who is hosting the model: "toto" means that Toto is hosting the model (on the chosen hyperscaler), while "openai" uses the OpenAI API (paying)
   * 
   * @returns Promise with the transcribed text
   */
  async transcribeAudio(audioBlob: Blob, modelHost: "toto" | "openai", mode?: "sync" | "async"): Promise<WhisperResponse> {
    const formData = new FormData();

    // Determine file extension based on MIME type
    let fileName = 'audio.webm';
    if (audioBlob.type.includes('mp4')) {
      fileName = 'audio.mp4';
    } else if (audioBlob.type.includes('webm')) {
      fileName = 'audio.webm';
    }

    console.log(`Whisper model host: ${modelHost} - Sending audio blob with MIME type:`, audioBlob.type, 'as', fileName);

    formData.append('file', audioBlob, fileName);

    if (modelHost == 'openai') {
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

        return { text: data.text };

      } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
      }
    }
    else {

      // 1. Check if there's a request to run this as a job
      if (mode == "async") {
        
        // Run as a job
        const response = (await new TotoAPI().fetch('whispering', '/transcribejob', {
          method: 'POST',
          headers: {
            "Accept": "application/json"
          },
          body: formData
        })).json() as Promise<{ jobId: string }>;

        return { jobId: (await response).jobId };
      }
      else {

        // Run synchronously - ok for small audio files
        const response = (await new TotoAPI().fetch('whispering', '/transcribe', {
          method: 'POST',
          headers: {
            "Accept": "application/json"
          },
          body: formData
        })).json() as Promise<{ text?: string }>;

        return { text: (await response).text || "" };
      }
    }

  }
}

class WhisperResponse {
  text?: string;
  jobId?: string;
}