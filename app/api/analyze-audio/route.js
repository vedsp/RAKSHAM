import { NextResponse } from 'next/server';
import { analyzeAudioTranscript, isGeminiConfigured } from '@/lib/gemini';
import { transcribeAudio } from '@/lib/groq';
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { DEMO_SAMPLES } from '@/lib/mock-data';

export async function POST(request) {
  try {
    let transcript = '';
    let language = 'auto';

    const formData = await request.formData();

    const file = formData.get('audio');
    language = formData.get('language') || 'auto';

    if (file && typeof file !== 'string') {
      const audioFile = file;

      console.log("🎤 FILE:", audioFile.name, audioFile.type);

      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 🎤 STEP 1: TRANSCRIBE AUDIO
      try {
        transcript = await transcribeAudio(audioFile, language);
        console.log("📝 TRANSCRIPT:", transcript);
      } catch (err) {
        console.error("Transcription failed:", err);

        return NextResponse.json(
          { error: 'Audio transcription failed' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to generate transcript' },
        { status: 400 }
      );
    }

    let result;

    if (isGeminiConfigured()) {
      result = await analyzeAudioTranscript(transcript, language);
    } else {
      const demo = DEMO_SAMPLES[0];
      result = {
        transcript,
        ...demo.mockResult,
      };
    }

    let scanId = `scan-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServiceClient();

        const { data, error } = await supabase
          .from('scan_history')
          .insert({
            input_type: 'audio',
            transcript: result.transcript,
            detected_language: result.detectedLanguage || language,
            risk_level: result.riskLevel,
            confidence_score: result.confidenceScore,
            threat_scores: result.threatScores,
            highlighted_phrases: result.highlightedPhrases,
            explanation: result.explanation,
            similar_patterns: result.similarPatterns,
          })
          .select('id')
          .single();

        if (!error && data) {
          scanId = data.id;
        }
      } catch (err) {
        console.warn("Supabase save failed:", err);
      }
    }

    return NextResponse.json({
      id: scanId,
      ...result,
    });

  } catch (error) {
    console.error('analyze-audio error:', error);

    return NextResponse.json(
      { error: 'Audio analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}