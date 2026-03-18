export function scoreToRisk(score) {
  if (score >= 90) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 36) return 'MEDIUM';
  return 'LOW';
}

export function riskColor(risk) {
  switch (risk) {
    case 'SAFE':
    case 'LOW': return '#22c55e';
    case 'SUSPICIOUS':
    case 'MEDIUM': return '#f59e0b';
    case 'HIGH_RISK':
    case 'HIGH': return '#ef4444';
    case 'CRITICAL': return '#9f1239'; // Deep red
    default: return '#94a3b8';
  }
}

export function riskBg(risk) {
  switch (risk) {
    case 'SAFE':
    case 'LOW': return 'bg-green-500';
    case 'SUSPICIOUS':
    case 'MEDIUM': return 'bg-amber-500';
    case 'HIGH_RISK':
    case 'HIGH': return 'bg-red-500';
    case 'CRITICAL': return 'bg-rose-700';
    default: return 'bg-slate-500';
  }
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function detectScript(text) {
  const devanagari = /[\u0900-\u097F]/;
  const tamil = /[\u0B80-\u0BFF]/;
  if (devanagari.test(text) && tamil.test(text)) return 'Mixed';
  if (tamil.test(text)) return 'Tamil';
  if (devanagari.test(text)) return 'Devanagari';
  return 'Latin';
}

export function detectLanguageFromScript(text) {
  const script = detectScript(text);
  if (script === 'Tamil') return 'Tamil';
  if (script === 'Devanagari') return 'Hindi';
  if (script === 'Latin') return 'English';
  return 'Mixed';
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function truncateText(text, maxLength = 80) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function charCount(text) {
  return [...text].length;
}

export function getMimeTypeLabel(mimeType) {
  const map = {
    'audio/mpeg': 'MP3',
    'audio/mp3': 'MP3',
    'audio/wav': 'WAV',
    'audio/ogg': 'OGG',
    'audio/x-m4a': 'M4A',
    'audio/mp4': 'M4A',
    'audio/webm': 'WEBM',
  };
  return map[mimeType] || 'AUDIO';
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
