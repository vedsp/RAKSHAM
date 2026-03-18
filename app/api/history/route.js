import { NextResponse } from 'next/server';
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ scans: [] });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('scan_history')
      .select('id, created_at, input_type, detected_language, risk_level, confidence_score')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('history query error:', error);
      return NextResponse.json({ scans: [] });
    }

    return NextResponse.json({ scans: data || [] });
  } catch (error) {
    console.error('history error:', error);
    return NextResponse.json({ scans: [] });
  }
}
