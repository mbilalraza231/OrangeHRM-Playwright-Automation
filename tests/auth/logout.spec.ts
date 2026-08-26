import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Logout Tests
 *
 * Uses the saved storageState (already authenticated).
 * Verifies that the user can log out and is redirected to the login page.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OrangeHRM Logout', () => {

  test('admin can log out and is redirected to the login page', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    await dashboardPage.verifyDashboard();

    await dashboardPage.logout();

    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

});
