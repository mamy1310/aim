import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { ArrowUpRightIcon, CheckIcon, PlusIcon } from '../_components/icons';
import { container, ghostSx, serif } from '../_components/styles';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.meta');
  return { title: t('title'), description: t('description') };
}

const wrap = container;

export default async function LandingPage() {
  const t = await getTranslations('landing');
  const tc = await getTranslations('common');

  const checks = t.raw('hero.checks') as string[];
  const steps = t.raw('how.steps') as {
    num: string;
    title: string;
    body: string;
  }[];
  const bullets = t.raw('newsletter.bullets') as string[];
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  return (
    <Box component="main">
      <Box
        component="section"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'dividerSoft',
          pt: { xs: 7, md: 12 },
          pb: { xs: 8, md: 14 },
        }}
      >
        <Box sx={wrap}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              pl: 1,
              pr: 1.25,
              py: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '999px',
              bgcolor: 'background.paper',
              fontSize: '12px',
              color: 'text.secondary',
              mb: 3,
            }}
          >
            <Box
              component="span"
              aria-hidden
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                boxShadow: '0 0 0 3px var(--mui-palette-secondary-light)',
              }}
            />
            {t('hero.eyebrow')}
          </Box>

          <Typography
            component="h1"
            sx={{
              ...serif,
              fontWeight: 500,
              fontSize: 'clamp(2.125rem, 8.5vw, 4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              mb: 2.5,
              maxWidth: { lg: '16ch' },
              textWrap: 'balance',
            }}
          >
            {t('hero.titleLead')}
            <Box component="em" sx={{ fontStyle: 'italic' }}>
              {t('hero.titleEm')}
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '17px', md: '19px' },
              lineHeight: 1.6,
              color: 'text.secondary',
              maxWidth: '56ch',
              mb: 3.5,
            }}
          >
            {t('hero.lede')}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 4 }}>
            <Button href="/register" variant="contained">
              {t('hero.ctaPrimary')}
            </Button>
            <Button href="/cours" variant="outlined" sx={ghostSx}>
              {t('hero.ctaSecondary')}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px 28px',
              fontSize: '13px',
              color: 'secondary.main',
            }}
          >
            {checks.map((c) => (
              <Box
                key={c}
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
              >
                <Box component="span" sx={{ display: 'inline-flex', fontSize: '14px' }}>
                  <CheckIcon />
                </Box>
                {c}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        id="etapes"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'dividerSoft',
          py: { xs: 8, md: 12 },
        }}
      >
        <Box sx={wrap}>
          <Box sx={{ display: 'grid', gap: 1, mb: 4.5, maxWidth: '60ch' }}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              {t('how.kicker')}
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(1.625rem, 5vw, 2.25rem)', lineHeight: 1.15 }}
            >
              {t('how.title')}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '16px' }}>
              {t('how.subtitle')}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: { xs: '14px', md: '16px' },
              gridTemplateColumns: { md: 'repeat(3, 1fr)' },
            }}
          >
            {steps.map((s) => (
              <Box
                component="article"
                key={s.num}
                sx={{
                  p: { xs: '24px 22px 26px', md: '28px 26px 30px' },
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  borderRadius: '16px',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    ...serif,
                    display: 'block',
                    fontSize: '2.25rem',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: 'text.disabled',
                    lineHeight: 1,
                    mb: 1.75,
                  }}
                >
                  {s.num}
                </Box>
                <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
                  {s.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: '15px',
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        id="newsletter"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'dividerSoft',
          py: { xs: 8, md: 12 },
        }}
      >
        <Box sx={wrap}>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 4, md: 7, lg: 10 },
              gridTemplateColumns: { md: '1fr 1.05fr' },
              alignItems: 'start',
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                {t('newsletter.kicker')}
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mt: 1,
                  mb: 2,
                  fontSize: 'clamp(1.625rem, 5vw, 2.25rem)',
                }}
              >
                {t('newsletter.title')}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '16px', mb: 1.75 }}>
                {t('newsletter.lede')}
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 0.75,
                  mt: '6px',
                  mb: '22px',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    ...serif,
                    fontSize: '2.375rem',
                    fontWeight: 500,
                    color: 'text.primary',
                    lineHeight: 1,
                  }}
                >
                  {t('newsletter.price')}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '14px' }}>
                  {t('newsletter.per')}
                </Box>
              </Box>

              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  p: 0,
                  m: '0 0 24px',
                  display: 'grid',
                  gap: 1.25,
                }}
              >
                {bullets.map((b) => (
                  <Box
                    component="li"
                    key={b}
                    sx={{
                      display: 'flex',
                      gap: 1.25,
                      alignItems: 'flex-start',
                      fontSize: '15px',
                      color: 'text.secondary',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: 'secondary.main',
                        mt: '5px',
                        flex: '0 0 14px',
                        display: 'inline-flex',
                        fontSize: '14px',
                      }}
                    >
                      <CheckIcon />
                    </Box>
                    {b}
                  </Box>
                ))}
              </Box>

              <Button href="/newsletter" variant="contained">
                {t('newsletter.cta')}
              </Button>
            </Box>

            <Box
              component="figure"
              aria-label={t('newsletter.preview.label')}
              sx={{
                m: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                boxShadow: 2,
              }}
            >
              <Box
                sx={{
                  p: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'dividerSoft',
                  bgcolor: 'background.sunk',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    aria-hidden
                    sx={{
                      ...serif,
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {tc('appName').charAt(0)}
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        color: 'text.primary',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {t('newsletter.preview.from')}
                    </Box>
                    <Box sx={{ fontSize: '12px', color: 'text.disabled' }}>
                      {t('newsletter.preview.email')}
                    </Box>
                  </Box>
                </Box>
                <Box component="span" sx={{ fontSize: '12px', color: 'text.disabled' }}>
                  {t('newsletter.preview.date')}
                </Box>
              </Box>

              <Box sx={{ p: '22px 20px 24px' }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: 'text.disabled',
                    letterSpacing: '0.08em',
                    mb: 1.25,
                  }}
                >
                  {t('newsletter.preview.kicker')}
                </Typography>
                <Typography variant="h3" component="h3" sx={{ mb: 1.75, letterSpacing: '-0.01em' }}>
                  {t('newsletter.preview.title')}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14.5px',
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    mb: 2.25,
                  }}
                >
                  {t('newsletter.preview.summary')}
                </Typography>

                <Box
                  sx={{
                    borderLeft: '2px solid',
                    borderColor: 'secondary.main',
                    pl: 1.75,
                    py: 0.5,
                    mb: 2.25,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      display: 'block',
                      color: 'secondary.main',
                      letterSpacing: '0.08em',
                      fontWeight: 500,
                      mb: 0.75,
                    }}
                  >
                    {t('newsletter.preview.whyLabel')}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: 'text.primary',
                      lineHeight: 1.55,
                    }}
                  >
                    {t('newsletter.preview.why')}
                  </Typography>
                </Box>

                <Link
                  href="#"
                  underline="none"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '13px',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: '1px',
                    '&:hover': { borderColor: 'text.disabled' },
                  }}
                >
                  {t('newsletter.preview.source')}
                  <Box component="span" sx={{ display: 'inline-flex', fontSize: '12px' }}>
                    <ArrowUpRightIcon />
                  </Box>
                </Link>
              </Box>

              <Box
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'dividerSoft',
                  p: '12px 18px',
                  fontSize: '11.5px',
                  color: 'text.disabled',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'background.sunk',
                }}
              >
                <Box component="span">{t('newsletter.preview.footReason')}</Box>
                <Box component="span">{t('newsletter.preview.footUnsub')}</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        id="faq"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'dividerSoft',
          py: { xs: 8, md: 12 },
        }}
      >
        <Box sx={wrap}>
          <Box sx={{ display: 'grid', gap: 1, mb: 4.5, maxWidth: '60ch' }}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              {t('faq.kicker')}
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(1.625rem, 5vw, 2.25rem)' }}
            >
              {t('faq.title')}
            </Typography>
          </Box>

          <Box
            sx={{
              maxWidth: 760,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {faqItems.map((it, i) => (
              <Accordion
                key={it.q}
                defaultExpanded={i === 0}
                disableGutters
                square
                elevation={0}
                sx={{
                  bgcolor: 'transparent',
                  borderBottom: '1px solid',
                  borderColor: 'dividerSoft',
                  '&:last-of-type': { borderBottom: 'none' },
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        display: 'inline-flex',
                        color: 'text.disabled',
                        fontSize: '18px',
                      }}
                    >
                      <PlusIcon />
                    </Box>
                  }
                  sx={{
                    px: 0.5,
                    '& .MuiAccordionSummary-content': { my: '12px', mr: 2 },
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                      transform: 'rotate(45deg)',
                      color: 'text.primary',
                    },
                  }}
                >
                  <Typography variant="h4" component="span" sx={{ fontSize: '19px' }}>
                    {it.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0.5, pt: 0, pb: '18px' }}>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      maxWidth: '64ch',
                    }}
                  >
                    {it.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
