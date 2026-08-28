import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

/**
 * auth.setup.ts — Runs once before the test suite.
 * Logs in and saves the browser's storage state so all tests start authenticated.
 */

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as admin', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
  await page.context().storageState({ path: authFile });
});
