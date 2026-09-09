import sanitizeHtml from 'sanitize-html';

export const MAX_SOURCE_CHARS = 8000;

// Balises qui ressemblent a de la structure de prompt : on les retire avant
// d'inserer le contenu externe dans le message envoye au modele.
const CONTROL_TAGS =
  /<\/?\s*(system|instructions?|role|assistant|user|prompt|tool|function|source_content)[^>]*>/gi;

export function sanitizeSourceContent(raw: string | null | undefined): string {
  if (!raw) return '';

  const withoutHtml = sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} });

  return withoutHtml
    .replace(CONTROL_TAGS, ' ')
    .replace(/[<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SOURCE_CHARS);
}

export function extractUrls(text: string): string[] {
  return text.match(/https?:\/\/[^\s<>()"']+/gi) ?? [];
}

export function stripForeignUrls(text: string, allowedUrl: string): string {
  return extractUrls(text)
    .reduce((result, url) => (url === allowedUrl ? result : result.replace(url, '')), text)
    .replace(/\s+/g, ' ')
    .trim();
}
