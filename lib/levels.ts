export const MAX_LEVEL = 3;

export function levelKey(level: number): string {
  return `levels.${Math.min(Math.max(Math.trunc(level), 1), MAX_LEVEL)}`;
}
