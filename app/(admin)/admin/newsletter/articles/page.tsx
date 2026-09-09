import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';
import type { ArticleStatus } from '@/lib/generated/prisma/enums';

import RequeueButton from '../../../_components/RequeueButton';
import { mono, serif } from '../../../../_components/styles';

const STATUSES: ArticleStatus[] = ['PENDING', 'SUMMARIZED', 'SKIPPED', 'FAILED'];

type Props = { searchParams: Promise<{ statut?: string }> };

export default async function ArticlesPage({ searchParams }: Props) {
  const t = await getTranslations('admin.newsletter.articles');
  const ts = await getTranslations('admin.newsletter.statuses');
  const { statut } = await searchParams;

  const status = STATUSES.find((candidate) => candidate === statut);

  const articles = await prisma.newsletterArticle.findMany({
    where: status ? { status } : undefined,
    orderBy: { publishedAt: 'desc' },
    take: 100,
    include: { source: { select: { name: true } }, summary: { select: { id: true } } },
  });

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 2 }}>
        {t('title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', fontSize: '14px' }}>
        <Link
          href="/admin/newsletter/articles"
          underline="none"
          sx={{ color: status ? 'text.secondary' : 'text.primary' }}
        >
          {t('filterAll')}
        </Link>
        {STATUSES.map((candidate) => (
          <Link
            key={candidate}
            href={`/admin/newsletter/articles?statut=${candidate}`}
            underline="none"
            sx={{ color: status === candidate ? 'text.primary' : 'text.secondary' }}
          >
            {ts(candidate)}
          </Link>
        ))}
      </Box>

      {articles.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>{t('empty')}</Typography>
      ) : (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {articles.map((article, index) => (
            <Box
              key={article.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' },
                gap: 1.5,
                alignItems: 'center',
                p: '12px 16px',
                borderBottom: index < articles.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Link
                  href={article.sourceUrl}
                  target="_blank"
                  underline="none"
                  sx={{ fontSize: '15px', color: 'text.primary' }}
                >
                  {article.title}
                </Link>
                <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                  {article.source.name} · {article.publishedAt.toLocaleDateString('fr-FR')}
                </Box>
                {article.skipReason ? (
                  <Box sx={{ fontSize: '12.5px', color: 'text.secondary' }}>
                    {t('reason')} : {article.skipReason}
                  </Box>
                ) : null}
              </Box>
              <Box
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: article.status === 'FAILED' ? 'error.main' : 'text.disabled',
                }}
              >
                {ts(article.status)}
              </Box>
              {article.status === 'FAILED' || article.status === 'SKIPPED' ? (
                <RequeueButton articleId={article.id} label={t('requeue')} />
              ) : (
                <Box />
              )}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
