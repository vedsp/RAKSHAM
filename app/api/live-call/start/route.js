import { NextResponse } from 'next/server';
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { isGeminiConfigured } from '@/lib/gemini';
import { isGroqConfigured } from '@/lib/groq';

export async function POST(request) {
  try {
    const { language, sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();
      await supabase.from('live_call_sessions').insert({
        session_id: sessionId,
        status: 'active',
        language: language || 'auto',
      });
    }

    return NextResponse.json({ 
      sessionId, 
      isDemo: !isGeminiConfigured() || !isGroqConfigured() 
    });
  } catch (error) {
    console.error('live-call/start error:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
