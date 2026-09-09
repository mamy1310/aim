import type { Page } from '@playwright/test';

import { PASSWORD } from './fixtures';

export async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page
    .getByRole('button', { name: /se connecter/i })
    .first()
    .click();
  await page.waitForURL('**/dashboard');
}
