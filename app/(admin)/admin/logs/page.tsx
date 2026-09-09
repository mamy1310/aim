import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { dailyCostUsd } from '@/lib/ai/summarize';
import { prisma } from '@/lib/db';

import { mono, serif } from '../../../_components/styles';

export default async function LogsPage() {
  const t = await getTranslations('admin.logs');

  const [logs, cost] = await Promise.all([
    prisma.aIGenerationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    dailyCostUsd(),
  ]);

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 1 }}>
        {t('title')}
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        {t('total', { cost: cost.toFixed(4) })}
      </Typography>

      {logs.length === 0 ? (
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
          {logs.map((log, index) => (
            <Box
              key={log.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'auto 1fr auto auto' },
                gap: 1.5,
                p: '12px 16px',
                fontSize: '13.5px',
                borderBottom: index < logs.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
              }}
            >
              <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                {log.createdAt.toLocaleString('fr-FR')}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                {log.model} · {t('attempt')} {log.attemptNumber}
                {log.errorMessage ? (
                  <Box sx={{ color: 'error.main', fontSize: '12.5px' }}>{log.errorMessage}</Box>
                ) : null}
              </Box>
              <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                {log.inputTokens + log.outputTokens} {t('tokens')} ·{' '}
                {Number(log.costUsd).toFixed(5)} $
              </Box>
              <Box
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: log.success ? 'success.main' : 'error.main',
                }}
              >
                {log.success ? t('success') : t('failure')}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
