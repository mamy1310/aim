'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function UserSearch({ label, initial }: { label: string; initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(value ? `/admin/users?q=${encodeURIComponent(value)}` : '/admin/users');
      }}
      sx={{ mb: 3, maxWidth: 360 }}
    >
      <TextField
        label={label}
        size="small"
        fullWidth
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Box>
  );
}
