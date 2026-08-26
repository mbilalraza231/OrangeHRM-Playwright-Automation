import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Dashboard Tests
 *
 * Verifies the dashboard is fully displayed after login:
 * URL, title, heading, sidebar navigation, user dropdown, and widgets.
 */
test.describe('OrangeHRM Dashboard', () => {

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('dashboard page has correct URL and title', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard\/index/);
    await expect(page).toHaveTitle(/OrangeHRM/);
  });

  test('dashboard heading is visible', async ({ dashboardPage }) => {
    await expect(dashboardPage.heading).toBeVisible();
  });

  test('sidebar navigation menu is present with expected items', async ({ dashboardPage, page }) => {
    await expect(dashboardPage.sidebarMenuItems.first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PIM' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leave' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });

  test('user dropdown is visible in the top bar', async ({ dashboardPage }) => {
    await expect(dashboardPage.userDropdown).toBeVisible();
  });

  test('dashboard widgets section is visible', async ({ page }) => {
    await expect(page.locator('.orangehrm-dashboard-widget').first()).toBeVisible();
  });

});

