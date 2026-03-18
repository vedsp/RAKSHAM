const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export function isGeminiConfigured() {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY missing — fallback mode active');
  }
  return !!GEMINI_API_KEY;
}

// 🧠 Clean response
function cleanJSON(raw) {
  return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function parseGeminiResponse(data) {
  try {
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(cleanJSON(text));
  } catch {
    return { riskLevel: 'SUSPICIOUS', confidenceScore: 40 };
  }
}

// 🧠 TEXT ANALYSIS
export async function analyzeText(text, language = 'en', indicators = { urls: [], emails: [], phones: [] }) {
  try {
    const prompt = `You are a world-class Cybersecurity Analyst specializing in Phishing and Scam detection for PhishShield.
Analyze the following message and return a detailed JSON assessment.

[EXTRACTED INDICATORS]
URLs: ${indicators.urls.length > 0 ? indicators.urls.join(', ') : 'None'}
Emails: ${indicators.emails.length > 0 ? indicators.emails.join(', ') : 'None'}
Phones: ${indicators.phones.length > 0 ? indicators.phones.join(', ') : 'None'}

[CONTEXT & GUIDELINES]
1. Evaluate the message intent, tone, and specific indicators provided.
2. Look for urgency, authority impersonation, and requests for sensitive data (OTP, KYC, Bank details).
3. "SAFE" and "SUSPICIOUS" should be used carefully to avoid false positives for legitimate urgent messages.

[FEW-SHOT EXAMPLES]

Example 1: HIGH_RISK Phishing
Input: "Your account will be suspended in 2 hours. Click here to verify your KYC now: https://bank-verify-secure.com/login"
Output: {
  "riskLevel": "HIGH_RISK",
  "confidenceScore": 98,
  "detectedLanguage": "English",
  "threatScores": { "otpCredentialTheft": 90, "urgentPaymentDemand": 40, "authorityImpersonation": 95, "fearUrgencyTactics": 98, "personalInfoHarvesting": 95 },
  "highlightedPhrases": ["account will be suspended", "verify your KYC now"],
  "explanation": ["Urgent threat of account suspension combined with a suspicious link and request for KYC verification."],
  "similarPatterns": ["Banking Phishing", "Account Suspension Scam"]
}

Example 2: HIGH_RISK Phishing
Input: "CONGRATS! You won a ₹50,000 lottery. To claim, send your Aadhar and Bank details to reward@fast-payout.in"
Output: {
  "riskLevel": "HIGH_RISK",
  "confidenceScore": 95,
  "detectedLanguage": "English",
  "threatScores": { "otpCredentialTheft": 10, "urgentPaymentDemand": 10, "authorityImpersonation": 30, "fearUrgencyTactics": 20, "personalInfoHarvesting": 95 },
  "highlightedPhrases": ["won a ₹50,000 lottery", "send your Aadhar and Bank details"],
  "explanation": ["Classic lottery scam targeting personal identity (Aadhar) and banking information."],
  "similarPatterns": ["Advance Fee Fraud", "Lottery Scam"]
}

Example 3: SAFE Benign Urgent
Input: "Hey, are you home? I'm short on rent and really need that 2k you owe me by tonight if possible. Sorry to rush!"
Output: {
  "riskLevel": "SAFE",
  "confidenceScore": 85,
  "detectedLanguage": "English",
  "threatScores": { "otpCredentialTheft": 0, "urgentPaymentDemand": 10, "authorityImpersonation": 0, "fearUrgencyTactics": 10, "personalInfoHarvesting": 0 },
  "highlightedPhrases": [],
  "explanation": ["Personal request for debt repayment between known parties. No suspicious links or impersonation detected."],
  "similarPatterns": []
}

[CURRENT MESSAGE TO ANALYZE]
Language Hint: ${language}
Message: "${text}"

Return ONLY valid JSON:`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini Text Error:", err);
      return fallbackText(text);
    }

    return parseGeminiResponse(await res.json());
  } catch (err) {
    console.error("Text Crash:", err);
    return fallbackText(text);
  }
}

// 🎤 AUDIO (SIMPLIFIED → expects transcript)
export async function analyzeAudioTranscript(transcript, language = 'en') {
  try {
    const prompt = `Analyze this audio transcript for phishing/scam indicators. Language: ${language}.
Return ONLY valid JSON with this structure:
{
  "riskLevel": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "confidenceScore": number (0-100),
  "detectedLanguage": string,
  "threatScores": { "otpCredentialTheft": number, "urgentPaymentDemand": number, "authorityImpersonation": number, "fearUrgencyTactics": number, "personalInfoHarvesting": number },
  "highlightedPhrases": string[],
  "explanation": string[],
  "similarPatterns": string[]
}
Transcript: "${transcript}"`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini Audio Error:", err);
      return fallbackAudio(transcript);
    }

    return {
      transcript,
      ...parseGeminiResponse(await res.json()),
    };
  } catch (err) {
    console.error("Audio Crash:", err);
    return fallbackAudio(transcript);
  }
}

// 📞 LIVE CALL FRAGMENT ANALYSIS (Stateful)
export async function analyzeFragmentText(transcript, language = 'en', previousContext = '') {
  try {
    const prompt = `### SYSTEM INSTRUCTION
You are the PhishShield Real-Time Logic Engine. Your job is to analyze audio transcript fragments for phishing and social engineering.

### STATEFUL ANALYSIS MODE
You will be provided with the [CURRENT FRAGMENT] and optionally the [PREVIOUS CONTEXT] (recent conversation history). Analyze how the threat evolves from the context into the current fragment.

### CRITICAL: SILENCE DETECTION LOGIC
- If the transcript contains ANY words (even partial like "hello...", "yes"), set "silent": false.
- ONLY set "silent": true if the transcript is empty or contains ONLY non-verbal tags like "[Music]", "[Silence]".

### THREAT DETECTION RULES
1. Identify "Urgency" (Immediate action required).
2. Identify "Authority Impersonation" (Police, Bank, IRS, Support).
3. Identify "Sensitive Data Requests" (OTP, PIN, Password, SSN, CVV).
4. **Contextual Scaling**: If the context was "Suspicious" and the current fragment asks for data, escalate to "CRITICAL".

### RESPONSE FORMAT (STRICT JSON)
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "threatScores": { "urgency": 0-10, "impersonation": 0-10, "dataRequest": 0-10 },
  "alertMessage": "Brief, high-impact warning string",
  "detectedTactics": ["list", "of", "tactics"],
  "silent": boolean
}

${previousContext ? `### PREVIOUS CONTEXT:\n"${previousContext}"\n` : ''}

### CURRENT FRAGMENT TO ANALYZE:
"${transcript}"`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini Fragment Error:", err);
      return fallbackFragment(previousContext + " " + transcript);
    }

    const analysis = parseGeminiResponse(await res.json());

    return {
      transcript,
      ...analysis,
    };
  } catch (err) {
    console.error("Fragment Crash:", err);
    return fallbackFragment(transcript);
  }
}

// 🛟 FALLBACKS (HEURISTIC ENGINE)

function fallbackText(text) {
  const normalized = text.toLowerCase();
  
  // Heuristic Scoring Map (Multilingual: English, Hindi, Hinglish)
  const heuristics = [
    { terms: ['otp', 'one time password', 'ओटीपी', 'verification code'], score: 5 },
    { terms: ['kyc', 'verify', 'update account', 'suspend', 'block', 'केवाईसी', 'ब्लॉक', 'अपडेट'], score: 4 },
    { terms: ['bank', 'account', 'hdfc', 'sbi', 'icici', 'axis', 'बैंक', 'खाता'], score: 2 },
    { terms: ['urgent', 'immediately', 'within', 'hour', 'fast', 'तुरंत', 'जल्दी'], score: 3 },
    { terms: ['winner', 'lottery', 'prize', 'reward', 'gift', 'जीत', 'पुरस्कार'], score: 4 },
    { terms: ['http', 'www', '.com', '.in', '.net', '.buzz', 'link', 'लिंक'], score: 3 },
    { terms: ['press 1', 'dabaen', 'दबाएं', 'click', 'क्लिक'], score: 3 },
  ];

  let totalScore = 0;
  const matchedTerms = [];

  heuristics.forEach(({ terms, score }) => {
    terms.forEach(term => {
      if (normalized.includes(term)) {
        totalScore += score;
        matchedTerms.push(term);
      }
    });
  });

  const THRESHOLD = 5; // Slightly lower threshold for safer fallback
  const isCritical = totalScore >= 10;
  const isHighRisk = totalScore >= THRESHOLD && totalScore < 10;
  const isSuspicious = totalScore >= 3 && totalScore < THRESHOLD;

  return {
    riskLevel: isCritical ? 'CRITICAL' : (isHighRisk ? 'HIGH' : (isSuspicious ? 'MEDIUM' : 'LOW')),
    confidenceScore: Math.min(40 + (totalScore * 5), 85),
    detectedLanguage: "Offline Detection",
    threatScores: {
      urgency: matchedTerms.some(t => ['urgent', 'तुरंत', 'block', 'suspend'].includes(t)) ? 9 : 0,
      impersonation: matchedTerms.some(t => ['bank', 'banker', 'बैंक'].includes(t)) ? 8 : 0,
      dataRequest: matchedTerms.some(t => ['otp', 'kyc', 'pin', 'ओटीपी'].includes(t)) ? 10 : 0,
    },
    highlightedPhrases: matchedTerms,
    explanation: [`Heuristic analysis triggered score: ${totalScore}.`, `Detected indicators: ${matchedTerms.join(', ')}`],
    similarPatterns: isHighRisk ? ["Known multilingual phishing pattern"] : [],
  };
}

function fallbackAudio(transcript) {
  const result = fallbackText(transcript);
  return {
    transcript,
    ...result,
  };
}

function fallbackFragment(transcript) {
  const isSilent = !transcript || transcript.trim() === "" || /^\[.*\]$/.test(transcript.trim());
  
  if (isSilent) {
    return {
      transcript,
      riskLevel: 'LOW',
      threatScores: { urgency: 0, impersonation: 0, dataRequest: 0 },
      detectedTactics: [],
      alertMessage: null,
      silent: true
    };
  }

  const result = fallbackText(transcript);

  return {
    transcript,
    riskLevel: result.riskLevel,
    threatScores: result.threatScores,
    detectedTactics: result.highlightedPhrases,
    alertMessage: (result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') 
      ? "⚠️ Possible scam call detected via multilingual offline analysis" 
      : null,
    silent: false
  };
}