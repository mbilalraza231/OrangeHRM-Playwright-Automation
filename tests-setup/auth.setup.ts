import { test as setup, expect } from '@playwright/test';
import path from 'path';

/**
 * auth.setup.ts — Authentication Setup Project
 *
 * This runs ONCE before the main test suite.
 * It logs in and saves the browser's storage state (cookies + localStorage)
 * to a file. All subsequent tests load that file instead of logging in again.
 *
 * Flow:
 *   Login once → Save storageState → Tests start already authenticated
 *
 * IMPORTANT: playwright/.auth/user.json is in .gitignore
 * because it contains session tokens that could allow impersonation.
 */

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as admin', async ({ page }) => {
  // Always start clean — no leftover session
  await page.context().clearCookies();

  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });

  // Fill credentials
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait until we're on the dashboard — automatic waiting, no waitForTimeout()
  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });

  // Save the authenticated browser state for all subsequent tests
  await page.context().storageState({ path: authFile });
});
