import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { mono, serif } from '../../_components/styles';

export default function AuthHead({
  route,
  title,
  subtitle,
}: {
  route: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box
        component="span"
        sx={{
          ...mono,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: 'text.disabled',
        }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ width: 5, height: 5, borderRadius: '999px', bgcolor: 'text.disabled' }}
        />
        {route}
      </Box>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography
          component="h1"
          sx={{
            ...serif,
            fontWeight: 500,
            fontSize: 'clamp(1.75rem, 4.5vw, 2.125rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.018em',
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: '15.5px', color: 'text.secondary' }}>{subtitle}</Typography>
      </Box>
    </Box>
  );
}
