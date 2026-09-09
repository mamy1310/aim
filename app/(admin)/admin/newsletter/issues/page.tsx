import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';

import { mono, serif } from '../../../../_components/styles';

export default async function IssuesPage() {
  const t = await getTranslations('admin.newsletter.issues');
  const ts = await getTranslations('admin.newsletter.statuses');

  const issues = await prisma.newsletterIssue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 60,
  });

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 3 }}>
        {t('title')}
      </Typography>

      {issues.length === 0 ? (
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
          {issues.map((issue, index) => (
            <Link
              key={issue.id}
              href={`/admin/newsletter/issues/${issue.id}/edit`}
              underline="none"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' },
                gap: 1.5,
                alignItems: 'center',
                p: '12px 16px',
                color: 'text.primary',
                borderBottom: index < issues.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
                '&:hover': { bgcolor: 'background.sunk' },
              }}
            >
              <Box sx={{ fontSize: '15px' }}>{issue.subject}</Box>
              <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                {issue.status === 'SENT' && issue.sentAt
                  ? `${t('sentAt')} ${issue.sentAt.toLocaleString('fr-FR')} · ${t('recipients', {
                      count: issue.recipientCount ?? 0,
                    })} · ${issue.autoSent ? t('autoSent') : t('manualSent')}`
                  : `${t('sendAt')} ${issue.intendedSendAt.toLocaleString('fr-FR')}`}
              </Box>
              <Box
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: issue.status === 'SENT' ? 'success.main' : 'text.disabled',
                }}
              >
                {ts(issue.status)}
              </Box>
            </Link>
          ))}
        </Box>
      )}
    </>
  );
}
