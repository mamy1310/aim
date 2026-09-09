import { z } from 'zod';

import { extractUrls, stripForeignUrls } from '@/lib/ai/sanitize';

export const SUMMARY_CATEGORIES = [
  'MODEL_RELEASE',
  'RESEARCH_PAPER',
  'PRODUCT',
  'SAFETY_ETHICS',
  'TOOLING',
  'OTHER',
] as const;

export const summarySchema = z.object({
  titleLocalized: z.string().trim().max(80),
  summary: z.string().trim(),
  whyItMatters: z.string().trim(),
  category: z.enum(SUMMARY_CATEGORIES),
  level: z.number().int().min(1),
  skipReason: z.string().trim().min(1).nullable().optional(),
});

export type SummaryPayload = z.infer<typeof summarySchema>;

// Tournures interdites, voir la section 10.5 de la specification.
export const BANNED_PHRASES = [
  'revolutionnaire',
  'game-changer',
  'game changer',
  'disrupte',
  'disrupter',
  'innovant',
  "a l'ere de l'ia",
  "dans le paysage de l'ia",
  'il est important de noter',
  'il convient de souligner',
  'ouvre de nouvelles perspectives',
  'marque un tournant',
  'non seulement',
  "l'avenir est prometteur",
  'leverager',
  'streamliner',
  'scaler',
  'implementer',
  'faire sens',
  'adresser un probleme',
  'supporter une fonctionnalite',
  'en termes de',
  'au niveau de',
];

const SENTENCE_START_VERBS = ['plonger dans', 'explorer', 'decouvrir'];

const INJECTION_MARKERS = [
  'as an ai',
  'en tant que modele',
  'ignore les instructions',
  'ignore previous instructions',
  'system prompt',
  'tes instructions',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function findBannedPhrases(text: string): string[] {
  const normalized = normalize(text);
  const found = BANNED_PHRASES.filter((phrase) => normalized.includes(phrase));

  for (const verb of SENTENCE_START_VERBS) {
    if (new RegExp(`(^|[.!?]\\s+)${verb}`).test(normalized)) found.push(verb);
  }
  if (/[—]/.test(text)) found.push('em-dash');
  if (/\p{Extended_Pictographic}/u.test(text)) found.push('emoji');

  return found;
}

export function findInjectionMarkers(text: string, allowedUrl: string): string[] {
  const normalized = normalize(text);
  const markers = INJECTION_MARKERS.filter((marker) => normalized.includes(marker));

  const foreignUrls = extractUrls(text).filter((url) => url !== allowedUrl);
  if (foreignUrls.length > 0) markers.push('foreign_url');

  return markers;
}

export type ValidationOutcome =
  | { ok: true; payload: SummaryPayload }
  | {
      ok: false;
      reason: 'invalid_json' | 'schema_invalid' | 'injection_suspected' | 'language_quality_low';
      detail: string;
    };

export const MAX_BANNED_PHRASES = 2;

export function validateSummary(raw: string, sourceUrl: string): ValidationOutcome {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_json', detail: 'la reponse n est pas du JSON' };
  }

  const parsed = summarySchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { ok: false, reason: 'schema_invalid', detail: parsed.error.issues[0]?.message ?? '' };
  }

  const payload = parsed.data;
  if (payload.skipReason) return { ok: true, payload };

  const text = [payload.titleLocalized, payload.summary, payload.whyItMatters].join(' ');

  const injection = findInjectionMarkers(text, sourceUrl);
  if (injection.length > 0) {
    return { ok: false, reason: 'injection_suspected', detail: injection.join(', ') };
  }

  const banned = findBannedPhrases(text);
  if (banned.length > MAX_BANNED_PHRASES) {
    return { ok: false, reason: 'language_quality_low', detail: banned.join(', ') };
  }

  return {
    ok: true,
    payload: {
      ...payload,
      titleLocalized: stripForeignUrls(payload.titleLocalized, sourceUrl),
      summary: stripForeignUrls(payload.summary, sourceUrl),
      whyItMatters: stripForeignUrls(payload.whyItMatters, sourceUrl),
    },
  };
}
