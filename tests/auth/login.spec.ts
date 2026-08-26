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

  // ── POSITIVE ──────────────────────────────────────────────────────────────

  test('admin can log in with valid credentials and see Dashboard', async ({ loginPage, dashboardPage, page }) => {
    // ✅ getByPlaceholder() via POM — username + password
    // ✅ getByRole() via POM — login button
    await loginPage.login(users.admin.username, users.admin.password);

    // ✅ URL assertion — automatic waiting, no waitForTimeout()
    await expect(page).toHaveURL(/dashboard/);

    // ✅ getByRole() — Dashboard heading
    // ✅ locator() — sidebar menu item
    // ✅ getByText() — Dashboard nav text
    await dashboardPage.verifyDashboard();
  });

  // ── NEGATIVE ──────────────────────────────────────────────────────────────

  test('invalid credentials display an error message', async ({ loginPage, page }) => {
    await loginPage.login(users.invalidUser.username, users.invalidUser.password);

    // ✅ getByText() — error message
    await expect(loginPage.errorMessage).toBeVisible();

    // ✅ URL assertion — must stay on login page
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('valid username with wrong password shows an error', async ({ loginPage, page }) => {
    await loginPage.login(users.validUserWrongPass.username, users.validUserWrongPass.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('empty credentials show required field validation', async ({ loginPage }) => {
    // ✅ click without filling — triggers HTML5 / OrangeHRM validation
    await loginPage.loginButton.click();

    // ✅ getByText() — "Required" messages appear under empty fields
    await expect(loginPage.requiredMessage.first()).toBeVisible();
  });

});
