'use client';

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { requeueArticleAction } from '@/lib/admin/newsletter-actions';
import { runAction } from '@/lib/client-action';

import { ghostSx } from '../../_components/styles';

export default function RequeueButton({ articleId, label }: { articleId: string; label: string }) {
  const router = useRouter();

  return (
    <Button
      size="small"
      variant="outlined"
      sx={ghostSx}
      onClick={async () => {
        await runAction(() => requeueArticleAction(articleId));
        router.refresh();
      }}
    >
      {label}
    </Button>
  );
}
