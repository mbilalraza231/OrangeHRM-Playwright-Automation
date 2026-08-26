import { test, expect } from '../../fixtures/test-fixtures';
import users from '../../test-data/users.json';

/**
 * Login Tests — Phase 3 + 4
 *
 * Deliberately override storageState to empty so these tests ALWAYS
 * go through the real login flow, ignoring any saved auth session.
 *
 * Covers:
 *  - Positive: valid credentials → Dashboard
 *  - Negative: invalid credentials → error message
 *  - Negative: valid username + wrong password → error message
 *  - Negative: empty fields → required validation
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OrangeHRM Login', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.verifyPageLoaded();
  });

  test('admin can log in with valid credentials and see Dashboard', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.login(users.admin.username, users.admin.password);
    await expect(page).toHaveURL(/dashboard/);
    await dashboardPage.verifyDashboard();
  });

  test('invalid credentials display an error message', async ({ loginPage, page }) => {
    await loginPage.login(users.invalidUser.username, users.invalidUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('valid username with wrong password shows an error', async ({ loginPage, page }) => {
    await loginPage.login(users.validUserWrongPass.username, users.validUserWrongPass.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('empty credentials show required field validation', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.requiredMessage.first()).toBeVisible();
  });

});
