import type { Metadata } from 'next';

import LegalPage, { legalMetadata } from '../_components/LegalPage';

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata('cookies');
}

export default function Page() {
  return <LegalPage page="cookies" />;
}
