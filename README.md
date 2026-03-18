# PhishShield India 🛡️

> **Scam Detection in Your Language** — AI-powered phishing detection for Hindi, Marathi, Tamil, and English.

## Features

- **📝 Text Analysis** — Paste any SMS, WhatsApp, or email message for instant scam detection
- **🎤 Audio Upload** — Upload recorded calls for AI transcription + phishing analysis
- **📞 Live Call Analysis** — Real-time 30-second chunk analysis during ongoing calls
- **🌐 4 Languages** — Hindi, Marathi, Tamil, English with auto-detection
- **🚨 Instant Alerts** — Full-screen HIGH_RISK warning with vibration
- **📤 Easy Sharing** — Share results with family via WhatsApp
- **📱 PWA** — Install on Android/iOS home screen

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | Next.js 14 + Tailwind CSS | Free |
| AI/NLP | Google Gemini 1.5 Flash | Free |
| Audio STT | Gemini Multimodal | Free |
| Database | Supabase | Free |
| Hosting | Vercel | Free |

## Quick Start

```bash
# 1. Clone and install
cd phishshield
npm install

# 2. Copy env file
cp .env.local.example .env.local

# 3. Add your API keys to .env.local
# Get Gemini key: https://ai.google.dev
# Get Supabase keys: https://supabase.com

# 4. Run dev server
npm run dev
```

## Supabase Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
CREATE TABLE scan_history (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  input_type        TEXT NOT NULL CHECK (input_type IN ('text','audio','live_call')),
  original_text     TEXT,
  transcript        TEXT,
  detected_language TEXT,
  risk_level        TEXT NOT NULL CHECK (risk_level IN ('SAFE','SUSPICIOUS','HIGH_RISK')),
  confidence_score  INTEGER NOT NULL,
  threat_scores     JSONB,
  highlighted_phrases JSONB,
  explanation       JSONB,
  similar_patterns  JSONB,
  session_id        TEXT
);

CREATE TABLE live_call_sessions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  session_id   TEXT NOT NULL UNIQUE,
  language     TEXT NOT NULL,
  status       TEXT DEFAULT 'active' CHECK (status IN ('active','ended')),
  peak_risk    TEXT DEFAULT 'SAFE',
  chunk_count  INTEGER DEFAULT 0
);

CREATE TABLE call_chunks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  session_id    TEXT NOT NULL,
  chunk_number  INTEGER NOT NULL,
  transcript    TEXT,
  risk_level    TEXT,
  confidence_score INTEGER,
  threat_scores JSONB,
  highlighted_phrases JSONB,
  duration_seconds INTEGER DEFAULT 30
);

-- Enable RLS
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_chunks ENABLE ROW LEVEL SECURITY;

-- Allow anon access
CREATE POLICY "Allow anon access" ON scan_history FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access" ON live_call_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access" ON call_chunks FOR ALL TO anon USING (true) WITH CHECK (true);
```

## Demo Mode

The app works **without API keys** in demo mode with 4 pre-built scam samples in Hindi, Marathi, Tamil, and Hinglish.

## Emergency

- **Cyber Crime Helpline**: [1930](tel:1930)
- **Online Report**: [cybercrime.gov.in](https://cybercrime.gov.in)
