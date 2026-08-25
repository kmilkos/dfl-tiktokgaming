export function cleanSpokenText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[pause[^\]]*\]/gi, '...')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function applyPhoneticOverrides(text: string, overrides: Record<string, string>): string {
  if (!overrides || Object.keys(overrides).length === 0) return text;
  let result = text;
  for (const [original, replacement] of Object.entries(overrides)) {
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, replacement);
  }
  return result;
}
