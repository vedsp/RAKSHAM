import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export function isGroqConfigured() {
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY is not set. Whisper transcription will fail.');
  }
  return !!process.env.GROQ_API_KEY;
}

export async function transcribeAudio(file, language = 'en') {
  if (!groq) {
    throw new Error('Groq API Key is missing. Cannot transcribe audio.');
  }

  try {
    const version = "v2.1"; // Internal tracker
    console.log(`[Groq ${version}] Processing: ${file.name} (${file.size} bytes, ${file.type})`);
    
    if (file.size === 0) {
      throw new Error('Empty audio file provided');
    }

    // Explicitly create a new File object to ensure filename and type are correctly passed to the SDK
    const blob = await file.arrayBuffer();
    const finalFile = new File([blob], file.name || 'speech.webm', { 
      type: file.type || 'audio/webm' 
    });

    const transcription = await groq.audio.transcriptions.create({
      file: finalFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'text',
      language: language === 'auto' ? undefined : language,
    });

    const result = typeof transcription === 'string' ? transcription : transcription.text || '';
    return result.trim();
  } catch (error) {
    console.error(`[Groq Error]`, error);
    
    if (error.status === 400) {
      console.error('[Groq 400] Bad Request. Check file format/size or model ID.');
      if (error.error) console.error('[Groq API Message]:', error.error.message);
    }
    
    throw error;
  }
}
