import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';
import { levelKey } from '@/lib/levels';

import IssueEditor from '../../../../../_components/IssueEditor';
import { mono, serif } from '../../../../../../_components/styles';

type Props = { params: Promise<{ id: string }> };

export default async function IssueEditPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('admin.newsletter.issue');
  const tc = await getTranslations('common');
  const tcat = await getTranslations('emails.categories');

  const issue = await prisma.newsletterIssue.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { summary: { include: { article: { include: { source: true } } } } },
      },
    },
  });

  if (!issue) notFound();

  const summary = issue.items[0]?.summary;

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 3 }}>
        {t('title')}
      </Typography>

      <IssueEditor
        issueId={issue.id}
        initial={{ subject: issue.subject, intro: issue.intro }}
        readOnly={issue.status === 'SENT'}
      />

      {summary ? (
        <Box
          component="section"
          sx={{
            mt: 4,
            p: '20px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            bgcolor: 'background.paper',
            display: 'grid',
            gap: 1.25,
            maxWidth: 640,
          }}
        >
          <Box
            component="span"
            sx={{ ...mono, fontSize: '10.5px', letterSpacing: '0.06em', color: 'text.disabled' }}
          >
            {t('preview')} · {tc(levelKey(summary.level))} · {tcat(summary.category)}
          </Box>
          <Typography sx={{ ...serif, fontSize: '20px', fontWeight: 500 }}>
            {summary.titleLocalized}
          </Typography>
          <Typography sx={{ fontSize: '15px' }}>{summary.summary}</Typography>
          <Typography sx={{ fontSize: '15px', color: 'text.secondary' }}>
            {t('whyItMatters')} : {summary.whyItMatters}
          </Typography>
          <Link
            href={summary.article.sourceUrl}
            target="_blank"
            underline="none"
            sx={{ fontSize: '13.5px', color: 'text.secondary', wordBreak: 'break-all' }}
          >
            {t('sourceLink')} : {summary.article.source.name} — {summary.article.sourceUrl}
          </Link>
        </Box>
      ) : null}
    </>
  );
}
