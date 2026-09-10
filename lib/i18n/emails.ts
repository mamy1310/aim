import { createTranslator } from 'next-intl';

import messages from '@/messages/fr.json';

type EmailNamespace = keyof (typeof messages)['emails'];

export function getEmailTranslations(namespace: EmailNamespace) {
  return createTranslator({ locale: 'fr', messages, namespace: `emails.${namespace}` });
}
