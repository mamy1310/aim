import { describe, expect, it } from 'vitest';

import { renderEmail } from '@/lib/email/layout';

const body = {
  preheader: 'Un apercu',
  heading: 'Un titre',
  paragraphs: ['Premier paragraphe.', 'Second paragraphe.'],
  footer: 'Un pied de message.',
};

describe('renderEmail', () => {
  it('produit une version HTML et une version texte', () => {
    const { html, text } = renderEmail(body);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Premier paragraphe.');
    expect(text).toContain('Un titre');
    expect(text).toContain('Second paragraphe.');
    expect(text).not.toContain('<');
  });

  it('echappe le HTML present dans le contenu', () => {
    const { html } = renderEmail({
      ...body,
      paragraphs: ['<script>alert("x")</script>'],
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('ajoute le bouton et l URL en clair quand un appel a l action est fourni', () => {
    const { html, text } = renderEmail({
      ...body,
      cta: { label: 'Confirmer', url: 'https://aim.test/confirmer' },
    });

    expect(html).toContain('https://aim.test/confirmer');
    expect(html).toContain('Confirmer');
    expect(text).toContain('https://aim.test/confirmer');
  });

  it('omet le bouton en son absence', () => {
    expect(renderEmail(body).html).not.toContain('<a href');
  });
});
