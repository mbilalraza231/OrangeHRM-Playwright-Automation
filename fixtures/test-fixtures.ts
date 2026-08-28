import { test as base } from '@playwright/test';
import { LoginPage }          from '../pages/LoginPage';
import { DashboardPage }      from '../pages/DashboardPage';
import { EmployeePage }       from '../pages/EmployeePage';
import { LeavePage }          from '../pages/LeavePage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';

/**
 * test-fixtures.ts — Custom Playwright fixtures.
 *
 * Each fixture provides a pre-constructed Page Object.
 * Tests receive these as parameters — no manual instantiation needed.
 */
type Fixtures = {
  loginPage:           LoginPage;
  dashboardPage:       DashboardPage;
  employeePage:        EmployeePage;
  leavePage:           LeavePage;
  personalDetailsPage: PersonalDetailsPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  employeePage: async ({ page }, use) => {
    await use(new EmployeePage(page));
  },
  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },
  personalDetailsPage: async ({ page }, use) => {
    await use(new PersonalDetailsPage(page));
  },
});

export { expect } from '@playwright/test';
