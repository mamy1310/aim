import { createTranslator } from 'next-intl';

import messages from '@/messages/fr.json';

export const DEFAULT_LOCALE = 'fr';

type EmailNamespace = keyof (typeof messages)['emails'];

export function getEmailTranslations(namespace: EmailNamespace, locale: string = DEFAULT_LOCALE) {
  return createTranslator({ locale, messages, namespace: `emails.${namespace}` });
}
