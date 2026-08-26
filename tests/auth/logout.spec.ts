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
    // Log in manually to obtain a transient session
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    await dashboardPage.verifyDashboard();

    // ✅ locator() — user dropdown in top bar
    // ✅ getByRole() — Logout menu item
    await dashboardPage.logout();

    // ✅ URL assertion — should be back on login page
    await expect(page).toHaveURL(/auth\/login/);

    // ✅ getByRole() — Login heading visible again
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

});
