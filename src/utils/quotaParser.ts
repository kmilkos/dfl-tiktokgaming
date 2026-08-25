export interface QuotaErrorInfo {
  isQuotaError: boolean;
  service: string;
  quotaType: 'rpm_rate_limit' | 'daily_quota' | 'unsupported_free_tier' | 'concurrency' | 'generic';
  retryAfterSeconds?: number;
  resetTimeIso?: string;
  headline: string;
  userMessage: string;
  actionAdvice: string;
  rawMessage: string;
}

export function parseQuotaError(err: any, serviceName = 'Gemini AI'): QuotaErrorInfo {
  const errorObj = err?.response?.data?.error || err?.response?.data || err;
  const rawMessage: string = errorObj?.message || err?.message || String(err || '');
  const status = err?.response?.status || err?.status || (rawMessage.includes('429') ? 429 : 500);

  const is429 = status === 429 || rawMessage.includes('429') || rawMessage.toLowerCase().includes('quota') || rawMessage.toLowerCase().includes('rate limit') || rawMessage.toLowerCase().includes('too many requests');

  if (!is429) {
    return {
      isQuotaError: false,
      service: serviceName,
      quotaType: 'generic',
      headline: 'Error Occurred',
      userMessage: rawMessage,
      actionAdvice: 'Please check your connection and configuration.',
      rawMessage,
    };
  }

  // 1. Check for "limit: 0" (Free Tier restriction on specific models like Gemini Image)
  if (rawMessage.includes('limit: 0') || rawMessage.includes('free_tier_input_token_count, limit: 0')) {
    return {
      isQuotaError: true,
      service: serviceName,
      quotaType: 'unsupported_free_tier',
      headline: 'Model Feature Unavailable on Free Tier (Limit: 0)',
      userMessage: `${serviceName} free tier API keys have a quota limit of 0 for direct image output generation.`,
      actionAdvice: 'The studio has automatically switched to the built-in Vector CAD Blueprint Engine (which works 100% free), or you can attach a billing-enabled Gemini API key in Settings.',
      rawMessage,
    };
  }

  // 2. Check for explicit retry wait time: "Please retry in 15.282807054s" or "Retry-After: 30"
  let retrySeconds: number | undefined = undefined;
  
  // Regex 1: "Please retry in X.XXs" or "retry in Xs"
  const retryMatch = rawMessage.match(/retry\s+in\s+([0-9.]+)\s*s/i) || rawMessage.match(/wait\s+([0-9.]+)\s*s/i);
  if (retryMatch && retryMatch[1]) {
    retrySeconds = Math.ceil(parseFloat(retryMatch[1]));
  }

  // Regex 2: HTTP Retry-After header
  const headerRetry = err?.response?.headers?.['retry-after'];
  if (headerRetry) {
    const parsed = parseInt(headerRetry, 10);
    if (!isNaN(parsed) && parsed > 0) {
      retrySeconds = parsed;
    }
  }

  // 3. Determine if it's a Per-Minute (RPM) vs Daily (RPD) limit
  if (retrySeconds && retrySeconds <= 120) {
    const resetDate = new Date(Date.now() + retrySeconds * 1000);
    return {
      isQuotaError: true,
      service: serviceName,
      quotaType: 'rpm_rate_limit',
      retryAfterSeconds: retrySeconds,
      resetTimeIso: resetDate.toISOString(),
      headline: `Rate Limit Reached (${serviceName})`,
      userMessage: `You've exceeded the requests-per-minute threshold. The temporary rate limit will lift in ${retrySeconds} seconds.`,
      actionAdvice: `Quota lifts automatically at ${resetDate.toLocaleTimeString()}. You can retry immediately when the countdown reaches 00:00.`,
      rawMessage,
    };
  }

  // 4. Daily Limit Check
  if (rawMessage.toLowerCase().includes('daily') || rawMessage.toLowerCase().includes('per_day') || rawMessage.includes('day')) {
    const now = new Date();
    const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const secondsToMidnight = Math.max(1, Math.floor((midnightUtc.getTime() - now.getTime()) / 1000));
    const hours = Math.floor(secondsToMidnight / 3600);
    const minutes = Math.floor((secondsToMidnight % 3600) / 60);

    return {
      isQuotaError: true,
      service: serviceName,
      quotaType: 'daily_quota',
      retryAfterSeconds: secondsToMidnight,
      resetTimeIso: midnightUtc.toISOString(),
      headline: `Daily Quota Exhausted (${serviceName})`,
      userMessage: `Daily free tier requests for ${serviceName} have reached their 24-hour limit.`,
      actionAdvice: `Daily quotas reset automatically at 00:00 UTC (in ~${hours}h ${minutes}m). You can also add another API key in Settings (⚙️).`,
      rawMessage,
    };
  }

  // 5. Default Rate Limit
  const defaultWait = 30;
  const resetDate = new Date(Date.now() + defaultWait * 1000);
  return {
    isQuotaError: true,
    service: serviceName,
    quotaType: 'rpm_rate_limit',
    retryAfterSeconds: defaultWait,
    resetTimeIso: resetDate.toISOString(),
    headline: `Rate Limit Hit (${serviceName})`,
    userMessage: `Request capacity temporarily exceeded.`,
    actionAdvice: `Please wait ~30 seconds before retrying.`,
    rawMessage,
  };
}
