import { expect, test } from '@playwright/test';

import { PASSWORD, createCourse, createVerifiedUser, prisma, uniqueEmail } from './fixtures';
import { signIn } from './utils';

test.describe('parcours apprenant', () => {
  test('inscription, connexion, cours, quiz et attestation', async ({ page }) => {
    const email = uniqueEmail('apprenant');
    const slug = `cours-e2e-${Date.now()}`;
    const course = await createCourse(slug);

    await page.goto('/register');
    const texts = page.locator('input[type="text"]');
    await texts.nth(0).fill('Lea');
    await texts.nth(1).fill('Bonnaire');
    await page.locator('input[type="email"]').fill(email);
    const passwords = page.locator('input[type="password"]');
    await passwords.nth(0).fill(PASSWORD);
    await passwords.nth(1).fill(PASSWORD);
    await page.locator('input[type="checkbox"]').check();
    await page
      .getByRole('button', { name: /cr.er mon compte|cr.er/i })
      .first()
      .click();
    await page.waitForURL('**/dashboard');

    const token = await prisma.verificationToken.findFirstOrThrow({
      where: { identifier: `verify-email:${email}` },
    });
    await page.goto(`/verify-email/${token.token}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('confirm', {
      ignoreCase: true,
    });

    await page.goto(`/cours/${slug}`);
    for (const lesson of course.lessons) {
      await page.goto(`/cours/${slug}/lecons/${lesson.id}`);
      await page.getByRole('button', { name: /marquer comme lu/i }).click();
      await expect(page.getByRole('button', { name: /termin/i })).toBeVisible();
    }

    await page.goto(`/cours/${slug}/quiz`);
    await page.locator('label', { hasText: 'La bonne reponse' }).first().locator('input').check();
    await page.getByRole('button', { name: /valider mes r.ponses/i }).click();
    await expect(page.getByText('100 %')).toBeVisible();

    await page
      .getByRole('link', { name: /attestation/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/badge\//);
    await expect(
      page.getByText(/ne constitue pas une certification professionnelle/i),
    ).toBeVisible();

    await prisma.user.deleteMany({ where: { email } });
    await prisma.course.delete({ where: { slug } });
  });

  test('les routes privees renvoient vers la connexion', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('un compte etudiant n atteint pas l administration', async ({ page }) => {
    const email = uniqueEmail('etudiant');
    await createVerifiedUser(email);

    await signIn(page, email);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/dashboard/);

    await prisma.user.deleteMany({ where: { email } });
  });
});
