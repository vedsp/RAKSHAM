import { NextResponse } from 'next/server';
import { analyzeText, isGeminiConfigured } from '@/lib/gemini';
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { DEMO_SAMPLES } from '@/lib/mock-data';
import { processIncomingText } from '@/lib/text-processing';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, language = 'auto' } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const processed = processIncomingText(text);

    let result;

    if (isGeminiConfigured()) {
      result = await analyzeText(processed.normalizedText, language, processed.indicators);
    } else {
      const demo = DEMO_SAMPLES.find(
        (d) => d.text.slice(0, 30) === text.slice(0, 30)
      );
      if (demo) {
        result = { ...demo.mockResult };
      } else {
        result = {
          riskLevel: 'SUSPICIOUS',
          confidenceScore: 55,
          detectedLanguage: language === 'auto' ? 'Mixed' : language,
          threatScores: {
            otpCredentialTheft: 30,
            urgentPaymentDemand: 40,
            authorityImpersonation: 35,
            fearUrgencyTactics: 50,
            personalInfoHarvesting: 25,
          },
          highlightedPhrases: [],
          explanation: [
            'Analysis performed in demo mode',
            'Connect Gemini API key for real analysis',
            'This is a placeholder result',
          ],
          similarPatterns: [],
        };
      }
    }

    let scanId = `scan-${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from('scan_history')
          .insert({
            input_type: 'text',
            original_text: text,
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
      } catch {
        // Continue without saving
      }
    }

    return NextResponse.json({
      id: scanId,
      ...result,
    });
  } catch (error) {
    console.error('analyze-text error:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
