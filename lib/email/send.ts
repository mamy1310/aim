import 'server-only';

import { Resend } from 'resend';

import { env } from '@/lib/env';

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

function isRealApiKey(key: string): boolean {
  return key.startsWith('re_');
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = env.resendApiKey;

  if (!isRealApiKey(apiKey)) {
    console.info('[email] envoi simule', {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  if (error) throw new Error(`Envoi Resend echoue : ${error.message}`);
}

export async function sendBatch(messages: EmailMessage[]): Promise<void> {
  const apiKey = env.resendApiKey;

  if (!isRealApiKey(apiKey)) {
    console.info('[email] lot simule', { count: messages.length });
    return;
  }

  const resend = new Resend(apiKey);
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const { error } = await resend.batch.send(
      chunk.map((message) => ({
        from: env.emailFrom,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      })),
    );
    if (error) throw new Error(`Envoi Resend en lot echoue : ${error.message}`);
  }
}
