import { test, expect } from '../../fixtures/test-fixtures';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 04-edit-employee.spec.ts — Edits the Middle Name of the employee from spec 02,
 * saves, navigates away, and re-opens to verify the change persisted in the database.
 */

const STATE_FILE     = path.join(__dirname, '../../test-data/runtime-state.json');
const UPDATED_MIDDLE = 'EditedMiddle';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe.serial('Edit Employee', () => {
  let employee: EmployeeData;

  test.beforeAll(async () => {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    employee = state.employee;
  });

  test('5. Search employee, click Edit, update Middle Name and save', async ({ employeePage, personalDetailsPage }) => {
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();
    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows.filter({ hasText: employee.firstName }).first();
    await expect(matchingRow).toBeVisible();
    await expect(matchingRow).toContainText(employee.firstName);
    await expect(matchingRow).toContainText(employee.lastName);

    await matchingRow.locator('.bi-pencil-fill').click();
    await expect(personalDetailsPage.page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(personalDetailsPage.heading).toBeVisible();
    await expect(personalDetailsPage.firstNameInput).toHaveValue(employee.firstName, { timeout: 15000 });

    await personalDetailsPage.middleNameInput.clear();
    await personalDetailsPage.middleNameInput.fill(UPDATED_MIDDLE);
    await expect(personalDetailsPage.middleNameInput).toHaveValue(UPDATED_MIDDLE);

    await personalDetailsPage.saveForm();
    await expect(personalDetailsPage.middleNameInput).toHaveValue(UPDATED_MIDDLE, { timeout: 10000 });
  });

  test('6. Verify Middle Name persisted after navigating away and reopening', async ({ employeePage, personalDetailsPage }) => {
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();
    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows.filter({ hasText: employee.firstName }).first();
    await expect(matchingRow).toBeVisible();

    await matchingRow.locator('.bi-pencil-fill').click();
    await expect(personalDetailsPage.page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(personalDetailsPage.heading).toBeVisible();

    await expect(personalDetailsPage.firstNameInput).toHaveValue(employee.firstName, { timeout: 15000 });
    await expect(personalDetailsPage.middleNameInput).toHaveValue(UPDATED_MIDDLE, { timeout: 15000 });
  });

});
