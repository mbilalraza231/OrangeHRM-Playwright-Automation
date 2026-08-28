import { test, expect } from '../../fixtures/test-fixtures';
import type { EmployeeData } from '../../utils/test-data-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 04-edit-employee.spec.ts
 *
 * Searches for the employee created in 02, opens their Personal Details,
 * edits the Middle Name, saves, then navigates away and re-opens to verify
 * the change was persisted in the database.
 *
 * Reads employee data from test-data/runtime-state.json.
 * Uses PersonalDetailsPage POM for form interactions.
 */

const STATE_FILE    = path.join(__dirname, '../../test-data/runtime-state.json');
const UPDATED_MIDDLE = 'EditedMiddle';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe.serial('Edit Employee', () => {
  let employee: EmployeeData;

  test.beforeAll(async () => {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    employee = state.employee;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 5 — Search, open Edit, update Middle Name, save
  // ─────────────────────────────────────────────────────────────────────────
  test('5. Search employee, click Edit, update Middle Name and save', async ({ employeePage, personalDetailsPage }) => {
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows
      .filter({ hasText: employee.firstName })
      .first();

    await expect(matchingRow).toBeVisible();
    await expect(matchingRow).toContainText(employee.firstName);
    await expect(matchingRow).toContainText(employee.lastName);

    // Open Edit (pencil icon)
    await matchingRow.locator('.bi-pencil-fill').click();

    await expect(personalDetailsPage.page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(personalDetailsPage.heading).toBeVisible();

    // Wait for API to hydrate the form
    await expect(personalDetailsPage.firstNameInput)
      .toHaveValue(employee.firstName, { timeout: 15000 });

    // Edit the Middle Name field using POM locators
    await personalDetailsPage.middleNameInput.clear();
    await personalDetailsPage.middleNameInput.fill(UPDATED_MIDDLE);
    await expect(personalDetailsPage.middleNameInput).toHaveValue(UPDATED_MIDDLE);

    // Save using POM method
    await personalDetailsPage.saveForm();

    // Verify Middle Name on the same page after save
    await expect(personalDetailsPage.middleNameInput)
      .toHaveValue(UPDATED_MIDDLE, { timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Test 6 — Navigate away, re-open, assert Middle Name persisted in DB
  // ─────────────────────────────────────────────────────────────────────────
  test('6. Verify Middle Name persisted after navigating away and reopening', async ({ employeePage, personalDetailsPage }) => {
    // Navigate away to prove data was saved to the database
    await employeePage.navigateToList();
    await employeePage.verifyTableLoaded();

    await employeePage.searchEmployee(employee.firstName);

    const matchingRow = employeePage.tableRows
      .filter({ hasText: employee.firstName })
      .first();

    await expect(matchingRow).toBeVisible();

    // Open Edit again from a fresh load
    await matchingRow.locator('.bi-pencil-fill').click();

    await expect(personalDetailsPage.page).toHaveURL(/viewPersonalDetails/, { timeout: 30000 });
    await expect(personalDetailsPage.heading).toBeVisible();

    // Assert both values persisted in the database using POM locators
    await expect(personalDetailsPage.firstNameInput)
      .toHaveValue(employee.firstName, { timeout: 15000 });
    await expect(personalDetailsPage.middleNameInput)
      .toHaveValue(UPDATED_MIDDLE, { timeout: 15000 });
  });

});
