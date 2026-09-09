import { expect, test } from '@playwright/test';

import {
  createDraftIssue,
  createSubscriber,
  createVerifiedUser,
  prisma,
  uniqueEmail,
} from './fixtures';
import { signIn } from './utils';

test('un administrateur edite un brouillon puis declenche l envoi', async ({ page }) => {
  const adminEmail = uniqueEmail('admin');
  const subscriberEmail = uniqueEmail('lecteur');
  await createVerifiedUser(adminEmail, 'ADMIN');
  await createSubscriber(subscriberEmail);
  const issue = await createDraftIssue();

  await signIn(page, adminEmail);
  await page.goto(`/admin/newsletter/issues/${issue.id}/edit`);

  await page.getByLabel(/edito/i).fill('Bonjour a toutes et a tous.');
  await page.getByRole('button', { name: /enregistrer/i }).click();
  await expect(page.getByText(/edition enregistree/i)).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /valider et envoyer/i }).click();
  await expect(page.getByText(/edition envoyee/i)).toBeVisible();

  const sent = await prisma.newsletterIssue.findUniqueOrThrow({ where: { id: issue.id } });
  expect(sent.status).toBe('SENT');
  expect(sent.autoSent).toBe(false);
  expect(sent.recipientCount).toBeGreaterThanOrEqual(1);

  await page.goto('/admin/newsletter/issues');
  await expect(page.getByText(sent.subject)).toBeVisible();

  await prisma.newsletterIssue.delete({ where: { id: issue.id } });
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, subscriberEmail] } } });
});
