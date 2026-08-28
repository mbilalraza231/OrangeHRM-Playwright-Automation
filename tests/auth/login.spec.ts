import { test, expect } from '../../fixtures/test-fixtures';
import users from '../../test-data/users.json';

/** login.spec.ts — Verifies admin login with valid credentials. */

test.use({ storageState: { cookies: [], origins: [] } });

test('admin can log in successfully', async ({ loginPage, dashboardPage, page }) => {
  await loginPage.goto();
  await loginPage.verifyPageLoaded();
  await loginPage.login(users.admin.username, users.admin.password);
  await expect(page).toHaveURL(/dashboard/);
  await dashboardPage.verifyDashboard();
});

