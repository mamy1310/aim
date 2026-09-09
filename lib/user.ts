export function displayName(user: { name: string | null; email: string }): string {
  const first = user.name?.trim().split(/\s+/)[0];
  return first || user.email.split('@')[0];
}

export function formatDateLine(date: Date, locale = 'fr-FR'): string {
  const day = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
  return `${day} · ${time}`;
}
