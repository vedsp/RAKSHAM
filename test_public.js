/**
 * PhishShield India - Public API Test Script
 * 
 * This script is safe for GitHub. It uses environment variables 
 * to keep your personal keys secure.
 * 
 * TO RUN:
 * 1. Ensure you have a .env.local file (see .env.example)
 * 2. node --env-file=.env.local test_public.js
 */

async function test() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith("YOUR_")) {
    console.log("❌ Error: GEMINI_API_KEY not found.");
    console.log("Try: export GEMINI_API_KEY=your_key && node test_public.js");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  console.log("🚀 Calling Gemini API...");
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
      }),
    });

    const data = await res.json();
    console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("API call failed:", err.message);
  }
}

test();
