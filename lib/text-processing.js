/**
 * 🛡️ PhishShield Text Processing Utility
 * Handles normalization, de-obfuscation, and indicator extraction.
 */

/**
 * Normalizes text to handle basic obfuscation like zero-width spaces and homoglyphs.
 */
export function normalizeText(text) {
  if (!text) return "";

  // 1. Remove zero-width spaces and other invisible characters
  // \u200B (ZWS), \u200C (ZWNJ), \u200D (ZWJ), \uFEFF (BOM)
  let normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 2. Standardize common homoglyphs (basic set for demo/common usage)
  const homoglyphs = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'і': 'i',
    'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K',
    'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X',
  };

  normalized = normalized.split('').map(char => homoglyphs[char] || char).join('');

  return normalized.trim();
}

/**
 * Extracts potential indicators (URLs, Emails, Phones) from text.
 */
export function extractIndicators(text) {
  // Regex patterns
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

  return {
    urls: Array.from(new Set(text.match(urlPattern) || [])),
    emails: Array.from(new Set(text.match(emailPattern) || [])),
    phones: Array.from(new Set(text.match(phonePattern) || [])),
  };
}

/**
 * Main entry point for text pre-processing.
 */
export function processIncomingText(text) {
  const normalized = normalizeText(text);
  const indicators = extractIndicators(normalized);

  return {
    originalText: text,
    normalizedText: normalized,
    indicators,
  };
}
