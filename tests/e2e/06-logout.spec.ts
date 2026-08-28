import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage }     from '../../pages/LoginPage';

/** 06-logout.spec.ts — Verifies full logout flow and confirms session is terminated. */

test.use({ storageState: 'playwright/.auth/user.json' });

test('11. Logout and verify session is fully terminated', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const loginPage     = new LoginPage(page);

  await dashboardPage.goto();
  await dashboardPage.logout();

  await expect(page).toHaveURL(/auth\/login/);
  await expect(loginPage.loginHeading).toBeVisible();

  await page.goto('/web/index.php/dashboard/index');
  await expect(page).toHaveURL(/auth\/login/);
});
