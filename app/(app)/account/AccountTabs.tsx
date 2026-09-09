'use client';

import { type ChangeEvent, type ReactNode, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';

import {
  changePasswordAction,
  revokeOtherSessionsAction,
  updateProfileAction,
} from '@/lib/auth/actions';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/schemas';
import { updateMaxLevelAction } from '@/lib/newsletter/actions';
import { deleteAccountAction } from '@/lib/account/actions';
import { MAX_LEVEL } from '@/lib/levels';

import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronRightIcon,
  DownloadIcon,
  TrashIcon,
} from '../../_components/icons';
import { ghostSx, mono, serif } from '../../_components/styles';

type TabKey = 'profile' | 'security' | 'data';

const SLUG: Record<TabKey, string> = { profile: 'profil', security: 'securite', data: 'donnees' };

const cardSx = {
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '16px',
  overflow: 'hidden',
} as const;

const cardHeadSx = { p: '22px 24px 6px' } as const;
const cardBodySx = { p: '18px 24px 22px' } as const;
const cardFootSx = {
  p: '14px 24px',
  bgcolor: 'background.sunk',
  borderTop: '1px solid',
  borderColor: 'dividerSoft',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 1.5,
  flexWrap: 'wrap',
} as const;

const inputSx = {
  borderRadius: '10px',
  bgcolor: 'background.default',
  fontSize: '15px',
  '& .MuiOutlinedInput-input': { py: '10px', height: '22px' },
  '& fieldset': { borderColor: 'divider', transition: 'border-color .15s' },
  '&:hover fieldset': { borderColor: 'text.disabled' },
  '&.Mui-focused fieldset': { borderColor: 'text.disabled', borderWidth: '1px' },
  '&.Mui-focused': { bgcolor: 'background.paper' },
} as const;

const dangerGhostSx = {
  color: 'error.main',
  borderColor: 'color-mix(in oklab, var(--mui-palette-error-main) 35%, var(--mui-palette-divider))',
  bgcolor: 'transparent',
  '&:hover': { bgcolor: 'error.light', borderColor: 'error.main' },
} as const;

const dangerSolidSx = {
  bgcolor: 'error.main',
  color: '#fff',
  '&:hover': { bgcolor: 'error.dark' },
} as const;

function CardHead({ title, desc, danger }: { title: string; desc: string; danger?: boolean }) {
  return (
    <Box sx={cardHeadSx}>
      <Typography
        component="h2"
        sx={{
          ...serif,
          fontSize: '21px',
          fontWeight: 500,
          mb: 0.5,
          color: danger ? 'error.main' : 'text.primary',
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: '14px', color: 'text.secondary', maxWidth: '60ch' }}>
        {desc}
      </Typography>
    </Box>
  );
}

function LabelledInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  help,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  help?: string;
}) {
  const id = useId();
  return (
    <Box sx={{ display: 'grid', gap: 0.875 }}>
      <Box
        component="label"
        htmlFor={id}
        sx={{ fontSize: '13px', fontWeight: 500, color: 'text.secondary' }}
      >
        {label}
      </Box>
      <OutlinedInput
        id={id}
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        autoComplete={autoComplete}
        fullWidth
        sx={inputSx}
      />
      {help ? <Box sx={{ fontSize: '12.5px', color: 'text.disabled' }}>{help}</Box> : null}
    </Box>
  );
}

export default function AccountTabs({
  user,
  sessionCount,
  maxLevel,
  hasNewsletter,
}: {
  user: { fullName: string; email: string };
  sessionCount: number;
  maxLevel: number | null;
  hasNewsletter: boolean;
}) {
  const t = useTranslations('account');
  const [tab, setTab] = useState<TabKey>('profile');
  const [toast, setToast] = useState('');

  function selectTab(next: TabKey) {
    setTab(next);
    history.replaceState(null, '', `#${SLUG[next]}`);
  }

  const showToast = (msg: string) => setToast(msg);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'profile', label: t('tabs.profile') },
    { key: 'security', label: t('tabs.security') },
    { key: 'data', label: t('tabs.data') },
  ];

  return (
    <>
      <Box
        component="nav"
        aria-label={t('title')}
        sx={{ borderBottom: '1px solid', borderColor: 'dividerSoft', mt: 1 }}
      >
        <Box
          role="tablist"
          sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', scrollbarWidth: 'none' }}
        >
          {tabs.map((it) => {
            const on = tab === it.key;
            return (
              <Box
                key={it.key}
                component="button"
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => selectTab(it.key)}
                sx={{
                  appearance: 'none',
                  bgcolor: 'transparent',
                  border: 'none',
                  font: 'inherit',
                  fontSize: '14.5px',
                  cursor: 'pointer',
                  color: on ? 'text.primary' : 'text.secondary',
                  p: '14px 4px',
                  mr: '22px',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: 'text.primary' },
                  '&::after': on
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: '-1px',
                        height: '1.5px',
                        bgcolor: 'text.primary',
                      }
                    : undefined,
                }}
              >
                {it.label}
              </Box>
            );
          })}
          <Link
            href="/account/facturation"
            underline="none"
            sx={{
              ml: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: '14.5px',
              color: 'text.disabled',
              whiteSpace: 'nowrap',
              pl: 2,
              '&:hover': { color: 'text.primary' },
            }}
          >
            {t('tabs.billing')}
            <Box component="span" sx={{ display: 'inline-flex', fontSize: '13px' }}>
              <ChevronRightIcon />
            </Box>
          </Link>
        </Box>
      </Box>

      <Box sx={{ pt: 4.5, pb: 10 }}>
        {tab === 'profile' && (
          <ProfilePanel
            user={user}
            maxLevel={maxLevel}
            hasNewsletter={hasNewsletter}
            onToast={showToast}
          />
        )}
        {tab === 'security' && <SecurityPanel sessionCount={sessionCount} onToast={showToast} />}
        {tab === 'data' && <DataPanel onToast={showToast} />}
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={2400}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2.25,
            py: 1.5,
            borderRadius: '10px',
            fontSize: '14px',
            boxShadow: 3,
          }}
        >
          <Box component="span" aria-hidden sx={{ display: 'inline-flex', fontSize: '14px' }}>
            <CheckIcon />
          </Box>
          {toast}
        </Box>
      </Snackbar>
    </>
  );
}

function ProfilePanel({
  user,
  maxLevel,
  hasNewsletter,
  onToast,
}: {
  user: { fullName: string; email: string };
  maxLevel: number | null;
  hasNewsletter: boolean;
  onToast: (m: string) => void;
}) {
  const t = useTranslations('account.profile');
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [base, setBase] = useState({ name: user.fullName, email: user.email });
  const [saving, setSaving] = useState(false);
  const te = useTranslations('auth.errors');

  const dirty = name !== base.name || email !== base.email;
  const photoInitial = (name.trim()[0] || 'L').toUpperCase();

  return (
    <Box role="tabpanel" sx={cardSx}>
      <CardHead title={t('title')} desc={t('desc')} />
      <Box sx={cardBodySx}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.75, sm: '22px 18px' },
            gridTemplateColumns: { xs: '1fr', sm: '88px 1fr' },
            alignItems: 'start',
          }}
        >
          <Box
            aria-hidden
            sx={{
              ...serif,
              width: 88,
              height: 88,
              borderRadius: '999px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            {photoInitial}
          </Box>

          <Box sx={{ display: 'grid', gap: 2.75, minWidth: 0 }}>
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2.25, sm: '18px' },
                gridTemplateColumns: { sm: '1fr 1fr' },
              }}
            >
              <LabelledInput
                label={t('nameLabel')}
                value={name}
                onChange={setName}
                autoComplete="name"
              />
              <LabelledInput
                label={t('emailLabel')}
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                help={t('emailHelp')}
              />
            </Box>

            {hasNewsletter ? (
              <Box sx={{ display: 'grid', gap: 0.75, maxWidth: 320 }}>
                <Box
                  component="label"
                  htmlFor="niveau-max"
                  sx={{ fontSize: '13.5px', fontWeight: 500 }}
                >
                  {t('maxLevel')}
                </Box>
                <Box
                  component="select"
                  id="niveau-max"
                  defaultValue={maxLevel === null ? 'all' : String(maxLevel)}
                  onChange={async (event: ChangeEvent<HTMLSelectElement>) => {
                    const value = event.target.value;
                    await updateMaxLevelAction(value === 'all' ? null : Number(value));
                    onToast(t('savedToast'));
                  }}
                  sx={{
                    p: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    font: 'inherit',
                    fontSize: '15px',
                  }}
                >
                  <option value="all">{t('maxLevelAll')}</option>
                  {Array.from({ length: MAX_LEVEL }, (_, index) => index + 1).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Box>
                <Box sx={{ fontSize: '13px', color: 'text.disabled' }}>{t('maxLevelHelp')}</Box>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
      <Box sx={cardFootSx}>
        <Box sx={{ fontSize: '13px', color: 'text.secondary' }}>
          {dirty ? t('dirty') : t('clean')}
        </Box>
        <Button
          size="small"
          variant="contained"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            const result = await updateProfileAction({ name, email });
            setSaving(false);
            if (!result.ok) {
              onToast(te(result.error));
              return;
            }
            setBase({ name, email });
            onToast(t('savedToast'));
          }}
        >
          {t('save')}
        </Button>
      </Box>
    </Box>
  );
}

function SecurityPanel({
  sessionCount,
  onToast,
}: {
  sessionCount: number;
  onToast: (m: string) => void;
}) {
  const t = useTranslations('account.security');
  const te = useTranslations('auth.errors');
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <Box sx={{ display: 'grid', gap: 2.25 }}>
      <Box sx={cardSx}>
        <CardHead title={t('passwordTitle')} desc={t('passwordDesc')} />
        <Box sx={cardBodySx}>
          <Box sx={{ display: 'grid', gap: 2.25 }}>
            <LabelledInput
              label={t('current')}
              type="password"
              value={current}
              onChange={setCurrent}
              autoComplete="current-password"
              placeholder={t('currentPlaceholder')}
            />
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2.25, sm: '18px' },
                gridTemplateColumns: { sm: '1fr 1fr' },
              }}
            >
              <LabelledInput
                label={t('new')}
                type="password"
                value={pw}
                onChange={setPw}
                autoComplete="new-password"
                placeholder={t('newPlaceholder')}
              />
              <LabelledInput
                label={t('confirm')}
                type="password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                placeholder={t('confirmPlaceholder')}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={cardFootSx}>
          <Box
            sx={{
              fontSize: '13px',
              color: 'text.secondary',
              '& a': { color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' },
            }}
          >
            {t.rich('forgotHint', {
              link: (chunks) => (
                <Link href="/forgot-password" underline="none">
                  {chunks}
                </Link>
              ),
            })}
          </Box>
          <Button
            size="small"
            variant="contained"
            disabled={!current || pw.length < PASSWORD_MIN_LENGTH || pw !== confirm}
            onClick={async () => {
              const result = await changePasswordAction({ current, next: pw });
              if (!result.ok) {
                onToast(te(result.error));
                return;
              }
              setCurrent('');
              setPw('');
              setConfirm('');
              onToast(t('changedToast'));
            }}
          >
            {t('change')}
          </Button>
        </Box>
      </Box>

      <Box sx={cardSx}>
        <CardHead title={t('sessionsTitle')} desc={t('sessionsDesc')} />
        <Box sx={cardBodySx}>
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
            {t('sessionsCount', { count: sessionCount })}
          </Box>
        </Box>
        <Box sx={cardFootSx}>
          <Box sx={{ fontSize: '13px', color: 'text.secondary' }}>{t('sessionsHint')}</Box>
          <Button
            size="small"
            variant="outlined"
            sx={ghostSx}
            disabled={sessionCount < 2}
            onClick={async () => {
              await revokeOtherSessionsAction();
              onToast(t('disconnectAllToast'));
            }}
          >
            {t('disconnectAll')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function DataPanel({ onToast }: { onToast: (m: string) => void }) {
  const t = useTranslations('account.data');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Box sx={{ display: 'grid', gap: 2.25 }}>
      <Box sx={cardSx}>
        <CardHead title={t('exportTitle')} desc={t('exportDesc')} />
        <DataRow
          title={t('exportRowTitle')}
          body={t('exportRowBody')}
          action={
            <Button
              size="small"
              variant="outlined"
              sx={ghostSx}
              startIcon={<DownloadIcon />}
              href="/api/account/export"
              onClick={() => onToast(t('exportToast'))}
            >
              {t('exportBtn')}
            </Button>
          }
        />
      </Box>

      <Box
        sx={{
          ...cardSx,
          borderColor:
            'color-mix(in oklab, var(--mui-palette-error-main) 18%, var(--mui-palette-divider))',
          bgcolor:
            'color-mix(in oklab, var(--mui-palette-error-light) 30%, var(--mui-palette-background-paper))',
        }}
      >
        <CardHead title={t('deleteTitle')} desc={t('deleteDesc')} danger />
        <DataRow
          title={t('deleteRowTitle')}
          body={t('deleteRowBody')}
          action={
            <Button
              size="small"
              variant="outlined"
              sx={dangerGhostSx}
              onClick={() => setModalOpen(true)}
            >
              {t('deleteBtn')}
            </Button>
          }
        />
      </Box>

      <DeleteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={async () => {
          setModalOpen(false);
          onToast(t('deletedToast'));
          await deleteAccountAction();
        }}
      />
    </Box>
  );
}

function DataRow({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
        gap: 2.25,
        alignItems: 'center',
        p: '18px 24px 22px',
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Typography component="h3" sx={{ ...serif, fontSize: '18px', fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary', maxWidth: '56ch' }}>
          {body}
        </Typography>
      </Box>
      <Box sx={{ justifySelf: { sm: 'end' } }}>{action}</Box>
    </Box>
  );
}

function DeleteModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const t = useTranslations('account.deleteModal');
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const phrase = t('confirmPhrase');
  const items = t.raw('step1Items') as string[];

  const dotsSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    mr: 'auto',
    ...mono,
    fontSize: '10.5px',
    color: 'text.disabled',
  };
  const dot = (on: boolean) => (
    <Box
      component="span"
      sx={{ width: 6, height: 6, borderRadius: '999px', bgcolor: on ? 'error.main' : 'divider' }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: '16px', border: '1px solid', borderColor: 'divider' } },
        transition: {
          onExited: () => {
            setStep(1);
            setConfirmText('');
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, p: '22px 24px 4px' }}>
        <Box
          aria-hidden
          sx={{
            width: 36,
            height: 36,
            borderRadius: '999px',
            bgcolor: 'error.light',
            color: 'error.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '18px',
          }}
        >
          {step === 1 ? <AlertTriangleIcon /> : <TrashIcon />}
        </Box>
        <Typography component="h3" sx={{ ...serif, fontSize: '19px', fontWeight: 500, mt: 0.5 }}>
          {step === 1 ? t('step1Title') : t('step2Title')}
        </Typography>
      </Box>

      <Box sx={{ p: '12px 24px 6px 75px', fontSize: '14.5px', color: 'text.secondary' }}>
        {step === 1 ? (
          <>
            <Typography sx={{ fontSize: '14.5px', color: 'text.secondary' }}>
              {t('step1Intro')}
            </Typography>
            <Box component="ul" sx={{ m: '8px 0 4px', pl: 2.25, fontSize: '14px' }}>
              {items.map((it) => (
                <Box component="li" key={it} sx={{ mb: '3px' }}>
                  {it}
                </Box>
              ))}
            </Box>
            <Typography
              sx={{
                fontSize: '14.5px',
                color: 'text.secondary',
                mt: 1.25,
                '& a': { color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' },
              }}
            >
              {t.rich('step1Export', {
                link: (chunks) => (
                  <Link href="#" underline="none" onClick={(e) => e.preventDefault()}>
                    {chunks}
                  </Link>
                ),
              })}
            </Typography>
          </>
        ) : (
          <>
            <Typography sx={{ fontSize: '14.5px', color: 'text.secondary' }}>
              {t.rich('step2Prompt', {
                phrase,
                code: (chunks) => (
                  <Box
                    component="code"
                    sx={{
                      ...mono,
                      textTransform: 'none',
                      fontSize: '12.5px',
                      bgcolor: 'background.sunk',
                      px: 0.75,
                      py: '1px',
                      borderRadius: '4px',
                      color: 'text.primary',
                    }}
                  >
                    {chunks}
                  </Box>
                ),
              })}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box
                component="label"
                htmlFor="del-confirm"
                sx={{ display: 'block', fontSize: '13px', color: 'text.primary', mb: 0.75 }}
              >
                {t('confirmLabel')}
              </Box>
              <OutlinedInput
                id="del-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={phrase}
                autoComplete="off"
                fullWidth
                sx={inputSx}
              />
            </Box>
          </>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          p: '16px 24px 18px',
          mt: 2,
          bgcolor: 'background.sunk',
          borderTop: '1px solid',
          borderColor: 'dividerSoft',
        }}
      >
        <Box sx={dotsSx}>
          {dot(true)}
          {dot(step === 2)}
          <Box component="span" sx={{ ml: 0.5 }}>
            {step === 1 ? t('step1Of2') : t('step2Of2')}
          </Box>
        </Box>
        <Button size="small" variant="outlined" sx={ghostSx} onClick={onClose}>
          {t('cancel')}
        </Button>
        {step === 1 ? (
          <Button size="small" variant="contained" sx={dangerSolidSx} onClick={() => setStep(2)}>
            {t('continue')}
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            sx={dangerSolidSx}
            disabled={confirmText.trim().toLowerCase() !== phrase.toLowerCase()}
            onClick={onConfirm}
          >
            {t('deleteFinal')}
          </Button>
        )}
      </Box>
    </Dialog>
  );
}
