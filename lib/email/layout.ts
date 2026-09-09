export type EmailBody = {
  preheader: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
  footer: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderEmail(body: EmailBody): { html: string; text: string } {
  const paragraphs = body.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#2b2926">${escapeHtml(paragraph)}</p>`,
    )
    .join('');

  const cta = body.cta
    ? `<p style="margin:0 0 24px"><a href="${escapeHtml(body.cta.url)}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#1c1a17;color:#faf9f7;text-decoration:none;font-size:15px">${escapeHtml(body.cta.label)}</a></p>
       <p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:#6f6a63">${escapeHtml(body.cta.url)}</p>`
    : '';

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px;background:#faf9f7;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<span style="display:none;font-size:0;line-height:0;opacity:0">${escapeHtml(body.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e3dd;border-radius:14px">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 20px;font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#1c1a17">AIm</p>
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;font-weight:600;color:#1c1a17">${escapeHtml(body.heading)}</h1>
${paragraphs}${cta}
</td></tr>
<tr><td style="padding:0 28px 28px">
<p style="margin:0;padding-top:16px;border-top:1px solid #e7e3dd;font-size:12.5px;line-height:1.5;color:#8b857c">${escapeHtml(body.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [
    'AIm',
    '',
    body.heading,
    '',
    ...body.paragraphs,
    ...(body.cta ? ['', body.cta.label, body.cta.url] : []),
    '',
    body.footer,
  ].join('\n');

  return { html, text };
}
