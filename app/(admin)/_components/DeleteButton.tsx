'use client';

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { runAction } from '@/lib/client-action';

import { ghostSx } from '../../_components/styles';

export default function DeleteButton({
  label,
  confirmLabel,
  onDelete,
  redirectTo,
}: {
  label: string;
  confirmLabel: string;
  onDelete: () => Promise<{ ok: boolean }>;
  redirectTo: string;
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      size="small"
      variant="outlined"
      sx={{ ...ghostSx, color: 'error.main', borderColor: 'error.main' }}
      onClick={async () => {
        if (!window.confirm(confirmLabel)) return;
        await runAction(onDelete);
        router.push(redirectTo);
        router.refresh();
      }}
    >
      {label}
    </Button>
  );
}
