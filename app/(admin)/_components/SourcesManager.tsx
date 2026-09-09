'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { deleteSourceAction, saveSourceAction } from '@/lib/admin/newsletter-actions';

import { ghostSx, mono } from '../../_components/styles';

type Category = 'OFFICIAL' | 'RESEARCH' | 'COMMUNITY';

export type SourceRow = {
  id: string;
  name: string;
  rssUrl: string;
  category: Category;
  enabled: boolean;
  lastFetchedAt: Date | null;
  lastError: string | null;
};

const CATEGORIES: Category[] = ['OFFICIAL', 'RESEARCH', 'COMMUNITY'];

export default function SourcesManager({ sources }: { sources: SourceRow[] }) {
  const t = useTranslations('admin.newsletter.sources');
  const te = useTranslations('admin.errors');
  const router = useRouter();

  const [draft, setDraft] = useState({
    name: '',
    rssUrl: '',
    category: 'OFFICIAL' as Category,
    enabled: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function persist(sourceId: string | null, values: typeof draft) {
    const result = await saveSourceAction(sourceId, values);
    if (!result.ok) {
      setError(true);
      setMessage(te(result.error));
      return false;
    }
    setError(false);
    setMessage(t('saved'));
    router.refresh();
    return true;
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {sources.map((source, index) => (
          <Box
            key={source.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' },
              gap: 1.5,
              alignItems: 'center',
              p: '12px 16px',
              borderBottom: index < sources.length - 1 ? '1px solid' : 'none',
              borderColor: 'dividerSoft',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ fontSize: '15px' }}>{source.name}</Box>
              <Box
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: 'text.disabled',
                  textTransform: 'none',
                  wordBreak: 'break-all',
                }}
              >
                {source.rssUrl}
              </Box>
              <Box
                sx={{ fontSize: '12px', color: source.lastError ? 'error.main' : 'text.disabled' }}
              >
                {source.lastError
                  ? `${t('error')} : ${source.lastError}`
                  : `${t('lastFetch')} : ${
                      source.lastFetchedAt
                        ? new Date(source.lastFetchedAt).toLocaleString('fr-FR')
                        : t('never')
                    }`}
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={source.enabled}
                  onChange={(event) =>
                    persist(source.id, {
                      name: source.name,
                      rssUrl: source.rssUrl,
                      category: source.category,
                      enabled: event.target.checked,
                    })
                  }
                />
              }
              label={t('enabled')}
            />
            <Button
              size="small"
              variant="outlined"
              sx={{ ...ghostSx, color: 'error.main', borderColor: 'error.main' }}
              onClick={async () => {
                if (!window.confirm(t('deleteConfirm'))) return;
                await deleteSourceAction(source.id);
                router.refresh();
              }}
            >
              {t('delete')}
            </Button>
          </Box>
        ))}
      </Box>

      <Box
        component="form"
        onSubmit={async (event) => {
          event.preventDefault();
          const saved = await persist(null, draft);
          if (saved) setDraft({ name: '', rssUrl: '', category: 'OFFICIAL', enabled: true });
        }}
        sx={{ display: 'grid', gap: 2, maxWidth: 560 }}
      >
        <TextField
          label={t('name')}
          size="small"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          required
        />
        <TextField
          label={t('url')}
          size="small"
          value={draft.rssUrl}
          onChange={(event) => setDraft({ ...draft, rssUrl: event.target.value })}
          required
        />
        <TextField
          label={t('category')}
          size="small"
          select
          value={draft.category}
          onChange={(event) => setDraft({ ...draft, category: event.target.value as Category })}
        >
          {CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button type="submit" variant="contained" size="small">
            {t('add')}
          </Button>
          <Box sx={{ fontSize: '14px', color: error ? 'error.main' : 'success.main' }}>
            {message}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
