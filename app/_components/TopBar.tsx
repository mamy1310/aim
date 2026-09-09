import type { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

import Brand from './Brand';
import { appBarSx, container } from './styles';

export default function TopBar({ nav, actions }: { nav: ReactNode; actions: ReactNode }) {
  return (
    <AppBar position="sticky" elevation={0} sx={appBarSx}>
      <Toolbar disableGutters sx={container}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: 60,
          }}
        >
          <Brand />
          <Box component="nav" sx={{ display: { xs: 'none', md: 'inline-flex' }, gap: 3.5 }}>
            {nav}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>{actions}</Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
