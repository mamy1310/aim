import { getTranslations } from 'next-intl/server';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';

import SourcesManager from '../../../_components/SourcesManager';
import { serif } from '../../../../_components/styles';

export default async function SourcesPage() {
  const t = await getTranslations('admin.newsletter.sources');
  const sources = await prisma.newsletterSource.findMany({ orderBy: { name: 'asc' } });

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 3 }}>
        {t('title')}
      </Typography>
      <SourcesManager sources={sources} />
    </>
  );
}
