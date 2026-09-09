import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { container, mono, serif } from '../../_components/styles';

type Section = { heading: string; body: string[] };

export async function legalMetadata(page: string) {
  const t = await getTranslations(`legal.${page}` as 'legal.cgv');
  return { title: t('title'), description: t('description') };
}

export default async function LegalPage({ page }: { page: string }) {
  const t = await getTranslations(`legal.${page}` as 'legal.cgv');
  const tl = await getTranslations('legal');
  const sections = t.raw('sections') as Section[];

  return (
    <Box component="main" sx={{ ...container, maxWidth: 760, py: { xs: 7, md: 11 } }}>
      <Typography
        component="h1"
        sx={{
          ...serif,
          fontWeight: 500,
          fontSize: 'clamp(2rem, 5vw, 2.625rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          mb: 1.5,
        }}
      >
        {t('title')}
      </Typography>
      <Box
        sx={{ ...mono, fontSize: '11px', letterSpacing: '0.06em', color: 'text.disabled', mb: 5 }}
      >
        {tl('updated')}
      </Box>

      <Box sx={{ display: 'grid', gap: 4 }}>
        {sections.map((section) => (
          <Box component="section" key={section.heading}>
            <Typography
              component="h2"
              sx={{ ...serif, fontSize: '21px', fontWeight: 500, mb: 1.5 }}
            >
              {section.heading}
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {section.body.map((paragraph) => (
                <Typography
                  key={paragraph}
                  sx={{ fontSize: '16px', lineHeight: 1.6, color: 'text.secondary' }}
                >
                  {paragraph}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
