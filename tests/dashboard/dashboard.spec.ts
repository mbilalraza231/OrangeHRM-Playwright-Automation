import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Dashboard Tests — Phase 5
 *
 * After login, test that the dashboard is fully displayed with all
 * expected elements. Practises multiple assertion types:
 *  - URL assertions
 *  - Title assertions
 *  - Text assertions
 *  - Visibility assertions
 *  - Element state
 */
test.describe('OrangeHRM Dashboard', () => {

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('dashboard page has correct URL and title', async ({ page }) => {
    // ✅ URL assertion
    await expect(page).toHaveURL(/dashboard\/index/);

    // ✅ Title assertion
    await expect(page).toHaveTitle(/OrangeHRM/);
  });

  test('dashboard heading is visible', async ({ dashboardPage }) => {
    // ✅ getByRole() — heading
    await expect(dashboardPage.heading).toBeVisible();
  });

  test('sidebar navigation menu is present with expected items', async ({ dashboardPage, page }) => {
    // ✅ locator() — sidebar menu items
    await expect(dashboardPage.sidebarMenuItems.first()).toBeVisible();

    // ✅ getByText() — check key nav links exist
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PIM' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leave' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });

  test('user dropdown is visible in the top bar', async ({ dashboardPage }) => {
    // ✅ locator() — top bar user dropdown
    await expect(dashboardPage.userDropdown).toBeVisible();
  });

  test('dashboard widgets section is visible', async ({ page }) => {
    // ✅ Check that at least one dashboard widget card is visible
    await expect(page.locator('.orangehrm-dashboard-widget').first()).toBeVisible();
  });

});
