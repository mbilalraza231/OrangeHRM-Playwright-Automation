import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage }     from '../../pages/LoginPage';

/**
 * 06-logout.spec.ts
 *
 * Verifies the full logout flow:
 *  1. Navigate to dashboard
 *  2. Click Logout via the user dropdown
 *  3. Assert redirect to /auth/login
 *  4. Assert protected pages are no longer accessible
 */

test.use({ storageState: 'playwright/.auth/user.json' });

test('12. Logout and verify session is fully terminated', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const loginPage     = new LoginPage(page);

  // Start from dashboard (where the logout control is available)
  await dashboardPage.goto();
  await dashboardPage.logout();

  // Must land on the login page
  await expect(page).toHaveURL(/auth\/login/);
  await expect(loginPage.loginHeading).toBeVisible();

  // Verify protected pages are no longer accessible
  await page.goto('/web/index.php/dashboard/index');
  await expect(page).toHaveURL(/auth\/login/);
});
