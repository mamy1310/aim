import type { Metadata } from 'next';

import LegalPage, { legalMetadata } from '../_components/LegalPage';

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata('privacy');
}

export default function Page() {
  return <LegalPage page="privacy" />;
}
