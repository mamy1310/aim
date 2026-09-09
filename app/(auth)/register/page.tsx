import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { env } from '@/lib/env';

import AuthHead from '../_components/AuthHead';
import RegisterForm from './RegisterForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.meta.register');
  return { title: t('title'), description: t('description') };
}

export default async function RegisterPage() {
  const t = await getTranslations('auth.register');
  return (
    <>
      <AuthHead route="/register" title={t('title')} subtitle={t('subtitle')} />
      <RegisterForm googleEnabled={env.googleOAuthEnabled} />
    </>
  );
}
