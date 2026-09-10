// A failing server action rejects.
export async function runAction<T extends { ok: boolean }>(
  call: () => Promise<T>,
): Promise<T | { ok: false; error: 'unexpected' }> {
  try {
    return await call();
  } catch {
    return { ok: false, error: 'unexpected' };
  }
}

export async function postJson<T>(
  url: string,
  body?: unknown,
): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
    if (!response.ok) return { ok: false };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false };
  }
}
