import type { Metadata } from 'next';

import LegalPage, { legalMetadata } from '../_components/LegalPage';

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata('cgv');
}

export default function Page() {
  return <LegalPage page="cgv" />;
}
