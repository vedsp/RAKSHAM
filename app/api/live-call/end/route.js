import { NextResponse } from 'next/server';
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    let summary = { sessionId, status: 'ended', chunks: [] };

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();

      await supabase
        .from('live_call_sessions')
        .update({ status: 'ended' })
        .eq('session_id', sessionId);

      const { data: chunks } = await supabase
        .from('call_chunks')
        .select('*')
        .eq('session_id', sessionId)
        .order('chunk_number', { ascending: true });

      summary.chunks = chunks || [];
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('live-call/end error:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
