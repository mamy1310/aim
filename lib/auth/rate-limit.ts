export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// ponytail: compteur en memoire, remis a zero a chaque demarrage d'instance.
// Suffisant pour freiner le bourrinage sur une instance ; passer sur une table
// ou un store partage le jour ou le trafic justifie plusieurs instances.
const attempts = new Map<string, number[]>();

export function recordAttempt(key: string, now = Date.now()): void {
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < LOGIN_WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
}

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < LOGIN_WINDOW_MS);
  if (recent.length === 0) attempts.delete(key);
  else attempts.set(key, recent);
  return recent.length >= LOGIN_MAX_ATTEMPTS;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
