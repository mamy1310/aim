import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { currentUser } from '../_data';
import Illustration, { type IllustrationVariant } from '../../_components/Illustration';
import { ArrowRightIcon, CheckIcon, ChevronRightIcon } from '../../_components/icons';
import { levelKey } from '@/lib/levels';

import { container, ghostSx, mono, serif } from '../../_components/styles';

const courses: {
  slug: string;
  title: string;
  level: number;
  pct: number;
  nextNum: number;
  nextTitle: string;
  ill: IllustrationVariant;
}[] = [
  {
    slug: 'comprendre-les-modeles-de-langage',
    title: 'Comprendre les modèles de langage',
    level: 1,
    pct: 62,
    nextNum: 4,
    nextTitle: "L'entraînement, en clair",
    ill: 'arc',
  },
];

const badges: {
  token: string;
  title: string;
  date: string;
  ill: IllustrationVariant;
}[] = [
  { token: 'a1b2c3', title: 'Premiers pas avec un assistant', date: 'Mars 2026', ill: 'circle' },
  { token: 'd4e5f6', title: 'Le vocabulaire essentiel', date: 'Mars 2026', ill: 'dots' },
  { token: 'g7h8i9', title: 'Écrire de bons prompts', date: 'Avril 2026', ill: 'split' },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.meta');
  return { title: t('title'), description: t('description') };
}

const wrap = container;

const blockSx = {
  borderTop: '1px solid',
  borderColor: 'dividerSoft',
  py: { xs: 4.5, md: 6 },
} as const;

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tc = await getTranslations('common');

  const course = courses[0];
  const actionItems = [
    {
      href: `/cours/${course.slug}`,
      title: t('actions.items.resume.title', { course: course.title }),
      hint: t('actions.items.resume.hint', { num: course.nextNum, min: 25 }),
    },
    {
      href: `/cours/${course.slug}/quiz`,
      title: t('actions.items.quiz.title'),
      hint: t('actions.items.quiz.hint'),
    },
    {
      href: '/newsletter',
      title: t('actions.items.newsletter.title'),
      hint: t('actions.items.newsletter.hint'),
    },
  ];

  return (
    <Box component="main">
      <Box component="section" sx={{ pt: { xs: 8, md: 11 }, pb: { xs: 3.5, md: 4.5 } }}>
        <Box sx={wrap}>
          <Box
            component="span"
            sx={{
              ...mono,
              display: 'block',
              mb: 1.75,
              fontSize: '0.78rem',
              letterSpacing: '0.02em',
              color: 'text.disabled',
            }}
          >
            {currentUser.dateLine}
          </Box>
          <Typography
            component="h1"
            sx={{
              ...serif,
              fontWeight: 500,
              fontSize: 'clamp(2rem, 5.5vw, 2.875rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            {t.rich('greeting.hello', {
              name: currentUser.name,
              em: (chunks) => (
                <Box
                  component="em"
                  sx={{ fontStyle: 'italic', fontWeight: 500, color: 'text.secondary' }}
                >
                  {chunks}
                </Box>
              ),
            })}
          </Typography>
          <Typography sx={{ fontSize: '17px', color: 'text.secondary', maxWidth: '52ch' }}>
            {t('greeting.orientation')}
          </Typography>
        </Box>
      </Box>

      <Box component="section" id="cours-en-cours" sx={blockSx}>
        <Box sx={wrap}>
          <Box
            component="header"
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)', lineHeight: 1.15 }}
            >
              {t('resume.title')}
            </Typography>
            <Link
              href="/cours"
              underline="none"
              sx={{
                fontSize: '13.5px',
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
              }}
            >
              {t('resume.seeAll')} →
            </Link>
          </Box>

          <Box sx={{ display: 'grid', gap: '12px' }}>
            {courses.map((crs) => (
              <Link
                key={crs.slug}
                href={`/cours/${crs.slug}`}
                underline="none"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto',
                  gap: '18px',
                  alignItems: 'stretch',
                  p: '14px 18px 14px 14px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '16px',
                  color: 'text.primary',
                  transition: 'border-color .15s, transform .12s, box-shadow .15s',
                  '&:hover': {
                    borderColor: 'text.disabled',
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                  '&:hover .dash-arrow': {
                    borderColor: 'text.disabled',
                    color: 'text.primary',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'dividerSoft',
                  }}
                >
                  <Illustration variant={crs.ill} />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: 0,
                    gap: 0.75,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      ...mono,
                      fontSize: '10.5px',
                      letterSpacing: '0.06em',
                      color: 'text.disabled',
                    }}
                  >
                    {tc(levelKey(crs.level))}
                  </Box>
                  <Typography
                    component="h3"
                    sx={{ ...serif, fontSize: '19px', fontWeight: 500, lineHeight: 1.2 }}
                  >
                    {crs.title}
                  </Typography>
                  <Box
                    sx={{
                      fontSize: '13.5px',
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t.rich('resume.next', {
                      num: crs.nextNum,
                      title: crs.nextTitle,
                      b: (chunks) => (
                        <Box component="strong" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {chunks}
                        </Box>
                      ),
                    })}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 0.5 }}>
                    <Box
                      sx={{
                        flex: 1,
                        height: '3px',
                        maxWidth: 220,
                        bgcolor: 'dividerSoft',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${crs.pct}%`,
                          bgcolor: 'text.primary',
                          borderRadius: '999px',
                        }}
                      />
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        ...mono,
                        fontSize: '11px',
                        letterSpacing: '0.04em',
                        color: 'secondary.main',
                      }}
                    >
                      {t('resume.progress', { pct: crs.pct })}
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    alignSelf: 'center',
                    gap: 1,
                    fontSize: '14px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    {t('resume.cta')}
                  </Box>
                  <Box
                    className="dash-arrow"
                    aria-hidden
                    sx={{
                      width: 28,
                      height: 28,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontSize: '14px',
                      transition: 'border-color .15s, color .15s, transform .15s',
                    }}
                  >
                    <ArrowRightIcon />
                  </Box>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="section" id="mes-badges" sx={blockSx}>
        <Box sx={wrap}>
          <Box
            component="header"
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)' }}
            >
              {t('badges.title')}
            </Typography>
            <Box
              component="span"
              sx={{ ...mono, fontSize: '11.5px', letterSpacing: '0.04em', color: 'text.disabled' }}
            >
              {t('badges.count', { count: badges.length })}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
            }}
          >
            {badges.map((b) => (
              <Link
                key={b.token}
                href={`/badge/${b.token}`}
                underline="none"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.25,
                  textAlign: 'center',
                  color: 'text.primary',
                  '&:hover .dash-seal': {
                    borderColor: 'text.disabled',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box
                  className="dash-seal"
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'border-color .15s, transform .15s, box-shadow .15s',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: '14%',
                      borderRadius: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <Illustration variant={b.ill} />
                  </Box>
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      width: 16,
                      height: 16,
                      borderRadius: '999px',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                    }}
                  >
                    <CheckIcon strokeWidth={3.5} />
                  </Box>
                </Box>
                <Box
                  component="span"
                  sx={{
                    ...serif,
                    fontSize: '14px',
                    lineHeight: 1.25,
                    letterSpacing: '-0.005em',
                    color: 'text.primary',
                    textWrap: 'balance',
                  }}
                >
                  {b.title}
                </Box>
                <Box
                  component="span"
                  sx={{
                    ...mono,
                    fontSize: '10.5px',
                    letterSpacing: '0.05em',
                    color: 'text.disabled',
                  }}
                >
                  {b.date}
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="section" id="newsletter" sx={blockSx}>
        <Box sx={wrap}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)', mb: 2.5 }}
          >
            {t('newsletter.title')}
          </Typography>

          <Box
            component="article"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
              gap: { xs: 2.25, sm: 3.5 },
              alignItems: { sm: 'center' },
              p: '22px 22px 24px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
            }}
          >
            <Box>
              <Box
                component="span"
                sx={{
                  ...mono,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  color: 'text.secondary',
                  mb: 1.25,
                }}
              >
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '999px',
                    bgcolor: 'text.disabled',
                    boxShadow: '0 0 0 3px var(--mui-palette-dividerSoft)',
                  }}
                />
                {t('newsletter.status')}
              </Box>
              <Typography
                component="h3"
                sx={{
                  ...serif,
                  fontSize: '22px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  mb: 0.75,
                }}
              >
                {t('newsletter.headline')}
              </Typography>
              <Typography sx={{ fontSize: '14.5px', color: 'text.secondary', maxWidth: '56ch' }}>
                {t('newsletter.body')}
              </Typography>
              <Box
                sx={{
                  mt: 1.25,
                  fontSize: '13px',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                  flexWrap: 'wrap',
                }}
              >
                <Box component="span">{t('newsletter.price')}</Box>
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  ·
                </Box>
                <Box component="span">{t('newsletter.detail')}</Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
              <Button href="/newsletter" variant="contained" size="small">
                {t('newsletter.subscribe')}
              </Button>
              <Button href="/newsletter" variant="outlined" size="small" sx={ghostSx}>
                {t('newsletter.preview')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box component="section" id="prochaines-actions" sx={blockSx}>
        <Box sx={wrap}>
          <Box
            component="header"
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)' }}
            >
              {t('actions.title')}
            </Typography>
            <Box
              component="span"
              sx={{ ...mono, fontSize: '11.5px', letterSpacing: '0.04em', color: 'text.disabled' }}
            >
              {t('actions.subtitle')}
            </Box>
          </Box>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            {actionItems.map((a, i) => (
              <Link
                key={a.title}
                href={a.href}
                underline="none"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '26px 1fr 24px',
                  gap: 1.75,
                  alignItems: 'center',
                  p: '16px 18px',
                  color: 'text.primary',
                  borderBottom: '1px solid',
                  borderColor: 'dividerSoft',
                  '&:last-of-type': { borderBottom: 'none' },
                  transition: 'background-color .15s',
                  '&:hover': { bgcolor: 'background.sunk' },
                  '&:hover .dash-chev': { color: 'text.primary', transform: 'translateX(2px)' },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    ...mono,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    color: 'text.disabled',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </Box>
                <Box sx={{ display: 'grid', gap: '2px', minWidth: 0 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: '15px', fontWeight: 500, color: 'text.primary' }}
                  >
                    {a.title}
                  </Box>
                  <Box component="span" sx={{ fontSize: '13px', color: 'text.secondary' }}>
                    {a.hint}
                  </Box>
                </Box>
                <Box
                  className="dash-chev"
                  aria-hidden
                  sx={{
                    display: 'inline-flex',
                    color: 'text.disabled',
                    fontSize: '16px',
                    transition: 'color .15s, transform .15s',
                  }}
                >
                  <ChevronRightIcon />
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
