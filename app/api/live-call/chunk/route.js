import { NextResponse } from 'next/server';
import { analyzeFragmentText, isGeminiConfigured } from '@/lib/gemini';
import { transcribeAudio, isGroqConfigured } from '@/lib/groq';
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_LIVE_CHUNKS } from '@/lib/mock-data';

const FRAGMENT_SECONDS = 10;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId');
    const chunkNumber = parseInt(formData.get('chunkNumber'), 10);
    const language = formData.get('language') || 'auto';

    console.log(`[API] Processing fragment ${formData.get('fragmentIndex')}. Gemini: ${isGeminiConfigured()}, Groq: ${isGroqConfigured()}`);

    const fragmentIndexRaw = formData.get('fragmentIndex');
    const fragmentIndex = fragmentIndexRaw ? parseInt(fragmentIndexRaw, 10) : chunkNumber;

    if (!sessionId || isNaN(chunkNumber)) {
      return NextResponse.json({ error: 'Missing sessionId or chunkNumber' }, { status: 400 });
    }

    const audioFile = formData.get('audio');
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    if (!isGeminiConfigured() && !isGroqConfigured()) {
      const mockScore = MOCK_LIVE_CHUNKS[(chunkNumber - 1) % MOCK_LIVE_CHUNKS.length];
      await new Promise(r => setTimeout(r, 600)); // Simulate processing delay
      return NextResponse.json(mockScore);
    }

    // If Groq is missing but Gemini is present, we can't transcribe → return graceful no-op
    if (!isGroqConfigured()) {
      console.warn(`[Fragment ${fragmentIndex}] Groq not configured — skipping transcription.`);
      return NextResponse.json({
        chunkNumber,
        fragmentIndex,
        transcript: '',
        riskLevel: 'LOW',
        threatScores: { urgency: 0, impersonation: 0, dataRequest: 0 },
        detectedTactics: [],
        highlightedPhrases: [],
        alertMessage: null,
        silent: true,
        noGroq: true,
      });
    }

    const mimeType = audioFile.type || 'audio/webm';
    console.log(`🎙️ [Fragment ${fragmentIndex}] Audio size: ${audioFile.size} bytes, Type: ${mimeType}`);

    let transcript = '';
    
    if (audioFile.size < 100) {
      console.warn(`[Fragment ${fragmentIndex}] Skipping transcription: Audio file too small (${audioFile.size} bytes)`);
    } else {
      try {
        transcript = await transcribeAudio(audioFile, language);
        if (!transcript) {
          console.warn(`📝 [Fragment ${fragmentIndex}] Whisper returned EMPTY transcript.`);
        } else {
          console.log(`📝 [Fragment ${fragmentIndex}] Whisper Transcript: "${transcript}"`);
        }
      } catch (e) {
        console.error(`❌ Whisper Transcription Failed for fragment ${fragmentIndex}:`, e.message || e);
      }
    }

    let previousContext = '';
    if (isSupabaseConfigured() && fragmentIndex > 1) {
      try {
        const supabase = createServiceClient();
        const { data: prevChunks, error: contextError } = await supabase
          .from('call_chunks')
          .select('transcript')
          .eq('session_id', sessionId)
          .order('chunk_number', { ascending: false })
          .limit(2);
        
        if (contextError) {
          console.error(`❌ Context Fetch Error for fragment ${fragmentIndex}:`, contextError.message);
        } else if (prevChunks) {
          previousContext = prevChunks.map(c => c.transcript).reverse().join(' ');
          console.log(`📚 [Fragment ${fragmentIndex}] Context retrieved (${prevChunks.length} chunks)`);
        }
      } catch (err) {
        console.warn('Failed to fetch previous context:', err.message || err);
      }
    }

    console.log(`🔍 [Fragment ${fragmentIndex}] Final Transcript for Gemini: "${transcript}"`);
    const analysis = await analyzeFragmentText(transcript, language, previousContext);

    const chunkResult = {
      chunkNumber,
      fragmentIndex,
      transcript: analysis.transcript || transcript || '',
      riskLevel: analysis.riskLevel,
      threatScores: analysis.threatScores,
      detectedTactics: analysis.detectedTactics || [],
      // Normalise to a consistent shape for the frontend (plain strings → string items)
      highlightedPhrases: (analysis.detectedTactics || []).map((t) =>
        typeof t === 'string' ? t : t
      ),
      alertMessage: analysis.alertMessage,
      silent: analysis.silent,
    };

    console.log(`📦 [Fragment ${fragmentIndex}] Analysis complete. Risk: ${chunkResult.riskLevel}, Silent: ${chunkResult.silent}`);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServiceClient();

        const { error: insertError } = await supabase.from('call_chunks').insert({
          session_id: sessionId,
          chunk_number: chunkNumber,
          transcript: chunkResult.transcript,
          risk_level: chunkResult.riskLevel,
          threat_scores: chunkResult.threatScores,
          highlighted_phrases: chunkResult.detectedTactics, 
          duration_seconds: FRAGMENT_SECONDS,
        });

        if (insertError) {
          console.error(`❌ Supabase Insert Error (Fragment ${fragmentIndex}):`, insertError.message);
        } else {
          console.log(`✅ Fragment ${fragmentIndex} saved to Supabase.`);
        }

        const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
        
        const { data: allChunks } = await supabase
          .from('call_chunks')
          .select('risk_level, threat_scores')
          .eq('session_id', sessionId);

        let sessionPeakRisk = 'LOW';
        let mediumCount = 0;
        let highDataRequest = false;

        if (allChunks) {
          allChunks.forEach(c => {
            const risk = String(c.risk_level);
            if (riskOrder[risk] > riskOrder[sessionPeakRisk]) {
              sessionPeakRisk = risk;
            }
            
            if (risk === 'MEDIUM') mediumCount++;
            if (c.threat_scores?.dataRequest >= 8) highDataRequest = true;
          });

          if (mediumCount >= 2 && riskOrder[sessionPeakRisk] < riskOrder['HIGH']) {
            sessionPeakRisk = 'HIGH';
          }

          if (highDataRequest && sessionPeakRisk === 'HIGH') {
            sessionPeakRisk = 'CRITICAL';
          }
        }

        await supabase
          .from('live_call_sessions')
          .update({
            peak_risk: sessionPeakRisk,
            chunk_count: fragmentIndex,
          })
          .eq('session_id', sessionId);
      } catch {
        // Continue without saving — don't block the response
      }
    }

    return NextResponse.json(chunkResult);
  } catch (error) {
    console.error('live-call/chunk error:', error);
    return NextResponse.json({ error: 'Chunk analysis failed' }, { status: 500 });
  }
}
