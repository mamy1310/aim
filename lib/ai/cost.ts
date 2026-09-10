// Dollars per million tokens. Update by hand.
const PRICING: Record<string, { cacheMiss: number; cacheHit: number; output: number }> = {
  'deepseek-v4-flash': { cacheMiss: 0.14, cacheHit: 0.0028, output: 0.28 },
};

const FALLBACK = PRICING['deepseek-v4-flash'];

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens: number,
  model: string,
): number {
  const pricing = PRICING[model] ?? FALLBACK;
  const missTokens = Math.max(inputTokens - cachedInputTokens, 0);

  const usd =
    (missTokens * pricing.cacheMiss +
      cachedInputTokens * pricing.cacheHit +
      outputTokens * pricing.output) /
    1_000_000;

  return Math.round(usd * 1_000_000) / 1_000_000;
}
