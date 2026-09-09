import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import AuthHead from '../_components/AuthHead';
import LoginForm from './LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.meta.login');
  return { title: t('title'), description: t('description') };
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login');
  return (
    <>
      <AuthHead route="/login" title={t('title')} subtitle={t('subtitle')} />
      <LoginForm />
    </>
  );
}
