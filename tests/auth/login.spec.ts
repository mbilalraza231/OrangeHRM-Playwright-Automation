import { test, expect } from '../../fixtures/test-fixtures';
import users from '../../test-data/users.json';

// Start with a clean (unauthenticated) session so we can test the login flow.
// Without this, the chromium project would inject the saved storageState and
// the page would already be authenticated — the Login heading would never appear.
test.use({ storageState: { cookies: [], origins: [] } });

test('admin can log in and save storageState', async ({ loginPage, dashboardPage, page }) => {
  await loginPage.goto();
  await loginPage.verifyPageLoaded();
  await loginPage.login(users.admin.username, users.admin.password);
  await expect(page).toHaveURL(/dashboard/);
  await dashboardPage.verifyDashboard();

  // Save the authenticated browser context state to a file.
  // (The main auth for the test suite lives in playwright/.auth/user.json
  //  written by auth.setup.ts — this is a secondary save for manual reference.)
  await page.context().storageState({ path: 'authState.json' });
});

