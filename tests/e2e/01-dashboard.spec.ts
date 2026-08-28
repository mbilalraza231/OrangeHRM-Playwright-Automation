import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

/** 01-dashboard.spec.ts — Verifies the Dashboard is accessible with an authenticated session. */

test.use({ storageState: 'playwright/.auth/user.json' });

test('1. Verify Dashboard is accessible after login', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.goto();
  await dashboardPage.verifyDashboard();
  await expect(page).toHaveURL(/dashboard/);
  await expect(dashboardPage.heading).toBeVisible();
});
