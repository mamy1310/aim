import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';

import { mono, serif } from '../../../_components/styles';
import UserSearch from '../../_components/UserSearch';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function UsersPage({ searchParams }: Props) {
  const t = await getTranslations('admin.users');
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q ? { email: { contains: q, mode: 'insensitive' } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      newsletterSubscription: { select: { confirmed: true, unsubscribedAt: true } },
    },
  });

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 3 }}>
        {t('title')}
      </Typography>

      <UserSearch label={t('search')} initial={q ?? ''} />

      {users.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>{t('none')}</Typography>
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
          {users.map((user, index) => (
            <Box
              key={user.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr auto auto auto' },
                gap: 1.5,
                alignItems: 'center',
                p: '12px 16px',
                fontSize: '14px',
                borderBottom: index < users.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
              }}
            >
              <Box sx={{ minWidth: 0, wordBreak: 'break-all' }}>
                {user.email}
                <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                  {user.name ?? '—'} · {user.createdAt.toLocaleDateString('fr-FR')}
                </Box>
              </Box>
              <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>{user.role}</Box>
              <Box
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: user.emailVerified ? 'success.main' : 'text.disabled',
                }}
              >
                {t('verified')}
              </Box>
              <Box sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                {user.newsletterSubscription?.confirmed &&
                !user.newsletterSubscription.unsubscribedAt
                  ? t('subscribed')
                  : t('notSubscribed')}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
